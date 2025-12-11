import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsOptional()
    isbn?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    genre?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];

    @IsNumber()
    @IsNotEmpty()
    dailyPrice: number;

    @IsNumber()
    @IsNotEmpty()
    deposit: number;

    @IsString()
    @IsNotEmpty()
    ownerId: string;
}
