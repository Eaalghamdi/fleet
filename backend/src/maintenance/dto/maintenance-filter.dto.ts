import { IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { MaintenanceStatus, MaintenanceType } from '@prisma/client';

export class MaintenanceFilterDto {
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsEnum(MaintenanceType)
  @IsOptional()
  maintenanceType?: MaintenanceType;

  @IsUUID()
  @IsOptional()
  carId?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}
