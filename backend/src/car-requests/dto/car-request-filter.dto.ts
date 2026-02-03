import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { CarRequestStatus, CarType } from '@prisma/client';

export class CarRequestFilterDto {
  @IsEnum(CarRequestStatus)
  @IsOptional()
  status?: CarRequestStatus;

  @IsEnum(CarType)
  @IsOptional()
  carType?: CarType;

  @IsUUID()
  @IsOptional()
  createdById?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}
