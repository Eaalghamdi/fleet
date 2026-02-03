import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Department, Role } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(Department)
  @IsOptional()
  department?: Department;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
