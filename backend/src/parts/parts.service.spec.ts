import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PrismaService } from '../prisma';
import { CarType, TrackingMode } from '@prisma/client';

describe('PartsService', () => {
  let service: PartsService;

  const mockQuantityPart = {
    id: 'part-123',
    name: 'Oil Filter',
    carType: CarType.SEDAN,
    carModel: 'Toyota Camry',
    trackingMode: TrackingMode.QUANTITY,
    quantity: 10,
    serialNumber: null,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSerialPart = {
    id: 'part-456',
    name: 'Engine ECU',
    carType: CarType.SEDAN,
    carModel: 'Toyota Camry',
    trackingMode: TrackingMode.SERIAL_NUMBER,
    quantity: 1,
    serialNumber: 'ECU-001',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    part: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PartsService>(PartsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of parts', async () => {
      mockPrismaService.part.findMany.mockResolvedValue([mockQuantityPart]);

      const result = await service.findAll();

      expect(result).toEqual([mockQuantityPart]);
      expect(mockPrismaService.part.findMany).toHaveBeenCalled();
    });

    it('should filter by car type', async () => {
      mockPrismaService.part.findMany.mockResolvedValue([mockQuantityPart]);

      await service.findAll({ carType: CarType.SEDAN });

      expect(mockPrismaService.part.findMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      mockPrismaService.part.findMany.mockResolvedValue([mockQuantityPart]);

      await service.findAll({ search: 'Oil' });

      expect(mockPrismaService.part.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a part when found', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);

      const result = await service.findOne('part-123');

      expect(result).toEqual(mockQuantityPart);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when part is deleted', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue({
        ...mockQuantityPart,
        isDeleted: true,
      });

      await expect(service.findOne('part-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a quantity-based part', async () => {
      mockPrismaService.part.create.mockResolvedValue(mockQuantityPart);

      const result = await service.create({
        name: 'Oil Filter',
        carType: CarType.SEDAN,
        carModel: 'Toyota Camry',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 10,
      });

      expect(result).toEqual(mockQuantityPart);
    });

    it('should create a serial-number-based part', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(null);
      mockPrismaService.part.create.mockResolvedValue(mockSerialPart);

      const result = await service.create({
        name: 'Engine ECU',
        carType: CarType.SEDAN,
        carModel: 'Toyota Camry',
        trackingMode: TrackingMode.SERIAL_NUMBER,
        serialNumber: 'ECU-001',
      });

      expect(result).toEqual(mockSerialPart);
    });

    it('should throw BadRequestException when quantity missing for quantity tracking', async () => {
      await expect(
        service.create({
          name: 'Oil Filter',
          carType: CarType.SEDAN,
          carModel: 'Toyota Camry',
          trackingMode: TrackingMode.QUANTITY,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when serial number missing for serial tracking', async () => {
      await expect(
        service.create({
          name: 'Engine ECU',
          carType: CarType.SEDAN,
          carModel: 'Toyota Camry',
          trackingMode: TrackingMode.SERIAL_NUMBER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when serial number already exists', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockSerialPart);

      await expect(
        service.create({
          name: 'Engine ECU',
          carType: CarType.SEDAN,
          carModel: 'Toyota Camry',
          trackingMode: TrackingMode.SERIAL_NUMBER,
          serialNumber: 'ECU-001',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when serial number provided for quantity tracking', async () => {
      await expect(
        service.create({
          name: 'Oil Filter',
          carType: CarType.SEDAN,
          carModel: 'Toyota Camry',
          trackingMode: TrackingMode.QUANTITY,
          quantity: 10,
          serialNumber: 'INVALID',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a part', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);
      mockPrismaService.part.update.mockResolvedValue({
        ...mockQuantityPart,
        name: 'Updated Oil Filter',
      });

      const result = await service.update('part-123', { name: 'Updated Oil Filter' });

      expect(result.name).toBe('Updated Oil Filter');
    });

    it('should update quantity for quantity-tracked parts', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);
      mockPrismaService.part.update.mockResolvedValue({
        ...mockQuantityPart,
        quantity: 15,
      });

      const result = await service.update('part-123', { quantity: 15 });

      expect(result.quantity).toBe(15);
    });

    it('should throw BadRequestException when updating quantity for serial-tracked parts', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockSerialPart);

      await expect(service.update('part-456', { quantity: 5 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a part', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);
      mockPrismaService.part.update.mockResolvedValue({
        ...mockQuantityPart,
        isDeleted: true,
      });

      const result = await service.softDelete('part-123');

      expect(result.isDeleted).toBe(true);
    });
  });

  describe('adjustQuantity', () => {
    it('should increase quantity', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);
      mockPrismaService.part.update.mockResolvedValue({
        ...mockQuantityPart,
        quantity: 15,
      });

      const result = await service.adjustQuantity('part-123', 5);

      expect(result.quantity).toBe(15);
    });

    it('should decrease quantity', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);
      mockPrismaService.part.update.mockResolvedValue({
        ...mockQuantityPart,
        quantity: 5,
      });

      const result = await service.adjustQuantity('part-123', -5);

      expect(result.quantity).toBe(5);
    });

    it('should throw BadRequestException for insufficient quantity', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockQuantityPart);

      await expect(service.adjustQuantity('part-123', -20)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for serial-tracked parts', async () => {
      mockPrismaService.part.findUnique.mockResolvedValue(mockSerialPart);

      await expect(service.adjustQuantity('part-456', 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLowStockParts', () => {
    it('should return parts with low stock', async () => {
      mockPrismaService.part.findMany.mockResolvedValue([{ ...mockQuantityPart, quantity: 2 }]);

      const result = await service.getLowStockParts(5);

      expect(result.length).toBe(1);
    });
  });
});
