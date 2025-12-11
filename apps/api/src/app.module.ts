import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { RentalsModule } from './rentals/rentals.module';

@Module({
  imports: [AuthModule, UsersModule, BooksModule, RentalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
