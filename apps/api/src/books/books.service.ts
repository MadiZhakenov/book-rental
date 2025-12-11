import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
    private prisma = new PrismaClient();

    async create(createBookDto: CreateBookDto, userId: string) {
        // Получаем пользователя
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { _count: { select: { books: true } } }
        });

        if (!user) {
            throw new ForbiddenException('Пользователь не найден');
        }

        // Проверка лимита для бесплатных пользователей
        if (!user.isPremium && user._count.books >= 5) {
            throw new ForbiddenException(
                'Лимит бесплатных объявлений исчерпан (макс. 5). Купите подписку.'
            );
        }

        // Создаем книгу
        return this.prisma.book.create({
            data: {
                ...createBookDto,
                ownerId: userId,
            },
        });
    }

    async findAll() {
        return this.prisma.book.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        rating: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.book.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        rating: true,
                    },
                },
                reviews: true,
            },
        });
    }

    async update(id: string, updateBookDto: UpdateBookDto, userId: string) {
        // Проверяем, что книга принадлежит пользователю
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book || book.ownerId !== userId) {
            throw new ForbiddenException('У вас нет прав на редактирование этой книги');
        }

        return this.prisma.book.update({
            where: { id },
            data: updateBookDto,
        });
    }

    async remove(id: string, userId: string) {
        // Проверяем, что книга принадлежит пользователю
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book || book.ownerId !== userId) {
            throw new ForbiddenException('У вас нет прав на удаление этой книги');
        }

        return this.prisma.book.delete({
            where: { id },
        });
    }
}
