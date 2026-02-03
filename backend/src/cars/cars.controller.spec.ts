import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarInventoryRequestsService } from './car-inventory-requests.service';
import {
  CarType,
  CarStatus,
  CarInventoryRequestType,
  CarInventoryRequestStatus,
  Department,
  Role,
} from '@prisma/client';

describe('CarsController', () => {
  let controller: CarsController;

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

  const mockInventoryRequest = {
    id: 'request-123',
    type: CarInventoryRequestType.ADD,
    carId: null,
    status: CarInventoryRequestStatus.PENDING_APPROVAL,
    carData: {},
    createdById: 'user-123',
    approvedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCarsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    getAvailableCars: jest.fn(),
    checkAvailability: jest.fn(),
    getCarsWithExpiringWarranty: jest.fn(),
    getCarsNeedingMaintenance: jest.fn(),
  };

  const mockCarInventoryRequestsService = {
    findAll: jest.fn(),
    findPending: jest.fn(),
    findOne: jest.fn(),
    createAddRequest: jest.fn(),
    createDeleteRequest: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.GARAGE,
    role: Role.OPERATOR,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
        {
          provide: CarInventoryRequestsService,
          useValue: mockCarInventoryRequestsService,
        },
      ],
    }).compile();

    controller = module.get<CarsController>(CarsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cars', async () => {
      mockCarsService.findAll.mockResolvedValue([mockCar]);

      const result = await controller.findAll({});

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getAvailableCars', () => {
    it('should return available cars', async () => {
      mockCarsService.getAvailableCars.mockResolvedValue([mockCar]);

      const result = await controller.getAvailableCars();

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.getAvailableCars).toHaveBeenCalled();
    });
  });

  describe('getCarsWithExpiringWarranty', () => {
    it('should return cars with expiring warranty', async () => {
      mockCarsService.getCarsWithExpiringWarranty.mockResolvedValue([mockCar]);

      const result = await controller.getCarsWithExpiringWarranty('30');

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.getCarsWithExpiringWarranty).toHaveBeenCalledWith(30);
    });

    it('should default to 30 days', async () => {
      mockCarsService.getCarsWithExpiringWarranty.mockResolvedValue([mockCar]);

      await controller.getCarsWithExpiringWarranty();

      expect(mockCarsService.getCarsWithExpiringWarranty).toHaveBeenCalledWith(30);
    });
  });

  describe('getCarsNeedingMaintenance', () => {
    it('should return cars needing maintenance', async () => {
      mockCarsService.getCarsNeedingMaintenance.mockResolvedValue([mockCar]);

      const result = await controller.getCarsNeedingMaintenance();

      expect(result).toEqual([mockCar]);
      expect(mockCarsService.getCarsNeedingMaintenance).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single car with history', async () => {
      const carWithHistory = { ...mockCar, carRequests: [], maintenanceRequests: [] };
      mockCarsService.findOne.mockResolvedValue(carWithHistory);

      const result = await controller.findOne('car-123');

      expect(result).toEqual(carWithHistory);
      expect(mockCarsService.findOne).toHaveBeenCalledWith('car-123');
    });
  });

  describe('checkAvailability', () => {
    it('should return availability status', async () => {
      mockCarsService.checkAvailability.mockResolvedValue(true);

      const result = await controller.checkAvailability('car-123');

      expect(result).toEqual({ available: true });
      expect(mockCarsService.checkAvailability).toHaveBeenCalledWith('car-123');
    });
  });

  describe('update', () => {
    it('should update and return the car', async () => {
      const updatedCar = { ...mockCar, color: 'Red' };
      mockCarsService.update.mockResolvedValue(updatedCar);

      const result = await controller.update('car-123', { color: 'Red' });

      expect(result.color).toBe('Red');
      expect(mockCarsService.update).toHaveBeenCalledWith('car-123', { color: 'Red' });
    });
  });

  describe('getPendingInventoryRequests', () => {
    it('should return pending inventory requests', async () => {
      mockCarInventoryRequestsService.findPending.mockResolvedValue([mockInventoryRequest]);

      const result = await controller.getPendingInventoryRequests();

      expect(result).toEqual([mockInventoryRequest]);
      expect(mockCarInventoryRequestsService.findPending).toHaveBeenCalled();
    });
  });

  describe('getAllInventoryRequests', () => {
    it('should return all inventory requests', async () => {
      mockCarInventoryRequestsService.findAll.mockResolvedValue([mockInventoryRequest]);

      const result = await controller.getAllInventoryRequests();

      expect(result).toEqual([mockInventoryRequest]);
      expect(mockCarInventoryRequestsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getInventoryRequest', () => {
    it('should return a single inventory request', async () => {
      mockCarInventoryRequestsService.findOne.mockResolvedValue(mockInventoryRequest);

      const result = await controller.getInventoryRequest('request-123');

      expect(result).toEqual(mockInventoryRequest);
      expect(mockCarInventoryRequestsService.findOne).toHaveBeenCalledWith('request-123');
    });
  });

  describe('createInventoryRequest', () => {
    it('should create an add request', async () => {
      const dto = {
        type: CarInventoryRequestType.ADD,
        model: 'Test Car',
        carType: CarType.SEDAN,
        year: 2024,
        color: 'Blue',
        licensePlate: 'TEST-123',
        vin: 'TEST123',
      };
      mockCarInventoryRequestsService.createAddRequest.mockResolvedValue(mockInventoryRequest);

      const result = await controller.createInventoryRequest(dto, mockUser);

      expect(result).toEqual(mockInventoryRequest);
      expect(mockCarInventoryRequestsService.createAddRequest).toHaveBeenCalledWith(
        dto,
        mockUser.id,
      );
    });

    it('should create a delete request', async () => {
      const dto = {
        type: CarInventoryRequestType.DELETE,
        carId: 'car-123',
      };
      mockCarInventoryRequestsService.createDeleteRequest.mockResolvedValue({
        ...mockInventoryRequest,
        type: CarInventoryRequestType.DELETE,
      });

      await controller.createInventoryRequest(dto, mockUser);

      expect(mockCarInventoryRequestsService.createDeleteRequest).toHaveBeenCalledWith(
        'car-123',
        mockUser.id,
      );
    });
  });

  describe('createDeleteRequest', () => {
    it('should create a delete request', async () => {
      mockCarInventoryRequestsService.createDeleteRequest.mockResolvedValue({
        ...mockInventoryRequest,
        type: CarInventoryRequestType.DELETE,
      });

      await controller.createDeleteRequest('car-123', mockUser);

      expect(mockCarInventoryRequestsService.createDeleteRequest).toHaveBeenCalledWith(
        'car-123',
        mockUser.id,
      );
    });
  });

  describe('approveInventoryRequest', () => {
    it('should approve an inventory request', async () => {
      const approvedRequest = {
        ...mockInventoryRequest,
        status: CarInventoryRequestStatus.APPROVED,
      };
      mockCarInventoryRequestsService.approve.mockResolvedValue(approvedRequest);

      const result = await controller.approveInventoryRequest('request-123', mockUser);

      expect(result.status).toBe(CarInventoryRequestStatus.APPROVED);
      expect(mockCarInventoryRequestsService.approve).toHaveBeenCalledWith(
        'request-123',
        mockUser.id,
      );
    });
  });

  describe('rejectInventoryRequest', () => {
    it('should reject an inventory request', async () => {
      const rejectedRequest = {
        ...mockInventoryRequest,
        status: CarInventoryRequestStatus.REJECTED,
      };
      mockCarInventoryRequestsService.reject.mockResolvedValue(rejectedRequest);

      const result = await controller.rejectInventoryRequest('request-123', mockUser);

      expect(result.status).toBe(CarInventoryRequestStatus.REJECTED);
      expect(mockCarInventoryRequestsService.reject).toHaveBeenCalledWith(
        'request-123',
        mockUser.id,
      );
    });
  });
});
