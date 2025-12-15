import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RentalStatusUpdate {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateRentalStatusDto {
  @IsEnum(RentalStatusUpdate)
  @IsNotEmpty()
  status: RentalStatusUpdate;
}

