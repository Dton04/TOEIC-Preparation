import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto.js';

export class BatchImportQuestionsDto {
  @ApiProperty({ description: 'ID của ExamSection cần nạp danh sách câu hỏi' })
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @ApiProperty({ type: [CreateQuestionDto], description: 'Danh sách các câu hỏi cần nạp hàng loạt' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}
