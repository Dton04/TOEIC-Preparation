import { describe, expect, it, vi } from 'vitest';
import { SubmissionStatus } from '../../../generated/prisma/enums.js';
import { ExamGradingProcessor } from './exam-grading.processor.js';

describe('ExamGradingProcessor', () => {
  it('nên xử lý chấm điểm đúng và cập nhật trạng thái COMPLETED', async () => {
    const mockPrisma = {
      submission: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'sub-1',
          exam: {
            sections: [
              {
                partNumber: 1,
                questions: [
                  {
                    id: 'q-1',
                    partNumber: 1,
                    options: [
                      { id: 'opt-a', optionKey: 'A', isCorrect: true },
                      { id: 'opt-b', optionKey: 'B', isCorrect: false },
                    ],
                  },
                ],
              },
            ],
          },
          answers: [
            {
              questionId: 'q-1',
              selectedOptionId: 'opt-a',
              timeSpentSeconds: 15,
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      submissionAnswer: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn(async (cb) => {
        return cb(mockPrisma);
      }),
    };

    const processor = new ExamGradingProcessor(mockPrisma as any);
    const result = await processor.process({
      id: 'job-1',
      data: { submissionId: 'sub-1' },
    } as any);

    expect(result.success).toBe(true);
    expect(result.grading.totalScore).toBe(495); // 1/1 LC = 100% LC = 495
    expect(mockPrisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
        }),
      }),
    );
  });
});
