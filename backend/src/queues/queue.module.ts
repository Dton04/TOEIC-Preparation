import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const EXAM_GRADING_QUEUE = 'exam-grading';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD');
        return {
          connection: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: Number(config.get<number>('REDIS_PORT', 6379)),
            ...(password ? { password } : {}),
            maxRetriesPerRequest: null,
            connectTimeout: 5000,
            retryStrategy: (times) => {
              // Thử lại liên tục trong background, tối đa cách nhau 3 giây một lần
              return Math.min(times * 500, 3000);
            },
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: EXAM_GRADING_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
