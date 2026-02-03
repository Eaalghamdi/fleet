import { SetMetadata } from '@nestjs/common';
import { Department } from '@prisma/client';

export const DEPARTMENTS_KEY = 'departments';
export const Departments = (...departments: Department[]) =>
  SetMetadata(DEPARTMENTS_KEY, departments);
