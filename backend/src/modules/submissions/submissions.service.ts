import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Role, SubmissionStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EXAM_GRADING_QUEUE } from '../../queues/queue.module.js';
import { QuerySubmissionDto } from './dto/query-submission.dto.js';
import { SubmitExamDto } from './dto/submit-exam.dto.js';
import { ExamGradingJobData, ExamGradingProcessor } from './processors/exam-grading.processor.js';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EXAM_GRADING_QUEUE)
    private readonly gradingQueue: Queue<ExamGradingJobData>,
    private readonly gradingProcessor: ExamGradingProcessor,
  ) {}

  /**
   * Nộp bài thi và đẩy vào hàng đợi BullMQ để chấm điểm bất đồng bộ
   */
  async submitExam(userId: string, dto: SubmitExamDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
    });

    if (!exam) {
      throw new NotFoundException('Đề thi không tồn tại');
    }

    // 1. Tạo bản ghi Submission ở trạng thái IN_PROGRESS
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        examId: dto.examId,
        timeSpentSeconds: dto.timeSpentSeconds ?? 0,
        status: SubmissionStatus.IN_PROGRESS,
      },
    });

    // 2. Lưu các câu trả lời thô của thí sinh
    if (dto.answers && dto.answers.length > 0) {
      await this.prisma.submissionAnswer.createMany({
        data: dto.answers.map((ans) => ({
          submissionId: submission.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId || null,
          timeSpentSeconds: ans.timeSpentSeconds || 0,
          isCorrect: false,
        })),
        skipDuplicates: true,
      });
    }

    // 3. Đưa vào BullMQ Queue để chấm điểm (có Fallback graceful nếu Redis offline)
    try {
      const job = await this.gradingQueue.add(
        'grade-submission',
        { submissionId: submission.id },
        { jobId: `grade-${submission.id}` },
      );

      return {
        message: 'Bài thi đã được tiếp nhận và đưa vào hàng đợi chấm điểm',
        submissionId: submission.id,
        jobId: job.id,
        status: submission.status,
      };
    } catch (queueError: any) {
      this.logger.warn(
        `[BullMQ] Không thể kết nối Redis (${queueError.message}). Chuyển sang chấm điểm trực tiếp đồng bộ (Fallback)...`,
      );

      await this.gradingProcessor.process({
        id: `sync-${submission.id}`,
        data: { submissionId: submission.id },
      } as any);

      return {
        message: 'Bài thi đã được chấm điểm hoàn tất (Chế độ dự phòng đồng bộ)',
        submissionId: submission.id,
        jobId: null,
        status: SubmissionStatus.COMPLETED,
      };
    }
  }

  /**
   * Lấy chi tiết kết quả bài thi (Bao gồm phân tích theo Part, giải thích câu hỏi)
   */
  async getSubmissionResult(userId: string, userRole: Role, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            durationMinutes: true,
            totalQuestions: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
                explanation: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy kết quả bài thi');
    }

    // Kiểm tra quyền: Chỉ chính học viên hoặc Admin/Teacher mới được xem
    if (submission.userId !== userId && userRole === Role.STUDENT) {
      throw new ForbiddenException('Bạn không có quyền xem kết quả của bài thi này');
    }

    // Nếu bài thi chưa chấm xong
    if (submission.status === SubmissionStatus.IN_PROGRESS) {
      return {
        id: submission.id,
        status: submission.status,
        message: 'Bài thi đang trong quá trình chấm điểm, vui lòng thử lại sau giây lát...',
        exam: submission.exam,
      };
    }

    // Phân tích thống kê theo từng Part (Part 1 -> Part 7)
    const partStats: Record<
      number,
      { part: number; total: number; correct: number; incorrect: number; unattempted: number; accuracy: number }
    > = {};

    for (let part = 1; part <= 7; part++) {
      partStats[part] = {
        part,
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        accuracy: 0,
      };
    }

    let totalCorrect = 0;
    let totalUnattempted = 0;

    for (const ans of submission.answers) {
      const p = ans.question.partNumber;
      if (!partStats[p]) {
        partStats[p] = { part: p, total: 0, correct: 0, incorrect: 0, unattempted: 0, accuracy: 0 };
      }

      partStats[p].total++;
      if (!ans.selectedOptionId) {
        partStats[p].unattempted++;
        totalUnattempted++;
      } else if (ans.isCorrect) {
        partStats[p].correct++;
        totalCorrect++;
      } else {
        partStats[p].incorrect++;
      }
    }

    // Tính tỷ lệ chính xác từng part
    Object.values(partStats).forEach((p) => {
      if (p.total > 0) {
        p.accuracy = Math.round((p.correct / p.total) * 100);
      }
    });

    const totalQuestions = submission.answers.length;
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      id: submission.id,
      status: submission.status,
      exam: submission.exam,
      scores: {
        totalScore: submission.totalScore,
        listeningScore: submission.listeningScore,
        readingScore: submission.readingScore,
        accuracy: overallAccuracy,
        totalCorrect,
        totalIncorrect: totalQuestions - totalCorrect - totalUnattempted,
        totalUnattempted,
        totalQuestions,
      },
      timeSpentSeconds: submission.timeSpentSeconds,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      partBreakdown: Object.values(partStats).filter((p) => p.total > 0),
      answers: submission.answers.map((ans) => ({
        questionId: ans.questionId,
        questionNumber: ans.question.questionNumber,
        partNumber: ans.question.partNumber,
        content: ans.question.content,
        audioUrl: ans.question.audioUrl,
        imageUrl: ans.question.imageUrl,
        passageContext: ans.question.passageContext,
        selectedOptionId: ans.selectedOptionId,
        isCorrect: ans.isCorrect,
        timeSpentSeconds: ans.timeSpentSeconds,
        options: ans.question.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          content: opt.content,
          isCorrect: opt.isCorrect,
        })),
        explanation: ans.question.explanation,
      })),
    };
  }

  /**
   * Lấy lịch sử thi của người dùng
   */
  async getUserSubmissions(userId: string, query: QuerySubmissionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({
        where: { userId },
      }),
      this.prisma.submission.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              totalQuestions: true,
            },
          },
        },
      }),
    ]);

    return {
      data: submissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
