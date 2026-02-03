import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { CarType, CarInventoryRequestType } from '@prisma/client';

export class CreateCarInventoryRequestDto {
  @IsEnum(CarInventoryRequestType)
  @IsNotEmpty()
  type: CarInventoryRequestType;

  // For DELETE requests - the car ID to delete
  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'DELETE')
  @IsString()
  @IsNotEmpty()
  carId?: string;

  // For ADD requests - the car data
  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsString()
  @IsNotEmpty()
  model?: string;

  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsEnum(CarType)
  @IsNotEmpty()
  carType?: CarType;

  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsString()
  @IsNotEmpty()
  color?: string;

  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsString()
  @IsNotEmpty()
  licensePlate?: string;

  @ValidateIf((o: CreateCarInventoryRequestDto) => o.type === 'ADD')
  @IsString()
  @IsNotEmpty()
  vin?: string;

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
