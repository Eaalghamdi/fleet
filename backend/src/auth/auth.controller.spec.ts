import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Department, Role } from '@prisma/client';
import { CurrentUserData } from './decorators/current-user.decorator';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: CurrentUserData = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.OPERATION,
    role: Role.OPERATOR,
  };

  const mockAuthResponse = {
    accessToken: 'mock-jwt-token',
    user: mockUser,
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(mockAuthResponse),
    getMe: jest.fn().mockResolvedValue({
      ...mockUser,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return auth response on successful login', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      const result = await controller.getMe(mockUser);

      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(mockAuthService.getMe).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('resetPassword', () => {
    it('should reset password and return success message', async () => {
      const adminId = 'admin-123';
      const resetPasswordDto = { userId: 'user-123', newPassword: 'newpassword123' };

      const result = await controller.resetPassword(adminId, resetPasswordDto);

      expect(result.message).toBe('Password reset successfully');
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(adminId, resetPasswordDto);
    });
  });
});
