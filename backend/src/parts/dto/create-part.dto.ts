import { IsString, IsEnum, IsOptional, IsInt, Min, MinLength } from 'class-validator';
import { CarType, TrackingMode } from '@prisma/client';

export class CreatePartDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(CarType)
  carType: CarType;

  @IsString()
  @MinLength(2)
  carModel: string;

  @IsEnum(TrackingMode)
  trackingMode: TrackingMode;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  serialNumber?: string;
}
