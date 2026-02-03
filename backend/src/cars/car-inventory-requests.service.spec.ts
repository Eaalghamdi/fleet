import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CarInventoryRequestsService } from './car-inventory-requests.service';
import { PrismaService } from '../prisma';
import {
  CarType,
  CarStatus,
  CarInventoryRequestType,
  CarInventoryRequestStatus,
} from '@prisma/client';

describe('CarInventoryRequestsService', () => {
  let service: CarInventoryRequestsService;

  const mockCar = {
    id: 'car-123',
    model: 'Toyota Camry',
    type: CarType.SEDAN,
    year: 2023,
    color: 'White',
    licensePlate: 'ABC-1234',
    vin: 'VIN123456789',
    status: CarStatus.AVAILABLE,
  };

  const mockRequest = {
    id: 'request-123',
    type: CarInventoryRequestType.ADD,
    carId: null,
    status: CarInventoryRequestStatus.PENDING_APPROVAL,
    carData: {
      model: 'Honda Accord',
      type: 'SEDAN',
      year: 2024,
      color: 'Black',
      licensePlate: 'XYZ-5678',
      vin: 'VIN987654321',
    },
    createdById: 'user-123',
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeleteRequest = {
    id: 'request-456',
    type: CarInventoryRequestType.DELETE,
    carId: 'car-123',
    status: CarInventoryRequestStatus.PENDING_APPROVAL,
    carData: null,
    createdById: 'user-123',
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    carInventoryRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    car: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    carRequest: {
      count: jest.fn(),
    },
    maintenanceRequest: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarInventoryRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CarInventoryRequestsService>(CarInventoryRequestsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      const requests = [mockRequest];
      mockPrismaService.carInventoryRequest.findMany.mockResolvedValue(requests);

      const result = await service.findAll();

      expect(result).toEqual(requests);
    });

    it('should filter by status', async () => {
      mockPrismaService.carInventoryRequest.findMany.mockResolvedValue([mockRequest]);

      await service.findAll(CarInventoryRequestStatus.PENDING_APPROVAL);

      expect(mockPrismaService.carInventoryRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: CarInventoryRequestStatus.PENDING_APPROVAL },
        }),
      );
    });
  });

  describe('findPending', () => {
    it('should return only pending requests', async () => {
      mockPrismaService.carInventoryRequest.findMany.mockResolvedValue([mockRequest]);

      await service.findPending();

      expect(mockPrismaService.carInventoryRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: CarInventoryRequestStatus.PENDING_APPROVAL },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a request when found', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(mockRequest);

      const result = await service.findOne('request-123');

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAddRequest', () => {
    const addDto = {
      type: CarInventoryRequestType.ADD,
      model: 'Honda Accord',
      carType: CarType.SEDAN,
      year: 2024,
      color: 'Black',
      licensePlate: 'XYZ-5678',
      vin: 'VIN987654321',
    };

    it('should create an add request', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);
      mockPrismaService.carInventoryRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.carInventoryRequest.create.mockResolvedValue(mockRequest);

      const result = await service.createAddRequest(addDto, 'user-123');

      expect(result).toEqual(mockRequest);
      expect(mockPrismaService.carInventoryRequest.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for wrong type', async () => {
      const wrongDto = { ...addDto, type: CarInventoryRequestType.DELETE };

      await expect(service.createAddRequest(wrongDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when license plate exists', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);

      await expect(service.createAddRequest(addDto, 'user-123')).rejects.toThrow(ConflictException);
    });
  });

  describe('createDeleteRequest', () => {
    it('should create a delete request', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carInventoryRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.carInventoryRequest.create.mockResolvedValue(mockDeleteRequest);

      const result = await service.createDeleteRequest('car-123', 'user-123');

      expect(result).toEqual(mockDeleteRequest);
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.createDeleteRequest('nonexistent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when car is already deleted', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.DELETED,
      });

      await expect(service.createDeleteRequest('car-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when pending delete request exists', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carInventoryRequest.findFirst.mockResolvedValue(mockDeleteRequest);

      await expect(service.createDeleteRequest('car-123', 'user-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('approve', () => {
    it('should approve an add request and create the car', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.car.findUnique.mockResolvedValue(null);
      mockPrismaService.carInventoryRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockRequest, status: CarInventoryRequestStatus.APPROVED },
        mockCar,
      ]);

      const result = await service.approve('request-123', 'admin-123');

      expect(result.status).toBe(CarInventoryRequestStatus.APPROVED);
    });

    it('should approve a delete request and soft-delete the car', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(mockDeleteRequest);
      mockPrismaService.carRequest.count.mockResolvedValue(0);
      mockPrismaService.maintenanceRequest.count.mockResolvedValue(0);
      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockDeleteRequest, status: CarInventoryRequestStatus.APPROVED },
        { ...mockCar, status: CarStatus.DELETED },
      ]);

      const result = await service.approve('request-456', 'admin-123');

      expect(result.status).toBe(CarInventoryRequestStatus.APPROVED);
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(null);

      await expect(service.approve('nonexistent', 'admin-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when request is not pending', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        status: CarInventoryRequestStatus.APPROVED,
      });

      await expect(service.approve('request-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a request', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.carInventoryRequest.update.mockResolvedValue({
        ...mockRequest,
        status: CarInventoryRequestStatus.REJECTED,
      });

      const result = await service.reject('request-123', 'admin-123');

      expect(result.status).toBe(CarInventoryRequestStatus.REJECTED);
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue(null);

      await expect(service.reject('nonexistent', 'admin-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when request is not pending', async () => {
      mockPrismaService.carInventoryRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        status: CarInventoryRequestStatus.REJECTED,
      });

      await expect(service.reject('request-123', 'admin-123')).rejects.toThrow(BadRequestException);
    });
  });
});
