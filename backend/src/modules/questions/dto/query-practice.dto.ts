import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Difficulty } from '../../../generated/prisma/enums.js';

export class QueryPracticeDto {
  @ApiPropertyOptional({ enum: Difficulty, description: 'Lọc độ khó (EASY, MEDIUM, HARD)' })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ example: 'trap_same_sound', description: 'Lọc câu hỏi theo thẻ bẫy đề thi' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ default: 10, description: 'Số lượng câu hỏi cần lấy cho phiên luyện tập' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
