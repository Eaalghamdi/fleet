import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';
import { Department, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    passwordHash: '',
    fullName: 'Test User',
    department: Department.OPERATION,
    role: Role.OPERATOR,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-123',
    username: 'admin',
    passwordHash: '',
    fullName: 'Admin User',
    department: Department.ADMIN,
    role: Role.SUPER_ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    // Hash the password for mock user
    mockUser.passwordHash = await bcrypt.hash('password123', 10);
    mockAdmin.passwordHash = await bcrypt.hash('admin123', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(inactiveUser);

      const result = await service.validateUser('testuser', 'password123');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data when login is successful', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.login({ username: 'testuser', password: 'password123' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user data without password hash', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.getMe('user-123');

      expect(result.id).toBe(mockUser.id);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password when called by Super Admin', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await service.resetPassword('admin-123', {
        userId: 'user-123',
        newPassword: 'newpassword123',
      });

      expect(result.message).toBe('Password reset successfully');
    });

    it('should throw ForbiddenException when called by non-admin', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        service.resetPassword('user-123', {
          userId: 'other-user',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when target user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(null);

      await expect(
        service.resetPassword('admin-123', {
          userId: 'nonexistent',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(await bcrypt.compare(password, hash)).toBe(true);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testpassword';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const hash = await bcrypt.hash('password1', 10);

      const result = await service.comparePasswords('password2', hash);
      expect(result).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should return payload for valid token', () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        department: Department.OPERATION,
        role: Role.OPERATOR,
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

      const result = service.verifyToken('valid-token');
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken('invalid-token')).toThrow(UnauthorizedException);
    });
  });
});
