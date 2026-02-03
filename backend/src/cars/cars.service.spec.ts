import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CarsService } from './cars.service';
import { PrismaService } from '../prisma';
import { CarType, CarStatus } from '@prisma/client';

describe('CarsService', () => {
  let service: CarsService;

  const mockCar = {
    id: 'car-123',
    model: 'Toyota Camry',
    type: CarType.SEDAN,
    year: 2023,
    color: 'White',
    licensePlate: 'ABC-1234',
    vin: 'VIN123456789',
    mileage: 10000,
    warrantyExpiry: new Date('2025-12-31'),
    status: CarStatus.AVAILABLE,
    maintenanceIntervalMonths: 6,
    nextMaintenanceDate: new Date('2024-06-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    car: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    carRequest: {
      count: jest.fn(),
    },
    maintenanceRequest: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cars excluding deleted ones', async () => {
      const cars = [mockCar];
      mockPrismaService.car.findMany.mockResolvedValue(cars);

      const result = await service.findAll();

      expect(result).toEqual(cars);
      expect(mockPrismaService.car.findMany).toHaveBeenCalledWith({
        where: { status: { not: CarStatus.DELETED } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by type', async () => {
      const findManySpy = jest
        .spyOn(mockPrismaService.car, 'findMany')
        .mockResolvedValue([mockCar]);

      await service.findAll({ type: CarType.SEDAN });

      expect(findManySpy).toHaveBeenCalled();
      const callArgs = findManySpy.mock.calls[0][0] as { where: { type?: string } };
      expect(callArgs.where.type).toBe(CarType.SEDAN);
    });

    it('should filter by status', async () => {
      const findManySpy = jest
        .spyOn(mockPrismaService.car, 'findMany')
        .mockResolvedValue([mockCar]);

      await service.findAll({ status: CarStatus.AVAILABLE });

      expect(findManySpy).toHaveBeenCalled();
      const callArgs = findManySpy.mock.calls[0][0] as { where: { status?: string } };
      expect(callArgs.where.status).toBe(CarStatus.AVAILABLE);
    });

    it('should filter by search term', async () => {
      const findManySpy = jest
        .spyOn(mockPrismaService.car, 'findMany')
        .mockResolvedValue([mockCar]);

      await service.findAll({ search: 'Toyota' });

      expect(findManySpy).toHaveBeenCalled();
      const callArgs = findManySpy.mock.calls[0][0] as {
        where: { OR?: Array<{ model?: { contains: string } }> };
      };
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR?.[0]?.model?.contains).toBe('Toyota');
    });
  });

  describe('findOne', () => {
    it('should return a car with history when found', async () => {
      const carWithHistory = {
        ...mockCar,
        carRequests: [],
        maintenanceRequests: [],
      };
      mockPrismaService.car.findUnique.mockResolvedValue(carWithHistory);

      const result = await service.findOne('car-123');

      expect(result).toEqual(carWithHistory);
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createCarDto = {
      model: 'Honda Accord',
      type: CarType.SEDAN,
      year: 2024,
      color: 'Black',
      licensePlate: 'XYZ-5678',
      vin: 'VIN987654321',
    };

    it('should create a new car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);
      mockPrismaService.car.create.mockResolvedValue({
        ...mockCar,
        ...createCarDto,
      });

      const result = await service.create(createCarDto);

      expect(result.model).toBe('Honda Accord');
      expect(mockPrismaService.car.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when license plate already exists', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);

      await expect(service.create(createCarDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        color: 'Red',
      });

      const result = await service.update('car-123', { color: 'Red' });

      expect(result.color).toBe('Red');
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { color: 'Red' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when updating deleted car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.DELETED,
      });

      await expect(service.update('car-123', { color: 'Red' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a car by setting status to DELETED', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carRequest.count.mockResolvedValue(0);
      mockPrismaService.maintenanceRequest.count.mockResolvedValue(0);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.DELETED,
      });

      const result = await service.softDelete('car-123');

      expect(result.status).toBe(CarStatus.DELETED);
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when car has active requests', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carRequest.count.mockResolvedValue(1);

      await expect(service.softDelete('car-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when car has active maintenance', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.carRequest.count.mockResolvedValue(0);
      mockPrismaService.maintenanceRequest.count.mockResolvedValue(1);

      await expect(service.softDelete('car-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkAvailability', () => {
    it('should return true when car is available', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);

      const result = await service.checkAvailability('car-123');

      expect(result).toBe(true);
    });

    it('should return false when car is not available', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.ASSIGNED,
      });

      const result = await service.checkAvailability('car-123');

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when car not found', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.checkAvailability('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableCars', () => {
    it('should return only available cars', async () => {
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);

      const result = await service.getAvailableCars();

      expect(result).toEqual([mockCar]);
      expect(mockPrismaService.car.findMany).toHaveBeenCalledWith({
        where: { status: CarStatus.AVAILABLE },
        orderBy: { model: 'asc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update car status', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(mockCar);
      mockPrismaService.car.update.mockResolvedValue({
        ...mockCar,
        status: CarStatus.ASSIGNED,
      });

      const result = await service.updateStatus('car-123', CarStatus.ASSIGNED);

      expect(result.status).toBe(CarStatus.ASSIGNED);
    });

    it('should throw BadRequestException when updating deleted car', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({
        ...mockCar,
        status: CarStatus.DELETED,
      });

      await expect(service.updateStatus('car-123', CarStatus.AVAILABLE)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCarsWithExpiringWarranty', () => {
    it('should return cars with warranty expiring within specified days', async () => {
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);

      const result = await service.getCarsWithExpiringWarranty(30);

      expect(result).toEqual([mockCar]);
      expect(mockPrismaService.car.findMany).toHaveBeenCalled();
    });
  });

  describe('getCarsNeedingMaintenance', () => {
    it('should return cars needing maintenance', async () => {
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);

      const result = await service.getCarsNeedingMaintenance();

      expect(result).toEqual([mockCar]);
      expect(mockPrismaService.car.findMany).toHaveBeenCalled();
    });
  });
});
