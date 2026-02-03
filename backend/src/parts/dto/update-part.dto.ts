import { IsString, IsOptional, IsInt, Min, MinLength } from 'class-validator';

export class UpdatePartDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  carModel?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;
}
