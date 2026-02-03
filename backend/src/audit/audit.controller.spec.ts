import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService, AuditActions } from './audit.service';
import { Department, Role } from '@prisma/client';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

describe('AuditController', () => {
  let controller: AuditController;

  const mockUser: CurrentUserData = {
    id: 'user-123',
    username: 'admin',
    department: Department.ADMIN,
    role: Role.SUPER_ADMIN,
  };

  const mockAuditLog = {
    id: 'audit-123',
    action: AuditActions.CAR_REQUEST_CREATED,
    entityType: 'CarRequest',
    entityId: 'request-123',
    performedById: 'user-123',
    department: Department.OPERATION,
    details: { destination: 'Airport' },
    timestamp: new Date(),
    performedBy: {
      id: 'user-123',
      fullName: 'John Doe',
      department: Department.OPERATION,
    },
  };

  const mockAuditService = {
    findAll: jest.fn(),
    findByEntity: jest.fn(),
    getRecentActions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      mockAuditService.findAll.mockResolvedValue([mockAuditLog]);

      const result = await controller.findAll({}, mockUser);

      expect(result).toEqual([mockAuditLog]);
      expect(mockAuditService.findAll).toHaveBeenCalledWith({}, Department.ADMIN, Role.SUPER_ADMIN);
    });

    it('should pass filters to service', async () => {
      mockAuditService.findAll.mockResolvedValue([mockAuditLog]);

      await controller.findAll({ action: AuditActions.CAR_REQUEST_CREATED }, mockUser);

      expect(mockAuditService.findAll).toHaveBeenCalledWith(
        { action: AuditActions.CAR_REQUEST_CREATED },
        Department.ADMIN,
        Role.SUPER_ADMIN,
      );
    });
  });

  describe('findByEntity', () => {
    it('should return audit logs for a specific entity', async () => {
      mockAuditService.findByEntity.mockResolvedValue([mockAuditLog]);

      const result = await controller.findByEntity('CarRequest', 'request-123');

      expect(result).toEqual([mockAuditLog]);
      expect(mockAuditService.findByEntity).toHaveBeenCalledWith('CarRequest', 'request-123');
    });
  });

  describe('getRecentActions', () => {
    it('should return recent actions with default limit', async () => {
      mockAuditService.getRecentActions.mockResolvedValue([mockAuditLog]);

      const result = await controller.getRecentActions(mockUser);

      expect(result).toEqual([mockAuditLog]);
      expect(mockAuditService.getRecentActions).toHaveBeenCalledWith(Department.ADMIN, 10);
    });

    it('should return recent actions with custom limit', async () => {
      mockAuditService.getRecentActions.mockResolvedValue([mockAuditLog]);

      const result = await controller.getRecentActions(mockUser, '20');

      expect(result).toEqual([mockAuditLog]);
      expect(mockAuditService.getRecentActions).toHaveBeenCalledWith(Department.ADMIN, 20);
    });
  });
});
