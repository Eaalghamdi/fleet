import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DepartmentsGuard } from './departments.guard';
import { Department, Role } from '@prisma/client';
import { CurrentUserData } from '../decorators/current-user.decorator';

describe('DepartmentsGuard', () => {
  let guard: DepartmentsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new DepartmentsGuard(reflector);
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

  const createMockUser = (department: Department, role: Role): CurrentUserData => ({
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department,
    role,
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no departments are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext(createMockUser(Department.OPERATION, Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user is in required department', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Department.OPERATION]);
    const context = createMockExecutionContext(createMockUser(Department.OPERATION, Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user is not in required department', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Department.GARAGE]);
    const context = createMockExecutionContext(createMockUser(Department.OPERATION, Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow SUPER_ADMIN access to any department', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Department.MAINTENANCE]);
    const context = createMockExecutionContext(createMockUser(Department.ADMIN, Role.SUPER_ADMIN));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when no user is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Department.OPERATION]);
    const context = createMockExecutionContext(null);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access when user is in any of the required departments', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Department.OPERATION, Department.GARAGE]);
    const context = createMockExecutionContext(createMockUser(Department.GARAGE, Role.OPERATOR));

    expect(guard.canActivate(context)).toBe(true);
  });
});
