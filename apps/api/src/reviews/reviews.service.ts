import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, RentalStatus } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    private prisma = new PrismaClient();

    async create(createReviewDto: CreateReviewDto, userId: string) {
        const { rentalId, rating, comment } = createReviewDto;

        // Find rental with book info
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: true,
            },
        });

        if (!rental) {
            throw new NotFoundException('Аренда не найдена');
        }

        // Verify rental belongs to user
        if (rental.userId !== userId) {
            throw new ForbiddenException('Вы можете оставить отзыв только на свою аренду');
        }

        // Verify rental status is COMPLETED
        if (rental.status !== RentalStatus.COMPLETED) {
            throw new BadRequestException('Можно оставить отзыв только после завершения аренды');
        }

        // Check if review already exists
        const existingReview = await this.prisma.review.findUnique({
            where: { rentalId },
        });

        if (existingReview) {
            throw new BadRequestException('Отзыв на эту аренду уже оставлен');
        }

        // Create review
        const review = await this.prisma.review.create({
            data: {
                rentalId,
                bookId: rental.bookId,
                authorId: userId,
                rating,
                comment: comment || null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Recalculate book rating
        await this.recalculateBookRating(rental.bookId);

        return review;
    }

    async findByBookId(bookId: string) {
        return this.prisma.review.findMany({
            where: {
                bookId,
            },
            include: {
                author: {
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
        });
    }

    private async recalculateBookRating(bookId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { bookId },
            select: { rating: true },
        });

        const reviewsCount = reviews.length;
        const averageRating = reviewsCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
            : 0;

        await this.prisma.book.update({
            where: { id: bookId },
            data: {
                averageRating,
                reviewsCount,
            },
        });
    }
}


