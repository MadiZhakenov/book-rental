import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

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
    images?: string[];

    @IsNumber()
    @IsOptional()
    publishYear?: number;

    @IsString()
    @IsOptional()
    language?: string;

    @IsNumber()
    @IsNotEmpty()
    dailyPrice: number;

    @IsNumber()
    @IsNotEmpty()
    deposit: number;
}
