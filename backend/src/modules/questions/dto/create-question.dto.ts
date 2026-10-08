import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Difficulty } from '../../../generated/prisma/enums.js';

export class CreateOptionDto {
  @ApiProperty({ example: 'A', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  optionKey!: string;

  @ApiProperty({ example: 'complication', description: 'Nội dung phương án' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ default: false, description: 'Đánh dấu đáp án đúng' })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean = false;
}

export class CreateExplanationDto {
  @ApiProperty({ example: 'Sau to be và trạng từ often ta cần tính từ...' })
  @IsString()
  @IsNotEmpty()
  correctReason!: string;

  @ApiPropertyOptional({
    example: { A: 'Danh từ không phù hợp', C: 'Động từ nguyên mẫu sai ngữ pháp' },
  })
  @IsOptional()
  @IsObject()
  incorrectReasons?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Các đánh giá của khách hàng chỉ ra rằng...' })
  @IsOptional()
  @IsString()
  translatedText?: string;

  @ApiPropertyOptional({ example: { indicate: 'chỉ ra', device: 'thiết bị' } })
  @IsOptional()
  @IsObject()
  vocabularyHighlights?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Subject + be + (adv) + Adjective + to-V' })
  @IsOptional()
  @IsString()
  grammarRule?: string;
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'ID của phần thi (ExamSection)' })
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiProperty({ example: 5, description: 'Phần thi Part 1..7' })
  @IsInt()
  @Min(1)
  @Max(7)
  partNumber!: number;

  @ApiProperty({ example: 101, description: 'Số thứ tự câu hỏi trong đề (1..200)' })
  @IsInt()
  @Min(1)
  @Max(200)
  questionNumber!: number;

  @ApiPropertyOptional({ example: 'Customer reviews indicate that many modern devices are often _______ to operate.' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://cdn.toeic.local/audio/part1_q1.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.toeic.local/images/part1_q1.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Đoạn văn đọc cho Part 6 và Part 7' })
  @IsOptional()
  @IsObject()
  passageContext?: Record<string, any>;

  @ApiPropertyOptional({ enum: Difficulty, default: Difficulty.MEDIUM })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ example: ['word_form', 'trap_grammar'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ type: [CreateOptionDto], description: 'Danh sách các lựa chọn A, B, C, D' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options!: CreateOptionDto[];

  @ApiPropertyOptional({ type: CreateExplanationDto, description: 'Lời giải chi tiết câu hỏi' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateExplanationDto)
  explanation?: CreateExplanationDto;
}
