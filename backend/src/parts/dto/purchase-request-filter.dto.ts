import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PurchaseRequestStatus } from '@prisma/client';

export class PurchaseRequestFilterDto {
  @IsEnum(PurchaseRequestStatus)
  @IsOptional()
  status?: PurchaseRequestStatus;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}
