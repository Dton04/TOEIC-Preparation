import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { QueryExamDto } from './dto/query-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo slug thân thiện URL từ tiêu đề
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .concat(`-${Date.now().toString(36)}`);
  }

  /**
   * Lấy danh sách đề thi (hỗ trợ phân trang, tìm kiếm, lọc theo loại)
   */
  async findAll(query: QueryExamDto) {
    const { search, type, isPublished, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [total, items] = await Promise.all([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              sections: true,
              submissions: true,
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết đề thi bằng Slug (để vào phòng thi hoặc xem thông tin)
   * @param slug Slug của bài thi
   * @param forTakingTest Nếu true, ẩn trường isCorrect của từng option để bảo mật chống cheat F12
   */
  async findBySlug(slug: string, forTakingTest: boolean = true) {
    const exam = await this.prisma.exam.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { partNumber: 'asc' },
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' },
              include: {
                options: {
                  orderBy: { optionKey: 'asc' },
                  select: {
                    id: true,
                    questionId: true,
                    optionKey: true,
                    content: true,
                    // Chỉ trả về isCorrect khi không phải chế độ làm bài thi
                    isCorrect: !forTakingTest,
                  },
                },
                // Nếu không phải đang thi, kèm theo lời giải thích
                ...(!forTakingTest && {
                  explanation: true,
                }),
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với slug "${slug}"`);
    }

    return exam;
  }

  /**
   * Lấy chi tiết đề thi bằng ID
   */
  async findById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { partNumber: 'asc' },
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID "${id}"`);
    }

    return exam;
  }

  /**
   * Tạo đề thi mới (Admin)
   */
  async create(dto: CreateExamDto) {
    const slug = dto.slug || this.generateSlug(dto.title);

    // Kiểm tra trùng slug
    const existing = await this.prisma.exam.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" đã tồn tại trong hệ thống`);
    }

    const exam = await this.prisma.exam.create({
      data: {
        title: dto.title,
        slug,
        type: dto.type,
        totalQuestions: dto.totalQuestions,
        durationMinutes: dto.durationMinutes,
        isPublished: dto.isPublished ?? false,
        metadata: dto.metadata || {},
      },
    });

    // Nếu là FULL_MOCK (200 câu), tự động khởi tạo 7 Sections chuẩn Part 1 - Part 7
    if (exam.type === 'FULL_MOCK') {
      const defaultSections = [
        { partNumber: 1, title: 'Part 1: Photographs', instructions: 'Look at the picture and choose the best statement.' },
        { partNumber: 2, title: 'Part 2: Question - Response', instructions: 'Listen to the question and three responses.' },
        { partNumber: 3, title: 'Part 3: Short Conversations', instructions: 'Listen to the conversation and answer three questions.' },
        { partNumber: 4, title: 'Part 4: Short Talks', instructions: 'Listen to the talk and answer three questions.' },
        { partNumber: 5, title: 'Part 5: Incomplete Sentences', instructions: 'Select the best answer to complete each sentence.' },
        { partNumber: 6, title: 'Part 6: Text Completion', instructions: 'Select the best answer to complete the text.' },
        { partNumber: 7, title: 'Part 7: Reading Comprehension', instructions: 'Read the passages and answer the questions.' },
      ];

      await this.prisma.examSection.createMany({
        data: defaultSections.map((s) => ({
          examId: exam.id,
          partNumber: s.partNumber,
          title: s.title,
          instructions: s.instructions,
        })),
      });
    }

    return this.findById(exam.id);
  }

  /**
   * Cập nhật thông tin bài thi (Admin)
   */
  async update(id: string, dto: UpdateExamDto) {
    await this.findById(id);

    return this.prisma.exam.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  /**
   * Xóa bài thi (Admin)
   */
  async remove(id: string) {
    await this.findById(id);

    await this.prisma.exam.delete({
      where: { id },
    });

    return { success: true, message: 'Đã xóa bài thi thành công' };
  }
}
