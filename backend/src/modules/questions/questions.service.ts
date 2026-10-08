import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BatchImportQuestionsDto } from './dto/batch-import.dto.js';
import { CreateExplanationDto, CreateQuestionDto } from './dto/create-question.dto.js';
import { QueryPracticeDto } from './dto/query-practice.dto.js';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo một câu hỏi mới kèm 4 options và lời giải (nếu có)
   */
  async create(dto: CreateQuestionDto) {
    // 1. Kiểm tra tồn tại của ExamSection
    const section = await this.prisma.examSection.findUnique({
      where: { id: dto.sectionId },
    });
    if (!section) {
      throw new NotFoundException(`Không tìm thấy phần thi với ID "${dto.sectionId}"`);
    }

    // 2. Kiểm tra trùng questionNumber trong cùng section
    const existing = await this.prisma.question.findUnique({
      where: {
        sectionId_questionNumber: {
          sectionId: dto.sectionId,
          questionNumber: dto.questionNumber,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Câu hỏi số ${dto.questionNumber} đã tồn tại trong phần thi này`,
      );
    }

    // 3. Tạo câu hỏi kèm options trong transaction
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          sectionId: dto.sectionId,
          partNumber: dto.partNumber,
          questionNumber: dto.questionNumber,
          content: dto.content,
          audioUrl: dto.audioUrl,
          imageUrl: dto.imageUrl,
          passageContext: dto.passageContext,
          difficulty: dto.difficulty || 'MEDIUM',
          tags: dto.tags || [],
          options: {
            create: dto.options.map((opt) => ({
              optionKey: opt.optionKey,
              content: opt.content,
              isCorrect: opt.isCorrect ?? false,
            })),
          },
          ...(dto.explanation && {
            explanation: {
              create: {
                correctReason: dto.explanation.correctReason,
                incorrectReasons: dto.explanation.incorrectReasons,
                translatedText: dto.explanation.translatedText,
                vocabularyHighlights: dto.explanation.vocabularyHighlights,
                grammarRule: dto.explanation.grammarRule,
                isAiGenerated: false,
              },
            },
          }),
        },
        include: {
          options: {
            orderBy: { optionKey: 'asc' },
          },
          explanation: true,
        },
      });

      return question;
    });
  }

  /**
   * Nạp danh sách câu hỏi hàng loạt (Batch Import)
   */
  async batchImport(dto: BatchImportQuestionsDto) {
    const section = await this.prisma.examSection.findUnique({
      where: { id: dto.sectionId },
    });
    if (!section) {
      throw new NotFoundException(`Không tìm thấy phần thi với ID "${dto.sectionId}"`);
    }

    let successCount = 0;
    for (const qDto of dto.questions) {
      await this.create({
        ...qDto,
        sectionId: dto.sectionId,
      });
      successCount++;
    }

    return {
      success: true,
      importedCount: successCount,
      message: `Đã nạp thành công ${successCount} câu hỏi vào phần thi`,
    };
  }

  /**
   * Lấy chi tiết câu hỏi theo ID
   */
  async findById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { optionKey: 'asc' },
        },
        explanation: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID "${id}"`);
    }

    return question;
  }

  /**
   * Lấy danh sách câu hỏi cho chế độ luyện tập theo Part (Part 1..7)
   */
  async getPracticeQuestions(partNumber: number, query: QueryPracticeDto) {
    if (partNumber < 1 || partNumber > 7) {
      throw new BadRequestException('Part phải nằm trong khoảng từ 1 đến 7');
    }

    const { difficulty, tag, limit = 10 } = query;

    const where: any = { partNumber };
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (tag) {
      where.tags = { has: tag };
    }

    const questions = await this.prisma.question.findMany({
      where,
      take: limit,
      include: {
        options: {
          orderBy: { optionKey: 'asc' },
          // Trong practice mode, trả về đầy đủ để kiểm tra đáp án ngay
        },
        explanation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      partNumber,
      count: questions.length,
      data: questions,
    };
  }

  /**
   * Thêm hoặc cập nhật lời giải thích câu hỏi (Teacher hoặc AI Worker)
   */
  async addOrUpdateExplanation(questionId: string, dto: CreateExplanationDto, isAi: boolean = false) {
    await this.findById(questionId);

    return this.prisma.questionExplanation.upsert({
      where: { questionId },
      update: {
        correctReason: dto.correctReason,
        incorrectReasons: dto.incorrectReasons,
        translatedText: dto.translatedText,
        vocabularyHighlights: dto.vocabularyHighlights,
        grammarRule: dto.grammarRule,
        isAiGenerated: isAi,
      },
      create: {
        questionId,
        correctReason: dto.correctReason,
        incorrectReasons: dto.incorrectReasons,
        translatedText: dto.translatedText,
        vocabularyHighlights: dto.vocabularyHighlights,
        grammarRule: dto.grammarRule,
        isAiGenerated: isAi,
      },
    });
  }

  /**
   * Xóa câu hỏi
   */
  async remove(id: string) {
    await this.findById(id);

    await this.prisma.question.delete({
      where: { id },
    });

    return { success: true, message: 'Đã xóa câu hỏi thành công' };
  }
}
