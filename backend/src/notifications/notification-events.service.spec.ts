import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsService } from './notification-events.service';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType, Department } from '@prisma/client';

describe('NotificationEventsService', () => {
  let service: NotificationEventsService;

  const mockNotification = {
    id: 'notification-123',
    userId: 'user-123',
    type: NotificationType.CAR_REQUEST_CREATED,
    title: 'New Car Request',
    message: 'Test message',
    entityType: 'CarRequest',
    entityId: 'request-123',
    isRead: false,
    createdAt: new Date(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
    getUsersByDepartment: jest.fn(),
  };

  const mockGateway = {
    sendToUser: jest.fn(),
    sendToDepartment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationEventsService>(NotificationEventsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onCarRequestCreated', () => {
    it('should notify garage department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue([
        'garage-user-1',
        'garage-user-2',
      ]);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onCarRequestCreated(
        'requester-123',
        { requestedBy: 'John', destination: 'Airport' },
        'request-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.GARAGE);
      expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
      expect(mockGateway.sendToUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('onCarRequestAssigned', () => {
    it('should notify requester and admin department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['admin-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onCarRequestAssigned(
        'requester-123',
        { carModel: 'Toyota Camry', assignedBy: 'Garage Staff' },
        'request-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(mockGateway.sendToUser).toHaveBeenCalledWith(
        'requester-123',
        NotificationType.CAR_REQUEST_ASSIGNED,
        expect.any(Object),
      );
    });
  });

  describe('onCarRequestApproved', () => {
    it('should notify requester', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onCarRequestApproved('requester-123', { approvedBy: 'Admin' }, 'request-123');

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'requester-123',
          type: NotificationType.CAR_REQUEST_APPROVED,
        }),
      );
      expect(mockGateway.sendToUser).toHaveBeenCalled();
    });
  });

  describe('onCarRequestRejected', () => {
    it('should notify requester', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onCarRequestRejected('requester-123', { rejectedBy: 'Admin' }, 'request-123');

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'requester-123',
          type: NotificationType.CAR_REQUEST_REJECTED,
        }),
      );
    });
  });

  describe('onMaintenanceCreated', () => {
    it('should notify maintenance department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue([
        'maint-user-1',
        'maint-user-2',
      ]);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onMaintenanceCreated(
        { maintenanceDescription: 'Oil change' },
        'maintenance-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(
        Department.MAINTENANCE,
      );
      expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('onMaintenanceTriaged', () => {
    it('should notify creator and admin department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['admin-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onMaintenanceTriaged(
        'creator-123',
        { maintenanceType: 'internal' },
        'maintenance-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(mockGateway.sendToUser).toHaveBeenCalledWith(
        'creator-123',
        NotificationType.MAINTENANCE_TRIAGED,
        expect.any(Object),
      );
    });
  });

  describe('onMaintenanceApproved', () => {
    it('should notify creator and maintenance department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['maint-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onMaintenanceApproved(
        'creator-123',
        { approvedBy: 'Admin' },
        'maintenance-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(mockGateway.sendToUser).toHaveBeenCalled();
    });
  });

  describe('onMaintenanceRejected', () => {
    it('should notify creator', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onMaintenanceRejected(
        'creator-123',
        { rejectedBy: 'Admin' },
        'maintenance-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'creator-123',
          type: NotificationType.MAINTENANCE_REJECTED,
        }),
      );
    });
  });

  describe('onMaintenanceCompleted', () => {
    it('should notify garage department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['garage-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onMaintenanceCompleted(
        'creator-123',
        { carModel: 'Toyota Camry' },
        'maintenance-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.GARAGE);
    });
  });

  describe('onPurchaseRequestCreated', () => {
    it('should notify admin department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['admin-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onPurchaseRequestCreated(
        { partName: 'Oil Filter', quantity: 10, vendor: 'AutoParts Inc' },
        'purchase-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.ADMIN);
    });
  });

  describe('onPurchaseRequestApproved', () => {
    it('should notify requester', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onPurchaseRequestApproved(
        'requester-123',
        { partName: 'Oil Filter', approvedBy: 'Admin' },
        'purchase-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'requester-123',
          type: NotificationType.PURCHASE_REQUEST_APPROVED,
        }),
      );
    });
  });

  describe('onPurchaseRequestRejected', () => {
    it('should notify requester', async () => {
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onPurchaseRequestRejected(
        'requester-123',
        { partName: 'Oil Filter', rejectedBy: 'Admin' },
        'purchase-123',
      );

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'requester-123',
          type: NotificationType.PURCHASE_REQUEST_REJECTED,
        }),
      );
    });
  });

  describe('onCarInventoryRequestCreated', () => {
    it('should notify admin department', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['admin-user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onCarInventoryRequestCreated({ licensePlate: 'ABC-123' }, 'inventory-123');

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.ADMIN);
    });
  });

  describe('onScheduledMaintenanceApproaching', () => {
    it('should notify garage and maintenance departments', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onScheduledMaintenanceApproaching(
        { carModel: 'Toyota Camry', licensePlate: 'ABC-123', dueDate: '2024-01-15' },
        'car-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.GARAGE);
      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(
        Department.MAINTENANCE,
      );
    });
  });

  describe('onScheduledMaintenanceOverdue', () => {
    it('should notify garage, maintenance, and admin departments', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onScheduledMaintenanceOverdue(
        { carModel: 'Toyota Camry', licensePlate: 'ABC-123' },
        'car-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.GARAGE);
      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(
        Department.MAINTENANCE,
      );
      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.ADMIN);
    });
  });

  describe('onWarrantyExpiring', () => {
    it('should notify garage and admin departments', async () => {
      mockNotificationsService.getUsersByDepartment.mockResolvedValue(['user-1']);
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      await service.onWarrantyExpiring(
        { carModel: 'Toyota Camry', licensePlate: 'ABC-123', daysUntilDue: 30 },
        'car-123',
      );

      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.GARAGE);
      expect(mockNotificationsService.getUsersByDepartment).toHaveBeenCalledWith(Department.ADMIN);
    });
  });
});
