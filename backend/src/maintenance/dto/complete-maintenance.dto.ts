import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CompleteMaintenanceDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  externalCost?: number;

  @IsString()
  @IsOptional()
  completionNotes?: string;
}
