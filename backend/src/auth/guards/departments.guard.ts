import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Department, Role } from '@prisma/client';
import { DEPARTMENTS_KEY } from '../decorators/departments.decorator';
import { CurrentUserData } from '../decorators/current-user.decorator';

interface RequestWithUser {
  user?: CurrentUserData;
}

@Injectable()
export class DepartmentsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredDepartments = this.reflector.getAllAndOverride<Department[]>(DEPARTMENTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredDepartments || requiredDepartments.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Super Admin can access all departments
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    return requiredDepartments.includes(user.department);
  }
}
