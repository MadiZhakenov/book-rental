import { IsOptional, IsString, IsInt, Min, IsNumber, Type } from 'class-validator';
import { Transform } from 'class-transformer';

export class PublicBooksQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 12;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    genre?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxPrice?: number;
}

