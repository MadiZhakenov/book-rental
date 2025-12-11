import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private prisma = new PrismaClient();

    constructor(private jwtService: JwtService) { }

    async register(registerDto: RegisterDto) {
        // Проверяем, существует ли пользователь
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Создаем пользователя
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password_hash: hashedPassword,
                bio: registerDto.name, // Используем bio для имени (можно добавить отдельное поле name в схему)
            },
        });

        // Генерируем токен
        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

        return { access_token };
    }

    async login(loginDto: LoginDto) {
        // Находим пользователя
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        // Генерируем токен
        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

        return { access_token };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { books: true },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.bio || 'Пользователь',
            isPremium: user.isPremium,
            booksCount: user._count.books,
            rating: user.rating,
            createdAt: user.createdAt,
        };
    }
}
