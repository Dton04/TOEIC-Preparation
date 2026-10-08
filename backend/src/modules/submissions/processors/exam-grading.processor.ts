import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SubmissionStatus } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { EXAM_GRADING_QUEUE } from '../../../queues/queue.module.js';
import { calculateToeicScore } from '../utils/toeic-scoring.util.js';

export interface ExamGradingJobData {
  submissionId: string;
}

@Processor(EXAM_GRADING_QUEUE, { concurrency: 5 })
export class ExamGradingProcessor extends WorkerHost {
  private readonly logger = new Logger(ExamGradingProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ExamGradingJobData>): Promise<any> {
    const { submissionId } = job.data;
    this.logger.log(`[Job ${job.id}] Bắt đầu chấm bài thi cho submissionId: ${submissionId}`);

    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          exam: {
            include: {
              sections: {
                include: {
                  questions: {
                    include: {
                      options: true,
                    },
                  },
                },
              },
            },
          },
          answers: true,
        },
      });

      if (!submission) {
        throw new Error(`Không tìm thấy bài nộp với submissionId: ${submissionId}`);
      }

      // Tổng hợp tất cả câu hỏi trong bài thi
      const allQuestions = submission.exam.sections.flatMap((s) => s.questions);
      const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

      // Tạo map của các câu trả lời mà thí sinh đã gửi
      const answerMap = new Map(submission.answers.map((a) => [a.questionId, a]));

      let listeningCorrect = 0;
      let listeningTotal = 0;
      let readingCorrect = 0;
      let readingTotal = 0;

      const answerUpdates: Array<{
        questionId: string;
        selectedOptionId: string | null;
        isCorrect: boolean;
        timeSpentSeconds: number;
      }> = [];

      for (const question of allQuestions) {
        const studentAnswer = answerMap.get(question.id);
        const selectedOptionId = studentAnswer?.selectedOptionId ?? null;
        const timeSpent = studentAnswer?.timeSpentSeconds ?? 0;

        let isCorrect = false;
        if (selectedOptionId) {
          const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
          if (selectedOption && selectedOption.isCorrect) {
            isCorrect = true;
          }
        }

        // Phân loại kỹ năng Listening (Part 1-4) hoặc Reading (Part 5-7)
        const isListening = question.partNumber >= 1 && question.partNumber <= 4;
        if (isListening) {
          listeningTotal++;
          if (isCorrect) listeningCorrect++;
        } else {
          readingTotal++;
          if (isCorrect) readingCorrect++;
        }

        answerUpdates.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
          timeSpentSeconds: timeSpent,
        });
      }

      // Tính điểm theo chuẩn ETS
      const grading = calculateToeicScore(
        listeningCorrect,
        listeningTotal,
        readingCorrect,
        readingTotal,
      );

      // Cập nhật từng câu trả lời trong database
      await this.prisma.$transaction(async (tx) => {
        for (const ans of answerUpdates) {
          await tx.submissionAnswer.upsert({
            where: {
              submissionId_questionId: {
                submissionId,
                questionId: ans.questionId,
              },
            },
            create: {
              submissionId,
              questionId: ans.questionId,
              selectedOptionId: ans.selectedOptionId,
              isCorrect: ans.isCorrect,
              timeSpentSeconds: ans.timeSpentSeconds,
            },
            update: {
              selectedOptionId: ans.selectedOptionId,
              isCorrect: ans.isCorrect,
              timeSpentSeconds: ans.timeSpentSeconds,
            },
          });
        }

        // Cập nhật trạng thái và điểm tổng cho Submission
        await tx.submission.update({
          where: { id: submissionId },
          data: {
            listeningScore: grading.listeningScore,
            readingScore: grading.readingScore,
            totalScore: grading.totalScore,
            status: SubmissionStatus.COMPLETED,
            submittedAt: new Date(),
          },
        });
      });

      this.logger.log(
        `[Job ${job.id}] Chấm điểm thành công submissionId: ${submissionId} | LC: ${grading.listeningScore} (${listeningCorrect}/${listeningTotal}) | RC: ${grading.readingScore} (${readingCorrect}/${readingTotal}) | Tổng: ${grading.totalScore}/990`,
      );

      return {
        success: true,
        submissionId,
        grading,
      };
    } catch (error: any) {
      this.logger.error(`[Job ${job.id}] Lỗi khi chấm bài thi ${submissionId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
