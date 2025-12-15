import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateRentalDto {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsString()
    @IsNotEmpty()
    bookId: string;
}
