import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class TriageMaintenanceDto {
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @IsString()
  @IsOptional()
  externalVendor?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCost?: number;
}
