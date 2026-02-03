import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateAuditLogDto, AuditFilterDto } from './dto';
import { AuditLog, Department, Role } from '@prisma/client';

export interface AuditLogWithUser extends AuditLog {
  performedBy: {
    id: string;
    fullName: string;
    department: Department;
  };
}

// Audit action constants
export const AuditActions = {
  // Car Request Actions
  CAR_REQUEST_CREATED: 'CAR_REQUEST_CREATED',
  CAR_REQUEST_ASSIGNED: 'CAR_REQUEST_ASSIGNED',
  CAR_REQUEST_APPROVED: 'CAR_REQUEST_APPROVED',
  CAR_REQUEST_REJECTED: 'CAR_REQUEST_REJECTED',
  CAR_REQUEST_CANCELLED: 'CAR_REQUEST_CANCELLED',
  CAR_IN_TRANSIT: 'CAR_IN_TRANSIT',
  CAR_RETURNED: 'CAR_RETURNED',

  // Maintenance Actions
  MAINTENANCE_CREATED: 'MAINTENANCE_CREATED',
  MAINTENANCE_TRIAGED: 'MAINTENANCE_TRIAGED',
  MAINTENANCE_APPROVED: 'MAINTENANCE_APPROVED',
  MAINTENANCE_REJECTED: 'MAINTENANCE_REJECTED',
  MAINTENANCE_STARTED: 'MAINTENANCE_STARTED',
  MAINTENANCE_COMPLETED: 'MAINTENANCE_COMPLETED',

  // Car Inventory Actions
  CAR_ADDED: 'CAR_ADDED',
  CAR_UPDATED: 'CAR_UPDATED',
  CAR_DELETED: 'CAR_DELETED',
  CAR_INVENTORY_REQUEST_CREATED: 'CAR_INVENTORY_REQUEST_CREATED',
  CAR_INVENTORY_REQUEST_APPROVED: 'CAR_INVENTORY_REQUEST_APPROVED',
  CAR_INVENTORY_REQUEST_REJECTED: 'CAR_INVENTORY_REQUEST_REJECTED',

  // Parts Actions
  PART_CREATED: 'PART_CREATED',
  PART_UPDATED: 'PART_UPDATED',
  PART_DELETED: 'PART_DELETED',
  PART_ASSIGNED: 'PART_ASSIGNED',
  PART_REMOVED: 'PART_REMOVED',

  // Purchase Request Actions
  PURCHASE_REQUEST_CREATED: 'PURCHASE_REQUEST_CREATED',
  PURCHASE_REQUEST_APPROVED: 'PURCHASE_REQUEST_APPROVED',
  PURCHASE_REQUEST_REJECTED: 'PURCHASE_REQUEST_REJECTED',

  // User Actions
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        performedById: dto.performedById,
        department: dto.department,
        details: dto.details as object | undefined,
      },
    });
  }

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    performedById: string,
    department: Department,
    details?: Record<string, unknown>,
  ): Promise<AuditLog> {
    return this.create({
      action,
      entityType,
      entityId,
      performedById,
      department,
      details,
    });
  }

  async findAll(
    filters: AuditFilterDto,
    userDepartment: Department,
    userRole: Role,
  ): Promise<AuditLogWithUser[]> {
    const where: Record<string, unknown> = {};

    // Department-based visibility
    // Super Admin can see all, others can only see their department
    if (userRole !== Role.SUPER_ADMIN) {
      where.department = userDepartment;
    } else if (filters.department) {
      where.department = filters.department;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.performedById) {
      where.performedById = filters.performedById;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        (where.timestamp as Record<string, Date>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.timestamp as Record<string, Date>).lte = new Date(filters.endDate);
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        performedBy: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLogWithUser[]> {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: {
        performedBy: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getRecentActions(department: Department, limit: number = 10): Promise<AuditLogWithUser[]> {
    return this.prisma.auditLog.findMany({
      where: { department },
      include: {
        performedBy: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getActionsByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { performedById: userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getStatsByDateRange(
    startDate: Date,
    endDate: Date,
    department?: Department,
  ): Promise<{ action: string; count: number }[]> {
    const where: Record<string, unknown> = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (department) {
      where.department = department;
    }

    const result = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
    });

    return result.map((r) => ({
      action: r.action,
      count: r._count.action,
    }));
  }
}
