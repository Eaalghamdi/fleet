import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PrismaService } from '../prisma';
import { PurchaseRequestStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;

  const mockPurchaseRequest = {
    id: 'purchase-123',
    partName: 'Oil Filter',
    quantity: 10,
    estimatedCost: new Decimal(100),
    vendor: 'AutoParts Inc',
    status: PurchaseRequestStatus.PENDING_APPROVAL,
    createdById: 'user-123',
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    purchaseRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of purchase requests', async () => {
      mockPrismaService.purchaseRequest.findMany.mockResolvedValue([mockPurchaseRequest]);

      const result = await service.findAll();

      expect(result).toEqual([mockPurchaseRequest]);
    });

    it('should filter by status', async () => {
      mockPrismaService.purchaseRequest.findMany.mockResolvedValue([mockPurchaseRequest]);

      await service.findAll({ status: PurchaseRequestStatus.PENDING_APPROVAL });

      expect(mockPrismaService.purchaseRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a purchase request when found', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue(mockPurchaseRequest);

      const result = await service.findOne('purchase-123');

      expect(result).toEqual(mockPurchaseRequest);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a purchase request', async () => {
      mockPrismaService.purchaseRequest.create.mockResolvedValue(mockPurchaseRequest);

      const result = await service.create(
        {
          partName: 'Oil Filter',
          quantity: 10,
          estimatedCost: 100,
          vendor: 'AutoParts Inc',
        },
        'user-123',
      );

      expect(result).toEqual(mockPurchaseRequest);
    });
  });

  describe('approve', () => {
    it('should approve a pending request', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue(mockPurchaseRequest);
      mockPrismaService.purchaseRequest.update.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.APPROVED,
      });

      const result = await service.approve('purchase-123', 'admin-123');

      expect(result.status).toBe(PurchaseRequestStatus.APPROVED);
    });

    it('should throw BadRequestException when not in pending status', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.APPROVED,
      });

      await expect(service.approve('purchase-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending request', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue(mockPurchaseRequest);
      mockPrismaService.purchaseRequest.update.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.REJECTED,
      });

      const result = await service.reject('purchase-123', 'admin-123');

      expect(result.status).toBe(PurchaseRequestStatus.REJECTED);
    });

    it('should throw BadRequestException when not in pending status', async () => {
      mockPrismaService.purchaseRequest.findUnique.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.REJECTED,
      });

      await expect(service.reject('purchase-123', 'admin-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests', async () => {
      mockPrismaService.purchaseRequest.findMany.mockResolvedValue([mockPurchaseRequest]);

      const result = await service.getPendingRequests();

      expect(result).toEqual([mockPurchaseRequest]);
    });
  });
});
