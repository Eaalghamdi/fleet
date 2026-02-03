import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../prisma';
import { MaintenanceStatus, MaintenanceType, CarStatus, CarType } from '@prisma/client';

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  const mockCar = {
    id: 'car-123',
    model: 'Toyota Camry',
    type: CarType.SEDAN,
    licensePlate: 'ABC-1234',
    status: CarStatus.AVAILABLE,
    maintenanceIntervalMonths: 6,
    nextMaintenanceDate: null,
  };

  const mockMaintenanceRequest = {
    id: 'maintenance-123',
    carId: 'car-123',
    description: 'Regular maintenance check',
    maintenanceType: null,
    externalVendor: null,
    externalCost: null,
    status: MaintenanceStatus.PENDING,
    createdById: 'user-123',
    triagedById: null,
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    maintenanceRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    car: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of maintenance requests', async () => {
      const requests = [mockMaintenanceRequest];
      mockPrismaService.maintenanceRequest.findMany.mockResolvedValue(requests);

      const result = await service.findAll();

      expect(result).toEqual(requests);
      expect(mockPrismaService.maintenanceRequest.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      mockPrismaService.maintenanceRequest.findMany.mockResolvedValue([mockMaintenanceRequest]);

      await service.findAll({ status: MaintenanceStatus.PENDING });

      expect(mockPrismaService.maintenanceRequest.findMany).toHaveBeenCalled();
    });

    it('should filter by car ID', async () => {
      mockPrismaService.maintenanceRequest.findMany.mockResolvedValue([mockMaintenanceRequest]);

      await service.findAll({ carId: 'car-123' });

      expect(mockPrismaService.maintenanceRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a maintenance request when found', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      const result = await service.findOne('maintenance-123');

      expect(result).toEqual(mockMaintenanceRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      carId: 'car-123',
      description: 'Regular maintenance check',
    };

    it('should create a new maintenance request', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.maintenanceRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.maintenanceRequest.create.mockResolvedValue(mockMaintenanceRequest);

      const result = await service.create(createDto, 'user-123');

      expect(result).toEqual(mockMaintenanceRequest);
      expect(mockPrismaService.maintenanceRequest.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when car is deleted', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.DELETED,
      });

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when car has active maintenance', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.maintenanceRequest.findFirst.mockResolvedValue(mockMaintenanceRequest);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('triage', () => {
    it('should triage a pending maintenance request', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.PENDING_APPROVAL,
        maintenanceType: MaintenanceType.INTERNAL,
      });

      const result = await service.triage(
        'maintenance-123',
        { maintenanceType: MaintenanceType.INTERNAL },
        'user-456',
      );

      expect(result.status).toBe(MaintenanceStatus.PENDING_APPROVAL);
    });

    it('should require external vendor for external maintenance', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      await expect(
        service.triage(
          'maintenance-123',
          { maintenanceType: MaintenanceType.EXTERNAL },
          'user-456',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.COMPLETED,
      });

      await expect(
        service.triage(
          'maintenance-123',
          { maintenanceType: MaintenanceType.INTERNAL },
          'user-456',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a pending approval request', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.PENDING_APPROVAL,
      });
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.APPROVED,
      });

      const result = await service.approve('maintenance-123', 'admin-123');

      expect(result.status).toBe(MaintenanceStatus.APPROVED);
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      await expect(service.approve('maintenance-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending approval request', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.PENDING_APPROVAL,
      });
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.REJECTED,
      });

      const result = await service.reject('maintenance-123', 'admin-123');

      expect(result.status).toBe(MaintenanceStatus.REJECTED);
    });
  });

  describe('startWork', () => {
    it('should start work on approved request and update car status', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.APPROVED,
      });
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.UNDER_MAINTENANCE,
      });
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.IN_PROGRESS,
      });

      const result = await service.startWork('maintenance-123', 'user-123');

      expect(result.status).toBe(MaintenanceStatus.IN_PROGRESS);
      expect(mockPrismaService.car.update).toHaveBeenCalledWith({
        where: { id: mockMaintenanceRequest.carId },
        data: { status: CarStatus.UNDER_MAINTENANCE },
      });
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      await expect(service.startWork('maintenance-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('should complete maintenance and make car available', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.IN_PROGRESS,
      });
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.AVAILABLE,
      });
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.COMPLETED,
      });

      const result = await service.complete('maintenance-123', {}, 'user-123');

      expect(result.status).toBe(MaintenanceStatus.COMPLETED);
      expect(mockPrismaService.car.update).toHaveBeenCalled();
    });

    it('should update next maintenance date when car has interval', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.IN_PROGRESS,
      });
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue(mockCar);
      mockPrismaService.maintenanceRequest.update.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.COMPLETED,
      });

      await service.complete('maintenance-123', {}, 'user-123');

      const updateCalls = mockPrismaService.car.update.mock.calls as Array<
        [{ data: { nextMaintenanceDate?: Date } }]
      >;
      expect(updateCalls[0][0].data.nextMaintenanceDate).toBeDefined();
    });

    it('should throw BadRequestException for invalid state transition', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      await expect(service.complete('maintenance-123', {}, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMaintenanceSchedule', () => {
    it('should return maintenance schedule for a car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.maintenanceRequest.findMany.mockResolvedValue([]);

      const result = await service.getMaintenanceSchedule('car-123');

      expect(result.car.id).toBe('car-123');
      expect(result.maintenanceIntervalMonths).toBe(6);
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.getMaintenanceSchedule('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCarsNeedingMaintenance', () => {
    it('should return cars with upcoming maintenance', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      mockPrismaService.car.findMany.mockResolvedValue([
        {
          ...mockCar,
          nextMaintenanceDate: futureDate,
        },
      ]);

      const result = await service.getCarsNeedingMaintenance();

      expect(result.length).toBe(1);
      expect(result[0].daysUntilDue).toBeLessThanOrEqual(30);
    });
  });

  describe('state transitions', () => {
    it('should not allow PENDING -> APPROVED directly', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenanceRequest);

      await expect(service.approve('maintenance-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not allow COMPLETED -> any state', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.COMPLETED,
      });

      await expect(
        service.triage(
          'maintenance-123',
          { maintenanceType: MaintenanceType.INTERNAL },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow REJECTED -> any state', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.REJECTED,
      });

      await expect(service.startWork('maintenance-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
