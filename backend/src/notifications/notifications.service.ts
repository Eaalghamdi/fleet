import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateNotificationDto, NotificationFilterDto } from './dto';
import { Notification, NotificationType, Department } from '@prisma/client';
import { generateNotification, NotificationContext } from './notification-templates';

export interface NotificationWithUser extends Notification {
  user: {
    id: string;
    fullName: string;
    department: Department;
  };
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });
  }

  async createFromTemplate(
    userId: string,
    type: NotificationType,
    context: NotificationContext = {},
    entityType?: string,
    entityId?: string,
  ): Promise<Notification> {
    const template = generateNotification(type, context);

    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType,
        entityId,
      },
    });
  }

  async createBulkFromTemplate(
    userIds: string[],
    type: NotificationType,
    context: NotificationContext = {},
    entityType?: string,
    entityId?: string,
  ): Promise<{ count: number }> {
    const template = generateNotification(type, context);

    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType,
        entityId,
      })),
    });
  }

  async findAllForUser(userId: string, filters?: NotificationFilterDto): Promise<Notification[]> {
    const where: Record<string, unknown> = { userId };

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    await this.findOne(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async getUsersByDepartment(department: Department): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { department, isActive: true },
      select: { id: true },
    });

    return users.map((u) => u.id);
  }

  async notifyDepartment(
    department: Department,
    type: NotificationType,
    context: NotificationContext = {},
    entityType?: string,
    entityId?: string,
  ): Promise<{ count: number }> {
    const userIds = await this.getUsersByDepartment(department);
    return this.createBulkFromTemplate(userIds, type, context, entityType, entityId);
  }
}
