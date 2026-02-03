import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Department, Role } from '@prisma/client';
import { CurrentUserData } from '../decorators/current-user.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: CurrentUserData | null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  const createMockUser = (role: Role): CurrentUserData => ({
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.OPERATION,
    role,
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext(createMockUser(Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPER_ADMIN]);
    const context = createMockExecutionContext(createMockUser(Role.SUPER_ADMIN));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPER_ADMIN]);
    const context = createMockExecutionContext(createMockUser(Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPER_ADMIN]);
    const context = createMockExecutionContext(null);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access when user has any of the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPER_ADMIN, Role.OPERATOR]);
    const context = createMockExecutionContext(createMockUser(Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(true);
  });
});
