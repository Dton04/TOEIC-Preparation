import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { BatchImportQuestionsDto } from './dto/batch-import.dto.js';
import { CreateExplanationDto, CreateQuestionDto } from './dto/create-question.dto.js';
import { QueryPracticeDto } from './dto/query-practice.dto.js';
import { QuestionsService } from './questions.service.js';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('practice/:partNumber')
  @ApiOperation({ summary: 'Lấy câu hỏi luyện tập theo Part (Part 1..7)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách câu hỏi kèm đáp án và giải thích' })
  async getPracticeQuestions(
    @Param('partNumber', ParseIntPipe) partNumber: number,
    @Query() query: QueryPracticeDto,
  ) {
    return this.questionsService.getPracticeQuestions(partNumber, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết câu hỏi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về câu hỏi kèm lựa chọn và giải thích' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  async findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một câu hỏi trắc nghiệm mới (Yêu cầu quyền ADMIN hoặc TEACHER)' })
  @ApiResponse({ status: 201, description: 'Tạo câu hỏi thành công' })
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Nạp hàng loạt câu hỏi vào đề thi (Batch Import)' })
  @ApiResponse({ status: 201, description: 'Nạp danh sách câu hỏi thành công' })
  async batchImport(@Body() dto: BatchImportQuestionsDto) {
    return this.questionsService.batchImport(dto);
  }

  @Put(':id/explanation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật lời giải thích chi tiết cho câu hỏi' })
  @ApiResponse({ status: 200, description: 'Cập nhật lời giải thành công' })
  async updateExplanation(
    @Param('id') id: string,
    @Body() dto: CreateExplanationDto,
  ) {
    return this.questionsService.addOrUpdateExplanation(id, dto, false);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa câu hỏi theo ID (Yêu cầu quyền ADMIN)' })
  @ApiResponse({ status: 200, description: 'Xóa câu hỏi thành công' })
  async remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
