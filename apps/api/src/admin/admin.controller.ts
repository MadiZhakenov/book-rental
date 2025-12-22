import { Controller, Get, Patch, Delete, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    async getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.adminService.getUsers(pageNum, limitNum);
    }

    @Patch('users/:id/ban')
    async banUser(@Param('id') id: string) {
        return this.adminService.banUser(id);
    }

    @Get('books')
    async getBooks(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.adminService.getBooks(pageNum, limitNum);
    }

    @Delete('books/:id')
    async deleteBook(@Param('id') id: string) {
        return this.adminService.deleteBook(id);
    }
}

