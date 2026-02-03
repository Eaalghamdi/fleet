import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class AssignPartDto {
  @IsUUID()
  partId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
