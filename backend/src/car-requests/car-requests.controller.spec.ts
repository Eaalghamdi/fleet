import { Test, TestingModule } from '@nestjs/testing';
import { CarRequestsController } from './car-requests.controller';
import { CarRequestsService } from './car-requests.service';
import { CarType, CarRequestStatus, Department, Role } from '@prisma/client';

describe('CarRequestsController', () => {
  let controller: CarRequestsController;

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

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.OPERATION,
    role: Role.OPERATOR,
  };

  const mockCarRequestsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    assign: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    markInTransit: jest.fn(),
    confirmReturn: jest.fn(),
    getRequestsByUser: jest.fn(),
    getPendingRequests: jest.fn(),
    getAssignedRequests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarRequestsController],
      providers: [
        {
          provide: CarRequestsService,
          useValue: mockCarRequestsService,
        },
      ],
    }).compile();

    controller = module.get<CarRequestsController>(CarRequestsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of car requests', async () => {
      mockCarRequestsService.findAll.mockResolvedValue([mockCarRequest]);

      const result = await controller.findAll({});

      expect(result).toEqual([mockCarRequest]);
      expect(mockCarRequestsService.findAll).toHaveBeenCalled();
    });
  });

  describe('getMyRequests', () => {
    it('should return user requests', async () => {
      mockCarRequestsService.getRequestsByUser.mockResolvedValue([mockCarRequest]);

      const result = await controller.getMyRequests(mockUser);

      expect(result).toEqual([mockCarRequest]);
      expect(mockCarRequestsService.getRequestsByUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests', async () => {
      mockCarRequestsService.getPendingRequests.mockResolvedValue([mockCarRequest]);

      const result = await controller.getPendingRequests();

      expect(result).toEqual([mockCarRequest]);
      expect(mockCarRequestsService.getPendingRequests).toHaveBeenCalled();
    });
  });

  describe('getAssignedRequests', () => {
    it('should return assigned requests', async () => {
      mockCarRequestsService.getAssignedRequests.mockResolvedValue([mockCarRequest]);

      const result = await controller.getAssignedRequests();

      expect(result).toEqual([mockCarRequest]);
      expect(mockCarRequestsService.getAssignedRequests).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single car request', async () => {
      mockCarRequestsService.findOne.mockResolvedValue(mockCarRequest);

      const result = await controller.findOne('request-123');

      expect(result).toEqual(mockCarRequest);
      expect(mockCarRequestsService.findOne).toHaveBeenCalledWith('request-123');
    });
  });

  describe('create', () => {
    it('should create a new car request', async () => {
      const createDto = {
        requestedCarType: CarType.SEDAN,
        departureLocation: 'Office',
        destination: 'Airport',
        departureDatetime: '2025-06-01T10:00:00Z',
        returnDatetime: '2025-06-02T18:00:00Z',
      };
      mockCarRequestsService.create.mockResolvedValue(mockCarRequest);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockCarRequest);
      expect(mockCarRequestsService.create).toHaveBeenCalledWith(createDto, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a car request', async () => {
      const updateDto = { destination: 'New Destination' };
      mockCarRequestsService.update.mockResolvedValue({
        ...mockCarRequest,
        destination: 'New Destination',
      });

      const result = await controller.update('request-123', updateDto, mockUser);

      expect(result.destination).toBe('New Destination');
      expect(mockCarRequestsService.update).toHaveBeenCalledWith(
        'request-123',
        updateDto,
        mockUser.id,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a car request', async () => {
      mockCarRequestsService.cancel.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.CANCELLED,
      });

      const result = await controller.cancel('request-123', mockUser);

      expect(result.status).toBe(CarRequestStatus.CANCELLED);
      expect(mockCarRequestsService.cancel).toHaveBeenCalledWith('request-123', mockUser.id);
    });
  });

  describe('assign', () => {
    it('should assign a car to request', async () => {
      const assignDto = { carId: 'car-123', isRental: false };
      mockCarRequestsService.assign.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.ASSIGNED,
        requestedCarId: 'car-123',
      });

      const result = await controller.assign('request-123', assignDto, mockUser);

      expect(result.status).toBe(CarRequestStatus.ASSIGNED);
      expect(mockCarRequestsService.assign).toHaveBeenCalledWith(
        'request-123',
        assignDto,
        mockUser.id,
      );
    });
  });

  describe('approve', () => {
    it('should approve a car request', async () => {
      mockCarRequestsService.approve.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.APPROVED,
      });

      const result = await controller.approve('request-123', mockUser);

      expect(result.status).toBe(CarRequestStatus.APPROVED);
      expect(mockCarRequestsService.approve).toHaveBeenCalledWith('request-123', mockUser.id);
    });
  });

  describe('reject', () => {
    it('should reject a car request', async () => {
      mockCarRequestsService.reject.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.REJECTED,
      });

      const result = await controller.reject('request-123', mockUser);

      expect(result.status).toBe(CarRequestStatus.REJECTED);
      expect(mockCarRequestsService.reject).toHaveBeenCalledWith('request-123', mockUser.id);
    });
  });

  describe('markInTransit', () => {
    it('should mark request as in transit', async () => {
      mockCarRequestsService.markInTransit.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.IN_TRANSIT,
      });

      const result = await controller.markInTransit('request-123', mockUser);

      expect(result.status).toBe(CarRequestStatus.IN_TRANSIT);
      expect(mockCarRequestsService.markInTransit).toHaveBeenCalledWith('request-123', mockUser.id);
    });
  });

  describe('confirmReturn', () => {
    it('should confirm return', async () => {
      const returnDto = { returnConditionNotes: 'Good condition', currentMileage: 15000 };
      mockCarRequestsService.confirmReturn.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.RETURNED,
        returnConditionNotes: 'Good condition',
      });

      const result = await controller.confirmReturn('request-123', returnDto, mockUser);

      expect(result.status).toBe(CarRequestStatus.RETURNED);
      expect(mockCarRequestsService.confirmReturn).toHaveBeenCalledWith(
        'request-123',
        returnDto,
        mockUser.id,
      );
    });
  });
});
