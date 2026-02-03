import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Department, Role } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserWithoutPassword = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.OPERATION,
    role: Role.OPERATOR,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    activate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUserWithoutPassword];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserWithoutPassword);

      const result = await controller.findOne('user-123');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-123');
    });

    it('should propagate NotFoundException from service', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
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

    it('should create and return a new user', async () => {
      mockUsersService.create.mockResolvedValue(mockUserWithoutPassword);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      fullName: 'Updated Name',
    };

    it('should update and return the user', async () => {
      const updatedUser = { ...mockUserWithoutPassword, fullName: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-123', updateUserDto);

      expect(result.fullName).toBe('Updated Name');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-123', updateUserDto);
    });
  });

  describe('deactivate', () => {
    it('should deactivate the user', async () => {
      const deactivatedUser = { ...mockUserWithoutPassword, isActive: false };
      mockUsersService.deactivate.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivate('user-123');

      expect(result.isActive).toBe(false);
      expect(mockUsersService.deactivate).toHaveBeenCalledWith('user-123');
    });
  });

  describe('activate', () => {
    it('should activate the user', async () => {
      mockUsersService.activate.mockResolvedValue(mockUserWithoutPassword);

      const result = await controller.activate('user-123');

      expect(result.isActive).toBe(true);
      expect(mockUsersService.activate).toHaveBeenCalledWith('user-123');
    });
  });
});
