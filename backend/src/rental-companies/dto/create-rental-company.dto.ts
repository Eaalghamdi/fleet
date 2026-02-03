import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateRentalCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
