import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll(@Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.findAll(userId);
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard('jwt'))
    async markAsRead(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @UseGuards(AuthGuard('jwt'))
    async markAllAsRead(@Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.markAllAsRead(userId);
    }
}


