import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Department } from '@prisma/client';

export class CreateAuditLogDto {
  @IsString()
  action: string;

  @IsString()
  entityType: string;

  @IsUUID()
  entityId: string;

  @IsUUID()
  performedById: string;

  @IsEnum(Department)
  department: Department;

  @IsOptional()
  details?: Record<string, unknown>;
}
