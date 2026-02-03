import { IsBoolean, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class AssignCarDto {
  @IsBoolean()
  @IsOptional()
  isRental?: boolean;

  // Required if isRental is false (assigning a company car)
  @ValidateIf((o: AssignCarDto) => !o.isRental)
  @IsUUID()
  @IsNotEmpty()
  carId?: string;

  // Required if isRental is true
  @ValidateIf((o: AssignCarDto) => o.isRental === true)
  @IsUUID()
  @IsNotEmpty()
  rentalCompanyId?: string;
}
