import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ExamType } from '../../../generated/prisma/enums.js';

export class QueryExamDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tiêu đề bài thi',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ExamType,
    description: 'Lọc theo thể loại bài thi',
  })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đã phát hành (mặc định cho học sinh: true)',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean;

  @ApiPropertyOptional({
    default: 1,
    description: 'Trang hiện tại (phân trang)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
    description: 'Số lượng đề thi trên mỗi trang',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
