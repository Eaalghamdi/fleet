import { NotificationType } from '@prisma/client';
import { generateNotification, NotificationContext } from './notification-templates';

describe('NotificationTemplates', () => {
  describe('generateNotification', () => {
    describe('Car Request Notifications', () => {
      it('should generate CAR_REQUEST_CREATED notification', () => {
        const context: NotificationContext = {
          requestedBy: 'John Doe',
          destination: 'Airport',
        };

        const result = generateNotification(NotificationType.CAR_REQUEST_CREATED, context);

        expect(result.title).toBe('New Car Request');
        expect(result.message).toContain('John Doe');
        expect(result.message).toContain('Airport');
      });

      it('should generate CAR_REQUEST_ASSIGNED notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
          assignedBy: 'Garage Staff',
        };

        const result = generateNotification(NotificationType.CAR_REQUEST_ASSIGNED, context);

        expect(result.title).toBe('Car Assigned to Request');
        expect(result.message).toContain('Toyota Camry');
        expect(result.message).toContain('Garage Staff');
      });

      it('should generate CAR_REQUEST_APPROVED notification', () => {
        const context: NotificationContext = {
          approvedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.CAR_REQUEST_APPROVED, context);

        expect(result.title).toBe('Car Request Approved');
        expect(result.message).toContain('Admin User');
      });

      it('should generate CAR_REQUEST_REJECTED notification', () => {
        const context: NotificationContext = {
          rejectedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.CAR_REQUEST_REJECTED, context);

        expect(result.title).toBe('Car Request Rejected');
        expect(result.message).toContain('Admin User');
      });

      it('should generate CAR_IN_TRANSIT notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
          destination: 'Downtown Office',
        };

        const result = generateNotification(NotificationType.CAR_IN_TRANSIT, context);

        expect(result.title).toBe('Car In Transit');
        expect(result.message).toContain('Toyota Camry');
        expect(result.message).toContain('Downtown Office');
      });

      it('should generate CAR_RETURNED notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
        };

        const result = generateNotification(NotificationType.CAR_RETURNED, context);

        expect(result.title).toBe('Car Returned');
        expect(result.message).toContain('Toyota Camry');
      });
    });

    describe('Maintenance Notifications', () => {
      it('should generate MAINTENANCE_REQUEST_CREATED notification', () => {
        const context: NotificationContext = {
          maintenanceDescription: 'Oil change and tire rotation',
        };

        const result = generateNotification(NotificationType.MAINTENANCE_REQUEST_CREATED, context);

        expect(result.title).toBe('New Maintenance Request');
        expect(result.message).toContain('Oil change and tire rotation');
      });

      it('should generate MAINTENANCE_TRIAGED notification', () => {
        const context: NotificationContext = {
          maintenanceType: 'internal',
        };

        const result = generateNotification(NotificationType.MAINTENANCE_TRIAGED, context);

        expect(result.title).toBe('Maintenance Request Triaged');
        expect(result.message).toContain('internal');
      });

      it('should generate MAINTENANCE_APPROVED notification', () => {
        const context: NotificationContext = {
          approvedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.MAINTENANCE_APPROVED, context);

        expect(result.title).toBe('Maintenance Request Approved');
        expect(result.message).toContain('Admin User');
      });

      it('should generate MAINTENANCE_REJECTED notification', () => {
        const context: NotificationContext = {
          rejectedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.MAINTENANCE_REJECTED, context);

        expect(result.title).toBe('Maintenance Request Rejected');
        expect(result.message).toContain('Admin User');
      });

      it('should generate MAINTENANCE_COMPLETED notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
        };

        const result = generateNotification(NotificationType.MAINTENANCE_COMPLETED, context);

        expect(result.title).toBe('Maintenance Completed');
        expect(result.message).toContain('Toyota Camry');
      });
    });

    describe('Purchase Request Notifications', () => {
      it('should generate PURCHASE_REQUEST_CREATED notification', () => {
        const context: NotificationContext = {
          partName: 'Oil Filter',
          quantity: 10,
          vendor: 'AutoParts Inc',
        };

        const result = generateNotification(NotificationType.PURCHASE_REQUEST_CREATED, context);

        expect(result.title).toBe('New Purchase Request');
        expect(result.message).toContain('10');
        expect(result.message).toContain('Oil Filter');
        expect(result.message).toContain('AutoParts Inc');
      });

      it('should generate PURCHASE_REQUEST_APPROVED notification', () => {
        const context: NotificationContext = {
          partName: 'Oil Filter',
          approvedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.PURCHASE_REQUEST_APPROVED, context);

        expect(result.title).toBe('Purchase Request Approved');
        expect(result.message).toContain('Oil Filter');
        expect(result.message).toContain('Admin User');
      });

      it('should generate PURCHASE_REQUEST_REJECTED notification', () => {
        const context: NotificationContext = {
          partName: 'Oil Filter',
          rejectedBy: 'Admin User',
        };

        const result = generateNotification(NotificationType.PURCHASE_REQUEST_REJECTED, context);

        expect(result.title).toBe('Purchase Request Rejected');
        expect(result.message).toContain('Oil Filter');
        expect(result.message).toContain('Admin User');
      });
    });

    describe('Car Inventory Notifications', () => {
      it('should generate CAR_INVENTORY_REQUEST_CREATED notification', () => {
        const context: NotificationContext = {
          licensePlate: 'ABC-123',
        };

        const result = generateNotification(
          NotificationType.CAR_INVENTORY_REQUEST_CREATED,
          context,
        );

        expect(result.title).toBe('Car Inventory Request');
        expect(result.message).toContain('ABC-123');
      });

      it('should generate CAR_INVENTORY_REQUEST_APPROVED notification', () => {
        const context: NotificationContext = {
          approvedBy: 'Admin User',
        };

        const result = generateNotification(
          NotificationType.CAR_INVENTORY_REQUEST_APPROVED,
          context,
        );

        expect(result.title).toBe('Car Inventory Request Approved');
        expect(result.message).toContain('Admin User');
      });

      it('should generate CAR_INVENTORY_REQUEST_REJECTED notification', () => {
        const context: NotificationContext = {
          rejectedBy: 'Admin User',
        };

        const result = generateNotification(
          NotificationType.CAR_INVENTORY_REQUEST_REJECTED,
          context,
        );

        expect(result.title).toBe('Car Inventory Request Rejected');
        expect(result.message).toContain('Admin User');
      });
    });

    describe('System Notifications', () => {
      it('should generate SCHEDULED_MAINTENANCE_APPROACHING notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
          licensePlate: 'ABC-123',
          dueDate: '2024-01-15',
        };

        const result = generateNotification(
          NotificationType.SCHEDULED_MAINTENANCE_APPROACHING,
          context,
        );

        expect(result.title).toBe('Scheduled Maintenance Approaching');
        expect(result.message).toContain('Toyota Camry');
        expect(result.message).toContain('ABC-123');
        expect(result.message).toContain('2024-01-15');
      });

      it('should generate SCHEDULED_MAINTENANCE_OVERDUE notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
          licensePlate: 'ABC-123',
        };

        const result = generateNotification(
          NotificationType.SCHEDULED_MAINTENANCE_OVERDUE,
          context,
        );

        expect(result.title).toBe('Scheduled Maintenance Overdue');
        expect(result.message).toContain('Toyota Camry');
        expect(result.message).toContain('ABC-123');
        expect(result.message).toContain('overdue');
      });

      it('should generate WARRANTY_EXPIRING notification', () => {
        const context: NotificationContext = {
          carModel: 'Toyota Camry',
          licensePlate: 'ABC-123',
          daysUntilDue: 30,
        };

        const result = generateNotification(NotificationType.WARRANTY_EXPIRING, context);

        expect(result.title).toBe('Warranty Expiring Soon');
        expect(result.message).toContain('Toyota Camry');
        expect(result.message).toContain('ABC-123');
        expect(result.message).toContain('30 days');
      });
    });

    describe('Default handling', () => {
      it('should handle empty context gracefully', () => {
        const result = generateNotification(NotificationType.CAR_REQUEST_CREATED, {});

        expect(result.title).toBe('New Car Request');
        expect(result.message).toBeDefined();
      });

      it('should provide fallback for missing context values', () => {
        const result = generateNotification(NotificationType.CAR_REQUEST_APPROVED, {});

        expect(result.title).toBe('Car Request Approved');
        expect(result.message).not.toContain('undefined');
      });
    });
  });
});
