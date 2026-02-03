import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Department, Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(Department)
  @IsNotEmpty()
  department: Department;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
