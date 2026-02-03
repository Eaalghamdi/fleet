import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { CarType } from '@prisma/client';

export class CreateCarRequestDto {
  @IsEnum(CarType)
  @IsNotEmpty()
  requestedCarType: CarType;

  @IsString()
  @IsNotEmpty()
  departureLocation: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString()
  @IsNotEmpty()
  departureDatetime: string;

  @IsDateString()
  @IsNotEmpty()
  returnDatetime: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  requestedCarId?: string;
}
