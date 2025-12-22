import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, RentalStatus, NotificationType } from '@prisma/client';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import { VerifyRentalDto, RentalAction } from './dto/verify-rental.dto';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RentalsService {
    private prisma = new PrismaClient();

    constructor(private notificationsService: NotificationsService) {}

    async create(createRentalDto: CreateRentalDto, userId: string) {
        const { bookId, startDate, endDate } = createRentalDto;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            throw new BadRequestException('Дата начала не может быть в прошлом');
        }

        if (end <= start) {
            throw new BadRequestException('Дата окончания должна быть позже даты начала');
        }

        // Check if book exists
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            throw new NotFoundException('Книга не найдена');
        }

        // Check if user is trying to rent their own book
        if (book.ownerId === userId) {
            throw new BadRequestException('Нельзя арендовать свою собственную книгу');
        }

        // Check for date conflicts with APPROVED or ACTIVE rentals
        const conflictingRentals = await this.prisma.rental.findMany({
            where: {
                bookId,
                status: {
                    in: [RentalStatus.APPROVED, RentalStatus.ACTIVE],
                },
                OR: [
                    {
                        AND: [
                            { startDate: { lte: end } },
                            { endDate: { gte: start } },
                        ],
                    },
                ],
            },
        });

        if (conflictingRentals.length > 0) {
            throw new BadRequestException('Книга уже забронирована на выбранные даты');
        }

        // Calculate total price
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = days * book.dailyPrice;

        // Generate pickup secret
        const pickupSecret = randomUUID();

        // Create rental
        const rental = await this.prisma.rental.create({
            data: {
                bookId,
                userId,
                startDate: start,
                endDate: end,
                totalPrice,
                status: RentalStatus.PENDING,
                pickupSecret,
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        dailyPrice: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        // Create notification for book owner
        await this.notificationsService.create({
            userId: book.ownerId,
            title: 'Новый запрос на аренду',
            message: `У вас новый запрос на аренду "${book.title}"`,
            type: NotificationType.INFO,
            link: `/profile?tab=incoming`,
        });

        return rental;
    }

    async findMyRentals(userId: string, type: 'incoming' | 'outgoing') {
        if (type === 'outgoing') {
            // Rentals where user is the renter
            return this.prisma.rental.findMany({
                where: {
                    userId,
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            dailyPrice: true,
                            owner: {
                                select: {
                                    id: true,
                                    email: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } else {
            // Rentals for books owned by user
            return this.prisma.rental.findMany({
                where: {
                    book: {
                        ownerId: userId,
                    },
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            dailyPrice: true,
                        },
                    },
                    user: {
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
    }

    async updateStatus(rentalId: string, updateStatusDto: UpdateRentalStatusDto, userId: string) {
        const { status } = updateStatusDto;

        // Find rental with book info
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: true,
            },
        });

        if (!rental) {
            throw new NotFoundException('Заявка на аренду не найдена');
        }

        // Verify user is the book owner
        if (rental.book.ownerId !== userId) {
            throw new ForbiddenException('Только владелец книги может изменить статус заявки');
        }

        // Only allow status update for PENDING rentals
        if (rental.status !== RentalStatus.PENDING) {
            throw new BadRequestException('Можно изменить статус только для заявок в статусе PENDING');
        }

        // Update status
        const updatedRental = await this.prisma.rental.update({
            where: { id: rentalId },
            data: {
                status: status as RentalStatus,
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        dailyPrice: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Create notification for renter
        const statusMessage = status === 'APPROVED' 
            ? `Ваш запрос на "${rental.book.title}" одобрен`
            : `Ваш запрос на "${rental.book.title}" отклонен`;

        await this.notificationsService.create({
            userId: rental.userId,
            title: status === 'APPROVED' ? 'Запрос одобрен' : 'Запрос отклонен',
            message: statusMessage,
            type: status === 'APPROVED' ? NotificationType.SUCCESS : NotificationType.WARNING,
            link: `/profile?tab=outgoing`,
        });

        return updatedRental;
    }

    async verifyRental(verifyRentalDto: VerifyRentalDto, userId: string) {
        const { rentalId, secret, action } = verifyRentalDto;

        // Find rental with book info
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: true,
            },
        });

        if (!rental) {
            throw new NotFoundException('Заявка на аренду не найдена');
        }

        // Verify user is the book owner
        if (rental.book.ownerId !== userId) {
            throw new ForbiddenException('Только владелец книги может подтвердить операцию');
        }

        if (action === RentalAction.PICKUP) {
            // PICKUP logic
            if (rental.status !== RentalStatus.APPROVED) {
                throw new BadRequestException('Можно забрать только книгу со статусом APPROVED');
            }

            if (!rental.pickupSecret || rental.pickupSecret !== secret) {
                throw new BadRequestException('Неверный секретный код');
            }

            // Update status to ACTIVE
            const updatedRental = await this.prisma.rental.update({
                where: { id: rentalId },
                data: {
                    status: RentalStatus.ACTIVE,
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            dailyPrice: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
            });

            // Create notification for renter
            await this.notificationsService.create({
                userId: rental.userId,
                title: 'Аренда началась',
                message: `Аренда "${rental.book.title}" началась. Приятного чтения!`,
                type: NotificationType.SUCCESS,
                link: `/profile?tab=outgoing`,
            });

            return updatedRental;
        } else if (action === RentalAction.RETURN) {
            // RETURN logic
            if (rental.status !== RentalStatus.ACTIVE) {
                throw new BadRequestException('Можно вернуть только книгу со статусом ACTIVE');
            }

            // Update status to COMPLETED
            return this.prisma.rental.update({
                where: { id: rentalId },
                data: {
                    status: RentalStatus.COMPLETED,
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            dailyPrice: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
        } else {
            throw new BadRequestException('Неизвестное действие');
        }
    }

    async confirmReturn(rentalId: string, userId: string) {
        // Find rental with book info
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: true,
            },
        });

        if (!rental) {
            throw new NotFoundException('Заявка на аренду не найдена');
        }

        // Verify user is the book owner
        if (rental.book.ownerId !== userId) {
            throw new ForbiddenException('Только владелец книги может подтвердить возврат');
        }

        // Verify rental status is ACTIVE
        if (rental.status !== RentalStatus.ACTIVE) {
            throw new BadRequestException('Можно подтвердить возврат только для аренды со статусом ACTIVE');
        }

        // Update status to COMPLETED
        return this.prisma.rental.update({
            where: { id: rentalId },
            data: {
                status: RentalStatus.COMPLETED,
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        dailyPrice: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
}
