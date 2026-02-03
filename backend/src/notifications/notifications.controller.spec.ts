import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationType, Department, Role } from '@prisma/client';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockUser: CurrentUserData = {
    id: 'user-123',
    username: 'testuser',
    department: Department.OPERATION,
    role: Role.OPERATOR,
  };

  const mockNotification = {
    id: 'notification-123',
    userId: 'user-123',
    type: NotificationType.CAR_REQUEST_CREATED,
    title: 'New Car Request',
    message: 'A new car request has been created.',
    entityType: 'CarRequest',
    entityId: 'request-123',
    isRead: false,
    createdAt: new Date(),
  };

  const mockNotificationsService = {
    findAllForUser: jest.fn(),
    findOne: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications for user', async () => {
      mockNotificationsService.findAllForUser.mockResolvedValue([mockNotification]);

      const result = await controller.findAll(mockUser, {});

      expect(result).toEqual([mockNotification]);
      expect(mockNotificationsService.findAllForUser).toHaveBeenCalledWith('user-123', {});
    });

    it('should filter notifications', async () => {
      mockNotificationsService.findAllForUser.mockResolvedValue([mockNotification]);

      await controller.findAll(mockUser, { isRead: false });

      expect(mockNotificationsService.findAllForUser).toHaveBeenCalledWith('user-123', {
        isRead: false,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual({ count: 5 });
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findOne', () => {
    it('should return a notification', async () => {
      mockNotificationsService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne('notification-123', mockUser);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationsService.findOne).toHaveBeenCalledWith('notification-123', 'user-123');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await controller.markAsRead('notification-123', mockUser);

      expect(result.isRead).toBe(true);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        'notification-123',
        'user-123',
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual({ count: 5 });
      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      mockNotificationsService.delete.mockResolvedValue(undefined);

      await controller.delete('notification-123', mockUser);

      expect(mockNotificationsService.delete).toHaveBeenCalledWith('notification-123', 'user-123');
    });
  });
});
