import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma';
import { NotificationType, Department } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;

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

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create({
        userId: 'user-123',
        type: NotificationType.CAR_REQUEST_CREATED,
        title: 'New Car Request',
        message: 'A new car request has been created.',
        entityType: 'CarRequest',
        entityId: 'request-123',
      });

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe('createFromTemplate', () => {
    it('should create a notification from template', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createFromTemplate(
        'user-123',
        NotificationType.CAR_REQUEST_CREATED,
        { requestedBy: 'John', destination: 'Airport' },
        'CarRequest',
        'request-123',
      );

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe('createBulkFromTemplate', () => {
    it('should create notifications for multiple users', async () => {
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 3 });

      const result = await service.createBulkFromTemplate(
        ['user-1', 'user-2', 'user-3'],
        NotificationType.CAR_REQUEST_CREATED,
        { requestedBy: 'John' },
        'CarRequest',
        'request-123',
      );

      expect(result.count).toBe(3);
      expect(mockPrismaService.notification.createMany).toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('should return all notifications for a user', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);

      const result = await service.findAllForUser('user-123');

      expect(result).toEqual([mockNotification]);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by isRead', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);

      await service.findAllForUser('user-123', { isRead: false });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by type', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);

      await service.findAllForUser('user-123', {
        type: NotificationType.CAR_REQUEST_CREATED,
      });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', type: NotificationType.CAR_REQUEST_CREATED },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a notification', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await service.findOne('notification-123', 'user-123');

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when notification belongs to another user', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        userId: 'other-user',
      });

      await expect(service.findOne('notification-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead('notification-123', 'user-123');

      expect(result.isRead).toBe(true);
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
        data: { isRead: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-123');

      expect(result.count).toBe(5);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrismaService.notification.delete.mockResolvedValue(mockNotification);

      await service.delete('notification-123', 'user-123');

      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrismaService.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('user-123');

      expect(result).toBe(3);
      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false },
      });
    });
  });

  describe('getUsersByDepartment', () => {
    it('should return user IDs for a department', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);

      const result = await service.getUsersByDepartment(Department.GARAGE);

      expect(result).toEqual(['user-1', 'user-2']);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { department: Department.GARAGE, isActive: true },
        select: { id: true },
      });
    });
  });

  describe('notifyDepartment', () => {
    it('should create notifications for all users in a department', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await service.notifyDepartment(
        Department.GARAGE,
        NotificationType.CAR_REQUEST_CREATED,
        { requestedBy: 'John' },
        'CarRequest',
        'request-123',
      );

      expect(result.count).toBe(2);
    });
  });
});
