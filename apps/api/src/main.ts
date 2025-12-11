import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Загружаем .env
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Включаем CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.API_PORT || 4000);
}
bootstrap();
