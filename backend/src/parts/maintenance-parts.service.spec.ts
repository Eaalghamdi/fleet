import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MaintenancePartsService } from './maintenance-parts.service';
import { PartsService } from './parts.service';
import { PrismaService } from '../prisma';
import { MaintenanceStatus, TrackingMode, CarType } from '@prisma/client';

describe('MaintenancePartsService', () => {
  let service: MaintenancePartsService;

  const mockMaintenance = {
    id: 'maintenance-123',
    carId: 'car-123',
    description: 'Regular maintenance',
    status: MaintenanceStatus.IN_PROGRESS,
    createdById: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockPartUsage = {
    id: 'usage-123',
    maintenanceRequestId: 'maintenance-123',
    partId: 'part-123',
    quantityUsed: 2,
    assignedById: 'user-123',
    assignedAt: new Date(),
  };

  const mockPrismaService = {
    maintenanceRequest: {
      findUnique: jest.fn(),
    },
    maintenancePartUsage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockPartsService = {
    findOne: jest.fn(),
    adjustQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenancePartsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PartsService,
          useValue: mockPartsService,
        },
      ],
    }).compile();

    service = module.get<MaintenancePartsService>(MaintenancePartsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignPart', () => {
    it('should assign a quantity-based part', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenance);
      mockPartsService.findOne.mockResolvedValue(mockQuantityPart);
      mockPartsService.adjustQuantity.mockResolvedValue({
        ...mockQuantityPart,
        quantity: 8,
      });
      mockPrismaService.maintenancePartUsage.create.mockResolvedValue(mockPartUsage);

      const result = await service.assignPart(
        'maintenance-123',
        { partId: 'part-123', quantity: 2 },
        'user-123',
      );

      expect(result).toEqual(mockPartUsage);
      expect(mockPartsService.adjustQuantity).toHaveBeenCalledWith('part-123', -2);
    });

    it('should assign a serial-number-based part', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenance);
      mockPartsService.findOne.mockResolvedValue(mockSerialPart);
      mockPrismaService.maintenancePartUsage.findFirst.mockResolvedValue(null);
      mockPrismaService.maintenancePartUsage.create.mockResolvedValue({
        ...mockPartUsage,
        partId: 'part-456',
        quantityUsed: 1,
      });

      const result = await service.assignPart(
        'maintenance-123',
        { partId: 'part-456' },
        'user-123',
      );

      expect(result.partId).toBe('part-456');
    });

    it('should throw NotFoundException when maintenance not found', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.assignPart('nonexistent', { partId: 'part-123' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when maintenance not in progress', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue({
        ...mockMaintenance,
        status: MaintenanceStatus.PENDING,
      });

      await expect(
        service.assignPart('maintenance-123', { partId: 'part-123' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when assigning serial part with quantity > 1', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenance);
      mockPartsService.findOne.mockResolvedValue(mockSerialPart);

      await expect(
        service.assignPart('maintenance-123', { partId: 'part-456', quantity: 2 }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when serial part already assigned', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenance);
      mockPartsService.findOne.mockResolvedValue(mockSerialPart);
      mockPrismaService.maintenancePartUsage.findFirst.mockResolvedValue(mockPartUsage);

      await expect(
        service.assignPart('maintenance-123', { partId: 'part-456' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPartsForMaintenance', () => {
    it('should return parts assigned to maintenance', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(mockMaintenance);
      mockPrismaService.maintenancePartUsage.findMany.mockResolvedValue([mockPartUsage]);

      const result = await service.getPartsForMaintenance('maintenance-123');

      expect(result).toEqual([mockPartUsage]);
    });

    it('should throw NotFoundException when maintenance not found', async () => {
      mockPrismaService.maintenanceRequest.findUnique.mockResolvedValue(null);

      await expect(service.getPartsForMaintenance('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removePartAssignment', () => {
    it('should remove assignment and return quantity to inventory', async () => {
      mockPrismaService.maintenancePartUsage.findUnique.mockResolvedValue({
        ...mockPartUsage,
        maintenanceRequest: mockMaintenance,
        part: mockQuantityPart,
      });
      mockPartsService.adjustQuantity.mockResolvedValue(mockQuantityPart);
      mockPrismaService.maintenancePartUsage.delete.mockResolvedValue(mockPartUsage);

      await service.removePartAssignment('usage-123', 'user-123');

      expect(mockPartsService.adjustQuantity).toHaveBeenCalledWith('part-123', 2);
      expect(mockPrismaService.maintenancePartUsage.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when usage not found', async () => {
      mockPrismaService.maintenancePartUsage.findUnique.mockResolvedValue(null);

      await expect(service.removePartAssignment('nonexistent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when maintenance not in progress', async () => {
      mockPrismaService.maintenancePartUsage.findUnique.mockResolvedValue({
        ...mockPartUsage,
        maintenanceRequest: {
          ...mockMaintenance,
          status: MaintenanceStatus.COMPLETED,
        },
        part: mockQuantityPart,
      });

      await expect(service.removePartAssignment('usage-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPartUsageHistory', () => {
    it('should return usage history for a part', async () => {
      mockPartsService.findOne.mockResolvedValue(mockQuantityPart);
      mockPrismaService.maintenancePartUsage.findMany.mockResolvedValue([mockPartUsage]);

      const result = await service.getPartUsageHistory('part-123');

      expect(result).toEqual([mockPartUsage]);
    });
  });
});
