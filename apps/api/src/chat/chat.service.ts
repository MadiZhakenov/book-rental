import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
    private prisma = new PrismaClient();

    async createMessage(rentalId: string, senderId: string, createMessageDto: CreateMessageDto) {
        // Проверяем, что аренда существует
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: {
                    select: {
                        ownerId: true,
                    },
                },
            },
        });

        if (!rental) {
            throw new NotFoundException('Аренда не найдена');
        }

        // Проверяем, что пользователь является участником сделки
        const isParticipant = rental.userId === senderId || rental.book.ownerId === senderId;
        if (!isParticipant) {
            throw new ForbiddenException('У вас нет доступа к этому чату');
        }

        // Создаем сообщение
        return this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                senderId,
                rentalId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }

    async getMessages(rentalId: string, userId: string) {
        // Проверяем, что аренда существует
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                book: {
                    select: {
                        ownerId: true,
                    },
                },
            },
        });

        if (!rental) {
            throw new NotFoundException('Аренда не найдена');
        }

        // Проверяем, что пользователь является участником сделки
        const isParticipant = rental.userId === userId || rental.book.ownerId === userId;
        if (!isParticipant) {
            throw new ForbiddenException('У вас нет доступа к этому чату');
        }

        // Получаем все сообщения для аренды
        return this.prisma.message.findMany({
            where: {
                rentalId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
}

