import { IsEnum, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { CarType } from '@prisma/client';

export class UpdateCarRequestDto {
  @IsEnum(CarType)
  @IsOptional()
  requestedCarType?: CarType;

  @IsString()
  @IsOptional()
  departureLocation?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsDateString()
  @IsOptional()
  departureDatetime?: string;

  @IsDateString()
  @IsOptional()
  returnDatetime?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  requestedCarId?: string;
}
