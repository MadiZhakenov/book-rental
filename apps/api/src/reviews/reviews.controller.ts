import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.reviewsService.create(createReviewDto, userId);
    }

    @Get('book/:bookId')
    async findByBookId(@Param('bookId') bookId: string) {
        return this.reviewsService.findByBookId(bookId);
    }
}


