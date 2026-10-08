import { Module } from '@nestjs/common';
import { QueueModule } from '../../queues/queue.module.js';
import { ExamGradingProcessor } from './processors/exam-grading.processor.js';
import { SubmissionsController } from './submissions.controller.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  imports: [QueueModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, ExamGradingProcessor],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
