import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceStatus, MaintenanceType, Department, Role } from '@prisma/client';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;

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

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.GARAGE,
    role: Role.OPERATOR,
  };

  const mockMaintenanceService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    triage: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    startWork: jest.fn(),
    complete: jest.fn(),
    getPendingRequests: jest.fn(),
    getPendingApprovalRequests: jest.fn(),
    getActiveMaintenanceForCar: jest.fn(),
    getMaintenanceHistory: jest.fn(),
    getMaintenanceSchedule: jest.fn(),
    getCarsNeedingMaintenance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of maintenance requests', async () => {
      mockMaintenanceService.findAll.mockResolvedValue([mockMaintenanceRequest]);

      const result = await controller.findAll({});

      expect(result).toEqual([mockMaintenanceRequest]);
      expect(mockMaintenanceService.findAll).toHaveBeenCalled();
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests', async () => {
      mockMaintenanceService.getPendingRequests.mockResolvedValue([mockMaintenanceRequest]);

      const result = await controller.getPendingRequests();

      expect(result).toEqual([mockMaintenanceRequest]);
      expect(mockMaintenanceService.getPendingRequests).toHaveBeenCalled();
    });
  });

  describe('getPendingApprovalRequests', () => {
    it('should return pending approval requests', async () => {
      mockMaintenanceService.getPendingApprovalRequests.mockResolvedValue([mockMaintenanceRequest]);

      const result = await controller.getPendingApprovalRequests();

      expect(result).toEqual([mockMaintenanceRequest]);
      expect(mockMaintenanceService.getPendingApprovalRequests).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance request', async () => {
      mockMaintenanceService.findOne.mockResolvedValue(mockMaintenanceRequest);

      const result = await controller.findOne('maintenance-123');

      expect(result).toEqual(mockMaintenanceRequest);
      expect(mockMaintenanceService.findOne).toHaveBeenCalledWith('maintenance-123');
    });
  });

  describe('create', () => {
    it('should create a new maintenance request', async () => {
      const createDto = {
        carId: 'car-123',
        description: 'Regular maintenance check',
      };
      mockMaintenanceService.create.mockResolvedValue(mockMaintenanceRequest);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockMaintenanceRequest);
      expect(mockMaintenanceService.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('triage', () => {
    it('should triage a maintenance request', async () => {
      const triageDto = { maintenanceType: MaintenanceType.INTERNAL };
      mockMaintenanceService.triage.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.PENDING_APPROVAL,
      });

      const result = await controller.triage('maintenance-123', triageDto, mockUser);

      expect(result.status).toBe(MaintenanceStatus.PENDING_APPROVAL);
      expect(mockMaintenanceService.triage).toHaveBeenCalledWith(
        'maintenance-123',
        triageDto,
        mockUser.id,
      );
    });
  });

  describe('approve', () => {
    it('should approve a maintenance request', async () => {
      mockMaintenanceService.approve.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.APPROVED,
      });

      const result = await controller.approve('maintenance-123', mockUser);

      expect(result.status).toBe(MaintenanceStatus.APPROVED);
      expect(mockMaintenanceService.approve).toHaveBeenCalledWith('maintenance-123', mockUser.id);
    });
  });

  describe('reject', () => {
    it('should reject a maintenance request', async () => {
      mockMaintenanceService.reject.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.REJECTED,
      });

      const result = await controller.reject('maintenance-123', mockUser);

      expect(result.status).toBe(MaintenanceStatus.REJECTED);
      expect(mockMaintenanceService.reject).toHaveBeenCalledWith('maintenance-123', mockUser.id);
    });
  });

  describe('startWork', () => {
    it('should start work on a maintenance request', async () => {
      mockMaintenanceService.startWork.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.IN_PROGRESS,
      });

      const result = await controller.startWork('maintenance-123', mockUser);

      expect(result.status).toBe(MaintenanceStatus.IN_PROGRESS);
      expect(mockMaintenanceService.startWork).toHaveBeenCalledWith('maintenance-123', mockUser.id);
    });
  });

  describe('complete', () => {
    it('should complete a maintenance request', async () => {
      const completeDto = { completionNotes: 'Work completed successfully' };
      mockMaintenanceService.complete.mockResolvedValue({
        ...mockMaintenanceRequest,
        status: MaintenanceStatus.COMPLETED,
      });

      const result = await controller.complete('maintenance-123', completeDto, mockUser);

      expect(result.status).toBe(MaintenanceStatus.COMPLETED);
      expect(mockMaintenanceService.complete).toHaveBeenCalledWith(
        'maintenance-123',
        completeDto,
        mockUser.id,
      );
    });
  });

  describe('getMaintenanceHistory', () => {
    it('should return maintenance history for a car', async () => {
      mockMaintenanceService.getMaintenanceHistory.mockResolvedValue([mockMaintenanceRequest]);

      const result = await controller.getMaintenanceHistory('car-123');

      expect(result).toEqual([mockMaintenanceRequest]);
      expect(mockMaintenanceService.getMaintenanceHistory).toHaveBeenCalledWith('car-123');
    });
  });

  describe('getMaintenanceSchedule', () => {
    it('should return maintenance schedule for a car', async () => {
      const scheduleData = {
        car: { id: 'car-123', model: 'Toyota Camry', licensePlate: 'ABC-1234' },
        nextMaintenanceDate: new Date(),
        maintenanceIntervalMonths: 6,
        lastMaintenance: null,
        maintenanceHistory: [],
      };
      mockMaintenanceService.getMaintenanceSchedule.mockResolvedValue(scheduleData);

      const result = await controller.getMaintenanceSchedule('car-123');

      expect(result).toEqual(scheduleData);
      expect(mockMaintenanceService.getMaintenanceSchedule).toHaveBeenCalledWith('car-123');
    });
  });

  describe('getActiveMaintenanceForCar', () => {
    it('should return active maintenance for a car', async () => {
      mockMaintenanceService.getActiveMaintenanceForCar.mockResolvedValue(mockMaintenanceRequest);

      const result = await controller.getActiveMaintenanceForCar('car-123');

      expect(result).toEqual(mockMaintenanceRequest);
      expect(mockMaintenanceService.getActiveMaintenanceForCar).toHaveBeenCalledWith('car-123');
    });

    it('should return null when no active maintenance', async () => {
      mockMaintenanceService.getActiveMaintenanceForCar.mockResolvedValue(null);

      const result = await controller.getActiveMaintenanceForCar('car-123');

      expect(result).toBeNull();
    });
  });

  describe('getCarsNeedingMaintenance', () => {
    it('should return cars needing maintenance', async () => {
      const carsData = [
        {
          id: 'car-123',
          model: 'Toyota Camry',
          licensePlate: 'ABC-1234',
          nextMaintenanceDate: new Date(),
          daysUntilDue: 10,
        },
      ];
      mockMaintenanceService.getCarsNeedingMaintenance.mockResolvedValue(carsData);

      const result = await controller.getCarsNeedingMaintenance();

      expect(result).toEqual(carsData);
      expect(mockMaintenanceService.getCarsNeedingMaintenance).toHaveBeenCalled();
    });
  });
});
