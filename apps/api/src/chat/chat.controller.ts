import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('rentals/:id/messages')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async createMessage(
        @Param('id') rentalId: string,
        @Body() createMessageDto: CreateMessageDto,
        @Request() req: any,
    ) {
        const senderId = req.user.userId;
        return this.chatService.createMessage(rentalId, senderId, createMessageDto);
    }

    @Get()
    async getMessages(@Param('id') rentalId: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.chatService.getMessages(rentalId, userId);
    }
}

