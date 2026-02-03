import { IsString, IsInt, IsNumber, Min, MinLength } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsString()
  @MinLength(2)
  partName: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  estimatedCost: number;

  @IsString()
  @MinLength(2)
  vendor: string;
}
