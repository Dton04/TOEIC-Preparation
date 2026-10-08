import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

export class AnswerItemDto {
  @ApiProperty({ description: 'ID câu hỏi' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({ description: 'ID đáp án đã chọn (bỏ trống nếu thí sinh không chọn)' })
  @IsUUID()
  @IsOptional()
  selectedOptionId?: string;

  @ApiPropertyOptional({ description: 'Thời gian làm câu hỏi tính theo giây' })
  @IsInt()
  @Min(0)
  @IsOptional()
  timeSpentSeconds?: number;
}

export class SubmitExamDto {
  @ApiProperty({ description: 'ID của đề thi cần nộp' })
  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @ApiPropertyOptional({ description: 'Tổng thời gian làm bài thực tế tính bằng giây', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  timeSpentSeconds?: number;

  @ApiProperty({
    type: [AnswerItemDto],
    description: 'Danh sách các câu trả lời của thí sinh',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
