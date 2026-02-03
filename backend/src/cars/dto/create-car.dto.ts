import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { CarType } from '@prisma/client';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsEnum(CarType)
  @IsNotEmpty()
  type: CarType;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  vin: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileage?: number;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maintenanceIntervalMonths?: number;

  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: string;
}
