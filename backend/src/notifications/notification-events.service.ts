import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType, Department } from '@prisma/client';
import { generateNotification, NotificationContext } from './notification-templates';

@Injectable()
export class NotificationEventsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  // ==========================================
  // CAR REQUEST EVENTS
  // ==========================================

  async onCarRequestCreated(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_REQUEST_CREATED;
    const template = generateNotification(type, context);

    // Notify GARAGE department (they need to assign a car)
    const garageUsers = await this.notificationsService.getUsersByDepartment(Department.GARAGE);

    for (const userId of garageUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'CarRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'CarRequest',
        entityId,
        context,
      });
    }
  }

  async onCarRequestAssigned(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_REQUEST_ASSIGNED;
    const template = generateNotification(type, context);

    // Notify the requester
    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
      context,
    });

    // Notify ADMIN department for approval
    const adminUsers = await this.notificationsService.getUsersByDepartment(Department.ADMIN);

    for (const userId of adminUsers) {
      const adminNotification = await this.notificationsService.create({
        userId,
        type,
        title: 'Car Request Ready for Approval',
        message: `A car has been assigned to a request and is pending approval.`,
        entityType: 'CarRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: adminNotification.id,
        title: 'Car Request Ready for Approval',
        message: `A car has been assigned to a request and is pending approval.`,
        entityType: 'CarRequest',
        entityId,
        context,
      });
    }
  }

  async onCarRequestApproved(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_REQUEST_APPROVED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
      context,
    });
  }

  async onCarRequestRejected(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_REQUEST_REJECTED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
      context,
    });
  }

  async onCarInTransit(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_IN_TRANSIT;
    const template = generateNotification(type, context);

    // Notify GARAGE
    const garageUsers = await this.notificationsService.getUsersByDepartment(Department.GARAGE);

    for (const userId of garageUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'CarRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'CarRequest',
        entityId,
        context,
      });
    }
  }

  async onCarReturned(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_RETURNED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarRequest',
      entityId,
      context,
    });
  }

  // ==========================================
  // MAINTENANCE EVENTS
  // ==========================================

  async onMaintenanceCreated(context: NotificationContext, entityId: string): Promise<void> {
    const type = NotificationType.MAINTENANCE_REQUEST_CREATED;
    const template = generateNotification(type, context);

    // Notify MAINTENANCE department
    const maintenanceUsers = await this.notificationsService.getUsersByDepartment(
      Department.MAINTENANCE,
    );

    for (const userId of maintenanceUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'MaintenanceRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'MaintenanceRequest',
        entityId,
        context,
      });
    }
  }

  async onMaintenanceTriaged(
    creatorId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.MAINTENANCE_TRIAGED;
    const template = generateNotification(type, context);

    // Notify the creator
    const notification = await this.notificationsService.create({
      userId: creatorId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
    });

    this.gateway.sendToUser(creatorId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
      context,
    });

    // Notify ADMIN for approval
    const adminUsers = await this.notificationsService.getUsersByDepartment(Department.ADMIN);

    for (const userId of adminUsers) {
      const adminNotification = await this.notificationsService.create({
        userId,
        type,
        title: 'Maintenance Request Pending Approval',
        message: `A maintenance request has been triaged and is pending approval.`,
        entityType: 'MaintenanceRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: adminNotification.id,
        title: 'Maintenance Request Pending Approval',
        message: `A maintenance request has been triaged and is pending approval.`,
        entityType: 'MaintenanceRequest',
        entityId,
        context,
      });
    }
  }

  async onMaintenanceApproved(
    creatorId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.MAINTENANCE_APPROVED;
    const template = generateNotification(type, context);

    // Notify the creator
    const notification = await this.notificationsService.create({
      userId: creatorId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
    });

    this.gateway.sendToUser(creatorId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
      context,
    });

    // Notify MAINTENANCE department
    const maintenanceUsers = await this.notificationsService.getUsersByDepartment(
      Department.MAINTENANCE,
    );

    for (const userId of maintenanceUsers) {
      const maintNotification = await this.notificationsService.create({
        userId,
        type,
        title: 'Maintenance Request Approved',
        message: `A maintenance request has been approved and is ready to start.`,
        entityType: 'MaintenanceRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: maintNotification.id,
        title: 'Maintenance Request Approved',
        message: `A maintenance request has been approved and is ready to start.`,
        entityType: 'MaintenanceRequest',
        entityId,
        context,
      });
    }
  }

  async onMaintenanceRejected(
    creatorId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.MAINTENANCE_REJECTED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: creatorId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
    });

    this.gateway.sendToUser(creatorId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'MaintenanceRequest',
      entityId,
      context,
    });
  }

  async onMaintenanceCompleted(
    creatorId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.MAINTENANCE_COMPLETED;
    const template = generateNotification(type, context);

    // Notify GARAGE (car is ready)
    const garageUsers = await this.notificationsService.getUsersByDepartment(Department.GARAGE);

    for (const userId of garageUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'MaintenanceRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'MaintenanceRequest',
        entityId,
        context,
      });
    }
  }

  // ==========================================
  // PURCHASE REQUEST EVENTS
  // ==========================================

  async onPurchaseRequestCreated(context: NotificationContext, entityId: string): Promise<void> {
    const type = NotificationType.PURCHASE_REQUEST_CREATED;
    const template = generateNotification(type, context);

    // Notify ADMIN department
    const adminUsers = await this.notificationsService.getUsersByDepartment(Department.ADMIN);

    for (const userId of adminUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'PurchaseRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'PurchaseRequest',
        entityId,
        context,
      });
    }
  }

  async onPurchaseRequestApproved(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.PURCHASE_REQUEST_APPROVED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'PurchaseRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'PurchaseRequest',
      entityId,
      context,
    });
  }

  async onPurchaseRequestRejected(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.PURCHASE_REQUEST_REJECTED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'PurchaseRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'PurchaseRequest',
      entityId,
      context,
    });
  }

  // ==========================================
  // CAR INVENTORY EVENTS
  // ==========================================

  async onCarInventoryRequestCreated(
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_INVENTORY_REQUEST_CREATED;
    const template = generateNotification(type, context);

    // Notify ADMIN department
    const adminUsers = await this.notificationsService.getUsersByDepartment(Department.ADMIN);

    for (const userId of adminUsers) {
      const notification = await this.notificationsService.create({
        userId,
        type,
        title: template.title,
        message: template.message,
        entityType: 'CarInventoryRequest',
        entityId,
      });

      this.gateway.sendToUser(userId, type, {
        id: notification.id,
        title: template.title,
        message: template.message,
        entityType: 'CarInventoryRequest',
        entityId,
        context,
      });
    }
  }

  async onCarInventoryRequestApproved(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_INVENTORY_REQUEST_APPROVED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarInventoryRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarInventoryRequest',
      entityId,
      context,
    });
  }

  async onCarInventoryRequestRejected(
    requesterId: string,
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.CAR_INVENTORY_REQUEST_REJECTED;
    const template = generateNotification(type, context);

    const notification = await this.notificationsService.create({
      userId: requesterId,
      type,
      title: template.title,
      message: template.message,
      entityType: 'CarInventoryRequest',
      entityId,
    });

    this.gateway.sendToUser(requesterId, type, {
      id: notification.id,
      title: template.title,
      message: template.message,
      entityType: 'CarInventoryRequest',
      entityId,
      context,
    });
  }

  // ==========================================
  // SYSTEM NOTIFICATIONS
  // ==========================================

  async onScheduledMaintenanceApproaching(
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.SCHEDULED_MAINTENANCE_APPROACHING;
    const template = generateNotification(type, context);

    // Notify GARAGE and MAINTENANCE
    const departments = [Department.GARAGE, Department.MAINTENANCE];

    for (const dept of departments) {
      const users = await this.notificationsService.getUsersByDepartment(dept);

      for (const userId of users) {
        const notification = await this.notificationsService.create({
          userId,
          type,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
        });

        this.gateway.sendToUser(userId, type, {
          id: notification.id,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
          context,
        });
      }
    }
  }

  async onScheduledMaintenanceOverdue(
    context: NotificationContext,
    entityId: string,
  ): Promise<void> {
    const type = NotificationType.SCHEDULED_MAINTENANCE_OVERDUE;
    const template = generateNotification(type, context);

    // Notify GARAGE, MAINTENANCE, and ADMIN
    const departments = [Department.GARAGE, Department.MAINTENANCE, Department.ADMIN];

    for (const dept of departments) {
      const users = await this.notificationsService.getUsersByDepartment(dept);

      for (const userId of users) {
        const notification = await this.notificationsService.create({
          userId,
          type,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
        });

        this.gateway.sendToUser(userId, type, {
          id: notification.id,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
          context,
        });
      }
    }
  }

  async onWarrantyExpiring(context: NotificationContext, entityId: string): Promise<void> {
    const type = NotificationType.WARRANTY_EXPIRING;
    const template = generateNotification(type, context);

    // Notify GARAGE and ADMIN
    const departments = [Department.GARAGE, Department.ADMIN];

    for (const dept of departments) {
      const users = await this.notificationsService.getUsersByDepartment(dept);

      for (const userId of users) {
        const notification = await this.notificationsService.create({
          userId,
          type,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
        });

        this.gateway.sendToUser(userId, type, {
          id: notification.id,
          title: template.title,
          message: template.message,
          entityType: 'Car',
          entityId,
          context,
        });
      }
    }
  }
}
