import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS for Frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 2. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 3. Setup Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TOEIC Master API')
    .setDescription(
      'Hệ thống API RESTful cho Nền Tảng Luyện Thi TOEIC Thích Ứng & AI Tutor.\n\n' +
      'Bao gồm: Xác thực người dùng (JWT + Refresh Token + Google OAuth), Đề thi 200 câu, Chấm điểm ETS, Flashcard SRS và AI Phân tích bẫy.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập JWT Access Token (dạng: Bearer <token>)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Các API đăng ký, đăng nhập, cấp lại token và Google OAuth2')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'TOEIC Master - API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
}

await bootstrap();
