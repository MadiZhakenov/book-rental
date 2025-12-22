import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AdminService {
    private prisma = new PrismaClient();

    async getStats() {
        const [totalUsers, totalBooks, activeRentals] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.book.count(),
            this.prisma.rental.count({
                where: {
                    status: {
                        in: ['PENDING', 'APPROVED', 'CONFIRMED', 'PAID', 'ACTIVE'],
                    },
                },
            }),
        ]);

        return {
            totalUsers,
            totalBooks,
            activeRentals,
        };
    }

    async getUsers(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    bio: true,
                    role: true,
                    isBlocked: true,
                    createdAt: true,
                    _count: {
                        select: {
                            books: true,
                            rentals: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            users: users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.bio || 'Пользователь',
                role: user.role,
                isBlocked: user.isBlocked,
                booksCount: user._count.books,
                rentalsCount: user._count.rentals,
                createdAt: user.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async banUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { isBlocked: true },
        });
    }

    async deleteBook(bookId: string) {
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Книга не найдена');
        }

        return this.prisma.book.delete({
            where: { id: bookId },
        });
    }

    async getBooks(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            this.prisma.book.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    author: true,
                    createdAt: true,
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            bio: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.book.count(),
        ]);

        return {
            books: books.map((book) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                owner: {
                    id: book.owner.id,
                    email: book.owner.email,
                    name: book.owner.bio || 'Пользователь',
                },
                createdAt: book.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

