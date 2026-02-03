import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  carId: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
