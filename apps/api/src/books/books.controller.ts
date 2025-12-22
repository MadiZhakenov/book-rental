import { Controller, Post, Get, Body, UseGuards, Request, Param, Put, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PublicBooksQueryDto } from './dto/public-books-query.dto';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createBookDto: CreateBookDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.booksService.create(createBookDto, userId);
    }

    @Get()
    async findAll() {
        return this.booksService.findAll();
    }

    @Get('public')
    async findPublicBooks(@Query() query: PublicBooksQueryDto) {
        return this.booksService.findAllPublic(query);
    }

    @Get('featured')
    async getFeatured() {
        return this.booksService.getFeatured();
    }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    async findMyBooks(@Request() req: any) {
        const userId = req.user.userId;
        return this.booksService.findAllByOwner(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.booksService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.booksService.update(id, updateBookDto, userId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async remove(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.booksService.remove(id, userId);
    }
}
