import { IsEnum, IsInt, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';
import { CarType, CarStatus } from '@prisma/client';

export class UpdateCarDto {
  @IsString()
  @IsOptional()
  model?: string;

  @IsEnum(CarType)
  @IsOptional()
  type?: CarType;

  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  mileage?: number;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsEnum(CarStatus)
  @IsOptional()
  status?: CarStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  maintenanceIntervalMonths?: number;

  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: string;
}
