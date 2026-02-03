import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma';
import { Department, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    passwordHash: 'hashedpassword',
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
    passwordHash: 'hashedpassword',
    fullName: 'Admin User',
    department: Department.ADMIN,
    role: Role.SUPER_ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without password hashes', async () => {
      const users = [mockUser, mockAdmin];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[1]).not.toHaveProperty('passwordHash');
    });

    it('should return empty array when no users exist', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return user without password hash when found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result.id).toBe('user-123');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createUserDto = {
      username: 'newuser',
      password: 'password123',
      fullName: 'New User',
      department: Department.OPERATION,
      role: Role.OPERATOR,
    };

    it('should create a new user and return without password hash', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      const createSpy = jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        ...mockUser,
        id: 'new-user-123',
        username: 'newuser',
        fullName: 'New User',
      });

      const result = await service.create(createUserDto);

      expect(result.username).toBe('newuser');
      expect(result).not.toHaveProperty('passwordHash');
      expect(createSpy).toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      const createSpy = jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      await service.create(createUserDto);

      const createCallData = createSpy.mock.calls[0][0].data as { passwordHash: string };
      expect(createCallData.passwordHash).not.toBe(createUserDto.password);
      expect(await bcrypt.compare(createUserDto.password, createCallData.passwordHash)).toBe(true);
    });

    it('should throw BadRequestException when Super Admin is not in ADMIN department', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const invalidDto = {
        ...createUserDto,
        role: Role.SUPER_ADMIN,
        department: Department.OPERATION,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ADMIN department has non-SUPER_ADMIN role', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const invalidDto = {
        ...createUserDto,
        role: Role.OPERATOR,
        department: Department.ADMIN,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      fullName: 'Updated Name',
    };

    it('should update user and return without password hash', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        fullName: 'Updated Name',
      });

      const result = await service.update('user-123', updateUserDto);

      expect(result.fullName).toBe('Updated Name');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.update('nonexistent', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing username', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);

      await expect(service.update('user-123', { username: 'admin' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow updating to same username', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await service.update('user-123', { username: 'testuser' });

      expect(result.username).toBe('testuser');
    });

    it('should validate department-role combination on update', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.update('user-123', { role: Role.SUPER_ADMIN })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deactivate', () => {
    it('should set user isActive to false', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const updateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.deactivate('user-123');

      expect(result.isActive).toBe(false);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.deactivate('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should set user isActive to true', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(inactiveUser);
      const updateSpy = jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        isActive: true,
      });

      const result = await service.activate('user-123');

      expect(result.isActive).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: true },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.activate('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
