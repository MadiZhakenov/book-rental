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

    async findAllByOwner(userId: string) {
        return this.prisma.book.findMany({
            where: {
                ownerId: userId,
            },
            select: {
                id: true,
                title: true,
                author: true,
                dailyPrice: true,
                images: true,
                status: true,
                deposit: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findAllPublic(query: {
        page?: number | string;
        limit?: number | string;
        search?: string;
        genre?: string;
        minPrice?: number | string;
        maxPrice?: number | string;
    }) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 12;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'AVAILABLE',
        };

        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { author: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.genre) {
            where.genre = query.genre;
        }

        const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : undefined;
        const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.dailyPrice = {};
            if (minPrice !== undefined) {
                where.dailyPrice.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.dailyPrice.lte = maxPrice;
            }
        }

        const [books, total] = await Promise.all([
            this.prisma.book.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    author: true,
                    dailyPrice: true,
                    images: true,
                    status: true,
                    deposit: true,
                    createdAt: true,
                    location_lat: true,
                    location_lng: true,
                    latitude: true,
                    longitude: true,
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.book.count({ where }),
        ]);

        return {
            books,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
                        avatarUrl: true,
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

    async getFeatured() {
        const [popular, newArrivals] = await Promise.all([
            this.prisma.book.findMany({
                where: {
                    status: 'AVAILABLE',
                },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    dailyPrice: true,
                    images: true,
                    status: true,
                    deposit: true,
                    createdAt: true,
                    averageRating: true,
                    reviewsCount: true,
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: {
                    averageRating: 'desc',
                },
                take: 4,
            }),
            this.prisma.book.findMany({
                where: {
                    status: 'AVAILABLE',
                },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    dailyPrice: true,
                    images: true,
                    status: true,
                    deposit: true,
                    createdAt: true,
                    averageRating: true,
                    reviewsCount: true,
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 4,
            }),
        ]);

        return {
            popular,
            newArrivals,
        };
    }
}
