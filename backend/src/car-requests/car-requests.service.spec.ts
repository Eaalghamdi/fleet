import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CarRequestsService } from './car-requests.service';
import { PrismaService } from '../prisma';
import { CarType, CarRequestStatus, CarStatus } from '@prisma/client';

describe('CarRequestsService', () => {
  let service: CarRequestsService;

  const mockCarRequest = {
    id: 'request-123',
    requestedCarType: CarType.SEDAN,
    requestedCarId: null,
    isRental: false,
    rentalCompanyId: null,
    departureLocation: 'Office',
    destination: 'Airport',
    departureDatetime: new Date('2025-06-01T10:00:00Z'),
    returnDatetime: new Date('2025-06-02T18:00:00Z'),
    description: 'Business trip',
    status: CarRequestStatus.PENDING,
    returnConditionNotes: null,
    createdById: 'user-123',
    assignedById: null,
    approvedById: null,
    cancelledById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCar = {
    id: 'car-123',
    model: 'Toyota Camry',
    type: CarType.SEDAN,
    licensePlate: 'ABC-1234',
    status: CarStatus.AVAILABLE,
  };

  const mockRentalCompany = {
    id: 'rental-123',
    name: 'Enterprise',
    isActive: true,
  };

  const mockPrismaService = {
    carRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    car: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    rentalCompany: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CarRequestsService>(CarRequestsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of car requests', async () => {
      const requests = [mockCarRequest];
      mockPrismaService.carRequest.findMany.mockResolvedValue(requests);

      const result = await service.findAll();

      expect(result).toEqual(requests);
      expect(mockPrismaService.carRequest.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      mockPrismaService.carRequest.findMany.mockResolvedValue([mockCarRequest]);

      await service.findAll({ status: CarRequestStatus.PENDING });

      expect(mockPrismaService.carRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a car request when found', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      const result = await service.findOne('request-123');

      expect(result).toEqual(mockCarRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      requestedCarType: CarType.SEDAN,
      departureLocation: 'Office',
      destination: 'Airport',
      departureDatetime: new Date(Date.now() + 86400000).toISOString(),
      returnDatetime: new Date(Date.now() + 172800000).toISOString(),
    };

    it('should create a new car request', async () => {
      mockPrismaService.carRequest.create.mockResolvedValue(mockCarRequest);

      const result = await service.create(createDto, 'user-123');

      expect(result).toEqual(mockCarRequest);
      expect(mockPrismaService.carRequest.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when return is before departure', async () => {
      const invalidDto = {
        ...createDto,
        departureDatetime: new Date(Date.now() + 172800000).toISOString(),
        returnDatetime: new Date(Date.now() + 86400000).toISOString(),
      };

      await expect(service.create(invalidDto, 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when departure is in the past', async () => {
      const invalidDto = {
        ...createDto,
        departureDatetime: new Date(Date.now() - 86400000).toISOString(),
      };

      await expect(service.create(invalidDto, 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a pending request', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        destination: 'New Destination',
      });

      const result = await service.update(
        'request-123',
        { destination: 'New Destination' },
        'user-123',
      );

      expect(result.destination).toBe('New Destination');
    });

    it('should throw BadRequestException when not in PENDING status', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.APPROVED,
      });

      await expect(
        service.update('request-123', { destination: 'New' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not the creator', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(
        service.update('request-123', { destination: 'New' }, 'other-user'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending request', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.CANCELLED,
      });

      const result = await service.cancel('request-123', 'user-123');

      expect(result.status).toBe(CarRequestStatus.CANCELLED);
    });

    it('should throw BadRequestException when not in cancellable status', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.RETURNED,
      });

      await expect(service.cancel('request-123', 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not the creator', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(service.cancel('request-123', 'other-user')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('assign', () => {
    it('should assign a company car', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carRequest.findMany.mockResolvedValue([]);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.ASSIGNED,
      });
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.ASSIGNED,
        requestedCarId: 'car-123',
      });

      const result = await service.assign(
        'request-123',
        { carId: 'car-123', isRental: false },
        'garage-user',
      );

      expect(result.status).toBe(CarRequestStatus.ASSIGNED);
    });

    it('should assign a rental car', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.ASSIGNED,
        isRental: true,
        rentalCompanyId: 'rental-123',
      });

      const result = await service.assign(
        'request-123',
        { isRental: true, rentalCompanyId: 'rental-123' },
        'garage-user',
      );

      expect(result.status).toBe(CarRequestStatus.ASSIGNED);
      expect(result.isRental).toBe(true);
    });

    it('should throw ConflictException when car is not available', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.ASSIGNED,
      });

      await expect(
        service.assign('request-123', { carId: 'car-123', isRental: false }, 'garage-user'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('approve', () => {
    it('should approve an assigned request', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.ASSIGNED,
      });
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.APPROVED,
      });

      const result = await service.approve('request-123', 'admin-123');

      expect(result.status).toBe(CarRequestStatus.APPROVED);
    });

    it('should throw BadRequestException when not in ASSIGNED status', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(service.approve('request-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject an assigned request and release car', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.ASSIGNED,
        requestedCarId: 'car-123',
      });
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.ASSIGNED,
      });
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.AVAILABLE,
      });
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.REJECTED,
      });

      const result = await service.reject('request-123', 'admin-123');

      expect(result.status).toBe(CarRequestStatus.REJECTED);
      expect(mockPrismaService.car.update).toHaveBeenCalled();
    });
  });

  describe('markInTransit', () => {
    it('should mark approved request as in transit', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.APPROVED,
        requestedCarId: 'car-123',
      });
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.IN_TRANSIT,
      });
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.IN_TRANSIT,
      });

      const result = await service.markInTransit('request-123', 'user-123');

      expect(result.status).toBe(CarRequestStatus.IN_TRANSIT);
    });

    it('should throw BadRequestException when user is not the creator', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.APPROVED,
      });

      await expect(service.markInTransit('request-123', 'other-user')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmReturn', () => {
    it('should confirm return and release car', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.IN_TRANSIT,
        requestedCarId: 'car-123',
      });
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.AVAILABLE,
      });
      mockPrismaService.carRequest.update.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.RETURNED,
        returnConditionNotes: 'Good condition',
      });

      const result = await service.confirmReturn(
        'request-123',
        { returnConditionNotes: 'Good condition', currentMileage: 15000 },
        'garage-user',
      );

      expect(result.status).toBe(CarRequestStatus.RETURNED);
    });

    it('should throw BadRequestException when not in IN_TRANSIT status', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(service.confirmReturn('request-123', {}, 'garage-user')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('state transitions', () => {
    it('should not allow PENDING -> APPROVED', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(service.approve('request-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not allow RETURNED -> any state', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.RETURNED,
      });

      await expect(service.cancel('request-123', 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should not allow CANCELLED -> any state', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.CANCELLED,
      });

      await expect(
        service.assign('request-123', { carId: 'car-123' }, 'garage-user'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
