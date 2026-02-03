import { NotificationType } from '@prisma/client';

export interface NotificationTemplate {
  title: string;
  message: string;
}

export interface NotificationContext {
  // Car Request context
  carRequestId?: string;
  carModel?: string;
  requestedBy?: string;
  destination?: string;

  // Maintenance context
  maintenanceId?: string;
  maintenanceDescription?: string;
  maintenanceType?: string;

  // Purchase Request context
  purchaseRequestId?: string;
  partName?: string;
  quantity?: number;
  vendor?: string;

  // Car Inventory context
  carInventoryRequestId?: string;
  licensePlate?: string;

  // General context
  userName?: string;
  approvedBy?: string;
  rejectedBy?: string;
  assignedBy?: string;
  dueDate?: string;
  daysUntilDue?: number;
}

type TemplateFunction = (context: NotificationContext) => NotificationTemplate;

const templates: Record<NotificationType, TemplateFunction> = {
  // Car Request Notifications
  [NotificationType.CAR_REQUEST_CREATED]: (ctx) => ({
    title: 'New Car Request',
    message: `${ctx.requestedBy || 'A user'} has submitted a car request for ${ctx.destination || 'a destination'}.`,
  }),

  [NotificationType.CAR_REQUEST_ASSIGNED]: (ctx) => ({
    title: 'Car Assigned to Request',
    message: `A ${ctx.carModel || 'car'} has been assigned to your request by ${ctx.assignedBy || 'the garage'}.`,
  }),

  [NotificationType.CAR_REQUEST_APPROVED]: (ctx) => ({
    title: 'Car Request Approved',
    message: `Your car request has been approved${ctx.approvedBy ? ` by ${ctx.approvedBy}` : ''}.`,
  }),

  [NotificationType.CAR_REQUEST_REJECTED]: (ctx) => ({
    title: 'Car Request Rejected',
    message: `Your car request has been rejected${ctx.rejectedBy ? ` by ${ctx.rejectedBy}` : ''}.`,
  }),

  [NotificationType.CAR_IN_TRANSIT]: (ctx) => ({
    title: 'Car In Transit',
    message: `The car ${ctx.carModel ? `(${ctx.carModel}) ` : ''}is now in transit to ${ctx.destination || 'the destination'}.`,
  }),

  [NotificationType.CAR_RETURNED]: (ctx) => ({
    title: 'Car Returned',
    message: `The car ${ctx.carModel ? `(${ctx.carModel}) ` : ''}has been returned.`,
  }),

  // Maintenance Notifications
  [NotificationType.MAINTENANCE_REQUEST_CREATED]: (ctx) => ({
    title: 'New Maintenance Request',
    message: `A maintenance request has been created: ${ctx.maintenanceDescription || 'No description'}.`,
  }),

  [NotificationType.MAINTENANCE_TRIAGED]: (ctx) => ({
    title: 'Maintenance Request Triaged',
    message: `Maintenance request has been triaged as ${ctx.maintenanceType || 'internal'} maintenance.`,
  }),

  [NotificationType.MAINTENANCE_APPROVED]: (ctx) => ({
    title: 'Maintenance Request Approved',
    message: `Maintenance request has been approved${ctx.approvedBy ? ` by ${ctx.approvedBy}` : ''}.`,
  }),

  [NotificationType.MAINTENANCE_REJECTED]: (ctx) => ({
    title: 'Maintenance Request Rejected',
    message: `Maintenance request has been rejected${ctx.rejectedBy ? ` by ${ctx.rejectedBy}` : ''}.`,
  }),

  [NotificationType.MAINTENANCE_COMPLETED]: (ctx) => ({
    title: 'Maintenance Completed',
    message: `Maintenance for ${ctx.carModel || 'the car'} has been completed.`,
  }),

  // Parts Notification
  [NotificationType.PART_REQUESTED]: (ctx) => ({
    title: 'Part Requested',
    message: `${ctx.partName || 'A part'} has been requested for maintenance.`,
  }),

  // Purchase Request Notifications
  [NotificationType.PURCHASE_REQUEST_CREATED]: (ctx) => ({
    title: 'New Purchase Request',
    message: `Purchase request created for ${ctx.quantity || 1}x ${ctx.partName || 'items'} from ${ctx.vendor || 'vendor'}.`,
  }),

  [NotificationType.PURCHASE_REQUEST_APPROVED]: (ctx) => ({
    title: 'Purchase Request Approved',
    message: `Your purchase request for ${ctx.partName || 'items'} has been approved${ctx.approvedBy ? ` by ${ctx.approvedBy}` : ''}.`,
  }),

  [NotificationType.PURCHASE_REQUEST_REJECTED]: (ctx) => ({
    title: 'Purchase Request Rejected',
    message: `Your purchase request for ${ctx.partName || 'items'} has been rejected${ctx.rejectedBy ? ` by ${ctx.rejectedBy}` : ''}.`,
  }),

  // Car Inventory Notifications
  [NotificationType.CAR_INVENTORY_REQUEST_CREATED]: (ctx) => ({
    title: 'Car Inventory Request',
    message: `A request to modify car inventory has been submitted${ctx.licensePlate ? ` for ${ctx.licensePlate}` : ''}.`,
  }),

  [NotificationType.CAR_INVENTORY_REQUEST_APPROVED]: (ctx) => ({
    title: 'Car Inventory Request Approved',
    message: `Your car inventory request has been approved${ctx.approvedBy ? ` by ${ctx.approvedBy}` : ''}.`,
  }),

  [NotificationType.CAR_INVENTORY_REQUEST_REJECTED]: (ctx) => ({
    title: 'Car Inventory Request Rejected',
    message: `Your car inventory request has been rejected${ctx.rejectedBy ? ` by ${ctx.rejectedBy}` : ''}.`,
  }),

  // System Notifications
  [NotificationType.SCHEDULED_MAINTENANCE_APPROACHING]: (ctx) => ({
    title: 'Scheduled Maintenance Approaching',
    message: `${ctx.carModel || 'A car'}${ctx.licensePlate ? ` (${ctx.licensePlate})` : ''} is due for maintenance${ctx.dueDate ? ` on ${ctx.dueDate}` : ' soon'}.`,
  }),

  [NotificationType.SCHEDULED_MAINTENANCE_OVERDUE]: (ctx) => ({
    title: 'Scheduled Maintenance Overdue',
    message: `${ctx.carModel || 'A car'}${ctx.licensePlate ? ` (${ctx.licensePlate})` : ''} is overdue for scheduled maintenance.`,
  }),

  [NotificationType.WARRANTY_EXPIRING]: (ctx) => ({
    title: 'Warranty Expiring Soon',
    message: `Warranty for ${ctx.carModel || 'a car'}${ctx.licensePlate ? ` (${ctx.licensePlate})` : ''} expires${ctx.daysUntilDue ? ` in ${ctx.daysUntilDue} days` : ' soon'}.`,
  }),
};

export function generateNotification(
  type: NotificationType,
  context: NotificationContext = {},
): NotificationTemplate {
  const templateFn = templates[type];
  if (!templateFn) {
    return {
      title: 'Notification',
      message: 'You have a new notification.',
    };
  }
  return templateFn(context);
}
