---
name: bullmq-task-runner
description: >-
  Use this skill when implementing, configuring, or troubleshooting asynchronous job queues, background workers, and Redis-backed task scheduling using BullMQ in the NestJS backend.
---

# BullMQ & Redis Background Worker Architecture

This skill defines conventions for setting up and managing asynchronous queues and background workers in the NestJS application.

---

## 1. Queue Naming Conventions

Standardize queue names across the application:
- `exam-grading`: Chấm điểm bài thi 200 câu, tính percentile, và lưu `SubmissionAnswers`.
- `ai-generation`: Gọi third-party LLM để sinh lời giải câu hỏi hoặc phân tích điểm yếu.
- `media-transcoding`: Nén âm thanh Part 1-4, trích xuất waveform/timestamps và đẩy lên CDN.
- `study-reminders`: Gửi email/notification định kỳ (BullMQ Repeatable Jobs).

---

## 2. NestJS BullMQ Configuration Pattern

Install necessary packages in `backend`:
```bash
npm install @nestjs/bullmq bullmq ioredis
npm install -D @types/ioredis
```

In `backend/src/queues/queue.module.ts`:
```typescript
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'exam-grading',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
})
export class QueueModule {}
```

---

## 3. Worker Implementation Pattern

Create a processor with concurrency limits:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('exam-grading', { concurrency: 5 })
export class ExamGradingProcessor extends WorkerHost {
  async process(job: Job<{ submissionId: string }>): Promise<any> {
    const { submissionId } = job.data;
    // 1. Fetch user submission & questions
    // 2. Compute correct answers & ETS scale score
    // 3. Update database record to COMPLETED
    return { success: true };
  }
}
```
