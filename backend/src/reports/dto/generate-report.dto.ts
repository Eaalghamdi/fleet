import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ReportType {
  FLEET_OVERVIEW = 'FLEET_OVERVIEW',
  CAR_REQUESTS_SUMMARY = 'CAR_REQUESTS_SUMMARY',
  MAINTENANCE_SUMMARY = 'MAINTENANCE_SUMMARY',
  PARTS_INVENTORY = 'PARTS_INVENTORY',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
