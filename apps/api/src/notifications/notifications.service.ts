import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    private prisma = new PrismaClient();

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: createNotificationDto.userId,
                title: createNotificationDto.title,
                message: createNotificationDto.message,
                type: createNotificationDto.type || NotificationType.INFO,
                link: createNotificationDto.link,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Уведомление не найдено');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('У вас нет доступа к этому уведомлению');
        }

        return this.prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
            },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
}


