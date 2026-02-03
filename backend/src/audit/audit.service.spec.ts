import { Test, TestingModule } from '@nestjs/testing';
import { AuditService, AuditActions } from './audit.service';
import { PrismaService } from '../prisma';
import { Department, Role } from '@prisma/client';

describe('AuditService', () => {
  let service: AuditService;

  const mockAuditLog = {
    id: 'audit-123',
    action: AuditActions.CAR_REQUEST_CREATED,
    entityType: 'CarRequest',
    entityId: 'request-123',
    performedById: 'user-123',
    department: Department.OPERATION,
    details: { destination: 'Airport' },
    timestamp: new Date(),
  };

  const mockAuditLogWithUser = {
    ...mockAuditLog,
    performedBy: {
      id: 'user-123',
      fullName: 'John Doe',
      department: Department.OPERATION,
    },
  };

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue(mockAuditLog);

      const result = await service.create({
        action: AuditActions.CAR_REQUEST_CREATED,
        entityType: 'CarRequest',
        entityId: 'request-123',
        performedById: 'user-123',
        department: Department.OPERATION,
        details: { destination: 'Airport' },
      });

      expect(result).toEqual(mockAuditLog);
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('should create an audit log using log method', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue(mockAuditLog);

      const result = await service.log(
        AuditActions.CAR_REQUEST_CREATED,
        'CarRequest',
        'request-123',
        'user-123',
        Department.OPERATION,
        { destination: 'Airport' },
      );

      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs for super admin', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      const result = await service.findAll({}, Department.ADMIN, Role.SUPER_ADMIN);

      expect(result).toEqual([mockAuditLogWithUser]);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          include: expect.any(Object) as unknown,
        }),
      );
    });

    it('should filter by department for non-super admin', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      await service.findAll({}, Department.OPERATION, Role.OPERATOR);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { department: Department.OPERATION },
        }),
      );
    });

    it('should filter by action', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      await service.findAll(
        { action: AuditActions.CAR_REQUEST_CREATED },
        Department.ADMIN,
        Role.SUPER_ADMIN,
      );

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: AuditActions.CAR_REQUEST_CREATED },
        }),
      );
    });

    it('should filter by entity type', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      await service.findAll({ entityType: 'CarRequest' }, Department.ADMIN, Role.SUPER_ADMIN);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'CarRequest' },
        }),
      );
    });

    it('should filter by date range', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      await service.findAll(
        { startDate: '2024-01-01', endDate: '2024-01-31' },
        Department.ADMIN,
        Role.SUPER_ADMIN,
      );

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timestamp: {
              gte: expect.any(Date) as unknown as Date,
              lte: expect.any(Date) as unknown as Date,
            },
          },
        }),
      );
    });
  });

  describe('findByEntity', () => {
    it('should return audit logs for a specific entity', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      const result = await service.findByEntity('CarRequest', 'request-123');

      expect(result).toEqual([mockAuditLogWithUser]);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'CarRequest', entityId: 'request-123' },
        }),
      );
    });
  });

  describe('getRecentActions', () => {
    it('should return recent actions for a department', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLogWithUser]);

      const result = await service.getRecentActions(Department.OPERATION, 10);

      expect(result).toEqual([mockAuditLogWithUser]);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { department: Department.OPERATION },
          take: 10,
        }),
      );
    });
  });

  describe('getActionsByUser', () => {
    it('should return actions performed by a user', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLog]);

      const result = await service.getActionsByUser('user-123', 50);

      expect(result).toEqual([mockAuditLog]);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { performedById: 'user-123' },
          take: 50,
        }),
      );
    });
  });

  describe('getStatsByDateRange', () => {
    it('should return action stats by date range', async () => {
      mockPrismaService.auditLog.groupBy.mockResolvedValue([
        { action: AuditActions.CAR_REQUEST_CREATED, _count: { action: 5 } },
        { action: AuditActions.CAR_REQUEST_APPROVED, _count: { action: 3 } },
      ]);

      const result = await service.getStatsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toEqual([
        { action: AuditActions.CAR_REQUEST_CREATED, count: 5 },
        { action: AuditActions.CAR_REQUEST_APPROVED, count: 3 },
      ]);
    });

    it('should filter by department', async () => {
      mockPrismaService.auditLog.groupBy.mockResolvedValue([]);

      await service.getStatsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        Department.GARAGE,
      );

      expect(mockPrismaService.auditLog.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: Department.GARAGE,
          }) as unknown,
        }),
      );
    });
  });
});
