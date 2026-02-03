import { IsString, IsEnum, IsOptional } from 'class-validator';
import { CarType, TrackingMode } from '@prisma/client';

export class PartFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(CarType)
  @IsOptional()
  carType?: CarType;

  @IsString()
  @IsOptional()
  carModel?: string;

  @IsEnum(TrackingMode)
  @IsOptional()
  trackingMode?: TrackingMode;
}
