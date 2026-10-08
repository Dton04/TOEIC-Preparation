import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ExamType } from '../../../generated/prisma/enums.js';

export class CreateExamDto {
  @ApiProperty({
    example: 'ETS TOEIC 2026 - Test 01',
    description: 'Tên hoặc tiêu đề của bài thi',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài thi không được để trống' })
  title!: string;

  @ApiPropertyOptional({
    example: 'ets-toeic-2026-test-01',
    description: 'Slug định danh URL của bài thi (tự sinh nếu để trống)',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    enum: ExamType,
    default: ExamType.FULL_MOCK,
    description: 'Phân loại bài thi: FULL_MOCK, MINI_TEST, PART_PRACTICE',
  })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional({
    example: 200,
    default: 200,
    description: 'Tổng số câu hỏi trong bài thi',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  totalQuestions?: number;

  @ApiPropertyOptional({
    example: 120,
    default: 120,
    description: 'Thời gian làm bài thi tính theo phút',
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'Trạng thái phát hành bài thi cho học viên',
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: { difficultyLevel: 'Standard ETS', targetScoreRange: '500-750' },
    description: 'Metadata bổ sung dạng JSON',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
