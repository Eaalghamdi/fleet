import { Test, TestingModule } from '@nestjs/testing';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { PurchaseRequestsService } from './purchase-requests.service';
import { MaintenancePartsService } from './maintenance-parts.service';
import { CarType, TrackingMode, PurchaseRequestStatus, Department, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('PartsController', () => {
  let controller: PartsController;

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

  const mockPartUsage = {
    id: 'usage-123',
    maintenanceRequestId: 'maintenance-123',
    partId: 'part-123',
    quantityUsed: 2,
    assignedById: 'user-123',
    assignedAt: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.GARAGE,
    role: Role.OPERATOR,
  };

  const mockPartsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    getLowStockParts: jest.fn(),
  };

  const mockPurchaseRequestsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    getPendingRequests: jest.fn(),
  };

  const mockMaintenancePartsService = {
    assignPart: jest.fn(),
    getPartsForMaintenance: jest.fn(),
    removePartAssignment: jest.fn(),
    getPartUsageHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartsController],
      providers: [
        {
          provide: PartsService,
          useValue: mockPartsService,
        },
        {
          provide: PurchaseRequestsService,
          useValue: mockPurchaseRequestsService,
        },
        {
          provide: MaintenancePartsService,
          useValue: mockMaintenancePartsService,
        },
      ],
    }).compile();

    controller = module.get<PartsController>(PartsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Parts endpoints
  describe('findAllParts', () => {
    it('should return an array of parts', async () => {
      mockPartsService.findAll.mockResolvedValue([mockQuantityPart]);

      const result = await controller.findAllParts({});

      expect(result).toEqual([mockQuantityPart]);
    });
  });

  describe('findOnePart', () => {
    it('should return a single part', async () => {
      mockPartsService.findOne.mockResolvedValue(mockQuantityPart);

      const result = await controller.findOnePart('part-123');

      expect(result).toEqual(mockQuantityPart);
    });
  });

  describe('createPart', () => {
    it('should create a new part', async () => {
      mockPartsService.create.mockResolvedValue(mockQuantityPart);

      const result = await controller.createPart({
        name: 'Oil Filter',
        carType: CarType.SEDAN,
        carModel: 'Toyota Camry',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 10,
      });

      expect(result).toEqual(mockQuantityPart);
    });
  });

  describe('updatePart', () => {
    it('should update a part', async () => {
      mockPartsService.update.mockResolvedValue({
        ...mockQuantityPart,
        quantity: 15,
      });

      const result = await controller.updatePart('part-123', { quantity: 15 });

      expect(result.quantity).toBe(15);
    });
  });

  describe('deletePart', () => {
    it('should delete a part', async () => {
      mockPartsService.softDelete.mockResolvedValue(mockQuantityPart);

      await controller.deletePart('part-123');

      expect(mockPartsService.softDelete).toHaveBeenCalledWith('part-123');
    });
  });

  describe('getLowStockParts', () => {
    it('should return low stock parts', async () => {
      mockPartsService.getLowStockParts.mockResolvedValue([mockQuantityPart]);

      const result = await controller.getLowStockParts('5');

      expect(result).toEqual([mockQuantityPart]);
    });
  });

  // Purchase request endpoints
  describe('findAllPurchaseRequests', () => {
    it('should return an array of purchase requests', async () => {
      mockPurchaseRequestsService.findAll.mockResolvedValue([mockPurchaseRequest]);

      const result = await controller.findAllPurchaseRequests({});

      expect(result).toEqual([mockPurchaseRequest]);
    });
  });

  describe('createPurchaseRequest', () => {
    it('should create a purchase request', async () => {
      mockPurchaseRequestsService.create.mockResolvedValue(mockPurchaseRequest);

      const result = await controller.createPurchaseRequest(
        {
          partName: 'Oil Filter',
          quantity: 10,
          estimatedCost: 100,
          vendor: 'AutoParts Inc',
        },
        mockUser,
      );

      expect(result).toEqual(mockPurchaseRequest);
    });
  });

  describe('approvePurchaseRequest', () => {
    it('should approve a purchase request', async () => {
      mockPurchaseRequestsService.approve.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.APPROVED,
      });

      const result = await controller.approvePurchaseRequest('purchase-123', mockUser);

      expect(result.status).toBe(PurchaseRequestStatus.APPROVED);
    });
  });

  describe('rejectPurchaseRequest', () => {
    it('should reject a purchase request', async () => {
      mockPurchaseRequestsService.reject.mockResolvedValue({
        ...mockPurchaseRequest,
        status: PurchaseRequestStatus.REJECTED,
      });

      const result = await controller.rejectPurchaseRequest('purchase-123', mockUser);

      expect(result.status).toBe(PurchaseRequestStatus.REJECTED);
    });
  });

  // Maintenance parts endpoints
  describe('getMaintenanceParts', () => {
    it('should return parts for maintenance', async () => {
      mockMaintenancePartsService.getPartsForMaintenance.mockResolvedValue([mockPartUsage]);

      const result = await controller.getMaintenanceParts('maintenance-123');

      expect(result).toEqual([mockPartUsage]);
    });
  });

  describe('assignPart', () => {
    it('should assign a part to maintenance', async () => {
      mockMaintenancePartsService.assignPart.mockResolvedValue(mockPartUsage);

      const result = await controller.assignPart(
        'maintenance-123',
        { partId: 'part-123', quantity: 2 },
        mockUser,
      );

      expect(result).toEqual(mockPartUsage);
    });
  });

  describe('removePartAssignment', () => {
    it('should remove a part assignment', async () => {
      mockMaintenancePartsService.removePartAssignment.mockResolvedValue(undefined);

      await controller.removePartAssignment('usage-123', mockUser);

      expect(mockMaintenancePartsService.removePartAssignment).toHaveBeenCalledWith(
        'usage-123',
        mockUser.id,
      );
    });
  });

  describe('getPartUsageHistory', () => {
    it('should return part usage history', async () => {
      mockMaintenancePartsService.getPartUsageHistory.mockResolvedValue([mockPartUsage]);

      const result = await controller.getPartUsageHistory('part-123');

      expect(result).toEqual([mockPartUsage]);
    });
  });
});
