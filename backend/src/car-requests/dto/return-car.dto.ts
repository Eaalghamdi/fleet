import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ReturnCarDto {
  @IsString()
  @IsOptional()
  returnConditionNotes?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  currentMileage?: number;
}
