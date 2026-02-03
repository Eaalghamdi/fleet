import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CarType, CarStatus } from '@prisma/client';

export class CarFilterDto {
  @IsEnum(CarType)
  @IsOptional()
  type?: CarType;

  @IsEnum(CarStatus)
  @IsOptional()
  status?: CarStatus;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
