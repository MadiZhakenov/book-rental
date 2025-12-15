import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalStatusDto } from './dto/update-rental-status.dto';
import { VerifyRentalDto } from './dto/verify-rental.dto';

@Controller('rentals')
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createRentalDto: CreateRentalDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.rentalsService.create(createRentalDto, userId);
    }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    async findMyRentals(@Query('type') type: 'incoming' | 'outgoing', @Request() req: any) {
        const userId = req.user.userId;
        if (!type || (type !== 'incoming' && type !== 'outgoing')) {
            throw new BadRequestException('Type must be "incoming" or "outgoing"');
        }
        return this.rentalsService.findMyRentals(userId, type);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'))
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateRentalStatusDto,
        @Request() req: any,
    ) {
        const userId = req.user.userId;
        return this.rentalsService.updateStatus(id, updateStatusDto, userId);
    }

    @Post('verify')
    @UseGuards(AuthGuard('jwt'))
    async verifyRental(@Body() verifyRentalDto: VerifyRentalDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.rentalsService.verifyRental(verifyRentalDto, userId);
    }

    @Post(':id/return')
    @UseGuards(AuthGuard('jwt'))
    async confirmReturn(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.rentalsService.confirmReturn(id, userId);
    }
}
