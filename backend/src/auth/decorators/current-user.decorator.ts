import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Department, Role } from '@prisma/client';

export interface CurrentUserData {
  id: string;
  username: string;
  fullName: string;
  department: Department;
  role: Role;
}

interface RequestWithUser {
  user?: CurrentUserData;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
