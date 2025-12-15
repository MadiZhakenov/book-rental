import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum RentalAction {
  PICKUP = 'PICKUP',
  RETURN = 'RETURN',
}

export class VerifyRentalDto {
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsEnum(RentalAction)
  @IsNotEmpty()
  action: RentalAction;
}

