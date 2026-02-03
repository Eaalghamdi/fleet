import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma';
import { Department, NotificationType } from '@prisma/client';
import { Server, Socket } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockPrismaService = {};

  const createMockSocket = (overrides = {}): Partial<Socket> => ({
    id: 'socket-123',
    handshake: {
      headers: { authorization: 'Bearer valid-token' },
      auth: {},
      time: new Date().toISOString(),
      address: '127.0.0.1',
      xdomain: false,
      secure: false,
      issued: Date.now(),
      url: '/notifications',
      query: {},
    } as Socket['handshake'],
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    emit: jest.fn(),
    ...overrides,
  });

  const serverToMock = jest.fn().mockReturnThis();
  const serverEmitMock = jest.fn();

  const createMockServer = (): Partial<Server> => ({
    to: serverToMock,
    emit: serverEmitMock,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);

    serverToMock.mockClear();
    serverEmitMock.mockClear();
    gateway.server = createMockServer() as Server;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate and join rooms on valid token', async () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const socket = createMockSocket();
      await gateway.handleConnection(socket as Socket);

      expect(socket.join).toHaveBeenCalledWith('user:user-123');
      expect(socket.join).toHaveBeenCalledWith('department:OPERATION');
      expect(socket.emit).toHaveBeenCalledWith('connected', {
        userId: 'user-123',
        department: Department.OPERATION,
      });
    });

    it('should disconnect on missing token', async () => {
      const socket = createMockSocket({
        handshake: {
          headers: {},
          auth: {},
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/notifications',
          query: {},
        },
      });

      await gateway.handleConnection(socket as Socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect on invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const socket = createMockSocket();
      await gateway.handleConnection(socket as Socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should extract token from auth object', async () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const socket = createMockSocket({
        handshake: {
          headers: {},
          auth: { token: 'auth-token' },
          time: new Date().toISOString(),
          address: '127.0.0.1',
          xdomain: false,
          secure: false,
          issued: Date.now(),
          url: '/notifications',
          query: {},
        },
      });

      await gateway.handleConnection(socket as Socket);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('auth-token', {
        secret: 'test-secret',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user connection tracking', async () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      interface AuthenticatedSocket extends Socket {
        userId?: string;
        department?: Department;
      }

      const socket = createMockSocket() as AuthenticatedSocket;
      await gateway.handleConnection(socket as Socket);

      expect(gateway.isUserOnline('user-123')).toBe(true);

      socket.userId = 'user-123';
      gateway.handleDisconnect(socket as Socket);

      expect(gateway.isUserOnline('user-123')).toBe(false);
    });
  });

  describe('handlePing', () => {
    it('should respond with pong', () => {
      const result = gateway.handlePing();

      expect(result).toEqual({ event: 'pong', data: 'pong' });
    });
  });

  describe('sendToUser', () => {
    it('should send notification to user room', () => {
      gateway.sendToUser('user-123', NotificationType.CAR_REQUEST_CREATED, {
        id: 'notification-123',
        title: 'Test',
        message: 'Test message',
      });

      expect(serverToMock).toHaveBeenCalledWith('user:user-123');
      expect(serverEmitMock).toHaveBeenCalledWith(
        'notification',
        expect.objectContaining({
          type: NotificationType.CAR_REQUEST_CREATED,
          id: 'notification-123',
          title: 'Test',
          message: 'Test message',
        }),
      );
    });
  });

  describe('sendToDepartment', () => {
    it('should send notification to department room', () => {
      gateway.sendToDepartment(Department.GARAGE, NotificationType.CAR_REQUEST_CREATED, {
        title: 'Test',
        message: 'Test message',
      });

      expect(serverToMock).toHaveBeenCalledWith('department:GARAGE');
      expect(serverEmitMock).toHaveBeenCalledWith(
        'notification',
        expect.objectContaining({
          type: NotificationType.CAR_REQUEST_CREATED,
          title: 'Test',
          message: 'Test message',
        }),
      );
    });
  });

  describe('sendToMultipleDepartments', () => {
    it('should send notification to multiple departments', () => {
      gateway.sendToMultipleDepartments(
        [Department.GARAGE, Department.MAINTENANCE],
        NotificationType.MAINTENANCE_COMPLETED,
        {
          title: 'Test',
          message: 'Test message',
        },
      );

      expect(serverToMock).toHaveBeenCalledWith('department:GARAGE');
      expect(serverToMock).toHaveBeenCalledWith('department:MAINTENANCE');
    });
  });

  describe('broadcast', () => {
    it('should broadcast to all connected clients', () => {
      gateway.broadcast(NotificationType.CAR_REQUEST_CREATED, {
        title: 'Test',
        message: 'Test message',
      });

      expect(serverEmitMock).toHaveBeenCalledWith(
        'notification',
        expect.objectContaining({
          type: NotificationType.CAR_REQUEST_CREATED,
          title: 'Test',
          message: 'Test message',
        }),
      );
    });
  });

  describe('isUserOnline', () => {
    it('should return false for offline users', () => {
      expect(gateway.isUserOnline('nonexistent')).toBe(false);
    });

    it('should return true for online users', async () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const socket = createMockSocket();
      await gateway.handleConnection(socket as Socket);

      expect(gateway.isUserOnline('user-123')).toBe(true);
    });
  });

  describe('getOnlineUsers', () => {
    it('should return list of online user IDs', async () => {
      const mockPayload1 = {
        sub: 'user-1',
        username: 'testuser1',
        department: Department.OPERATION,
      };
      const mockPayload2 = {
        sub: 'user-2',
        username: 'testuser2',
        department: Department.GARAGE,
      };

      mockJwtService.verifyAsync.mockResolvedValueOnce(mockPayload1);
      await gateway.handleConnection(createMockSocket({ id: 'socket-1' }) as Socket);

      mockJwtService.verifyAsync.mockResolvedValueOnce(mockPayload2);
      await gateway.handleConnection(createMockSocket({ id: 'socket-2' }) as Socket);

      const onlineUsers = gateway.getOnlineUsers();

      expect(onlineUsers).toContain('user-1');
      expect(onlineUsers).toContain('user-2');
    });
  });

  describe('getOnlineUsersCount', () => {
    it('should return count of online users', async () => {
      expect(gateway.getOnlineUsersCount()).toBe(0);

      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleConnection(createMockSocket() as Socket);

      expect(gateway.getOnlineUsersCount()).toBe(1);
    });
  });
});
