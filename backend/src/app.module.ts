import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ExamsModule } from './modules/exams/exams.module.js';
import { QuestionsModule } from './modules/questions/questions.module.js';
import { SubmissionsModule } from './modules/submissions/submissions.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QueueModule } from './queues/queue.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env'],
    }),
    PrismaModule,
    QueueModule,
    AuthModule,
    ExamsModule,
    QuestionsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
