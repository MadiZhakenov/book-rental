import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(1000)
    content: string;
}

