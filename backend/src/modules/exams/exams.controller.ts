import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { QueryExamDto } from './dto/query-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { ExamsService } from './exams.service.js';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đề thi (hỗ trợ tìm kiếm, lọc theo loại và phân trang)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài thi và metadata phân trang' })
  async findAll(@Query() query: QueryExamDto) {
    return this.examsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Lấy chi tiết đề thi theo slug (chuẩn bị vào phòng thi)' })
  @ApiQuery({
    name: 'forTakingTest',
    required: false,
    type: Boolean,
    description: 'Nếu true (mặc định), ẩn trường isCorrect để chống cheat khi thi',
  })
  @ApiResponse({ status: 200, description: 'Trả về toàn bộ sections, câu hỏi và lựa chọn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đề thi' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('forTakingTest') forTakingTest?: string,
  ) {
    const isTestMode = forTakingTest !== 'false';
    return this.examsService.findBySlug(slug, isTestMode);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo đề thi mới (Yêu cầu quyền ADMIN)' })
  @ApiResponse({ status: 201, description: 'Tạo đề thi thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật đề thi theo ID (Yêu cầu quyền ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa đề thi theo ID (Yêu cầu quyền ADMIN)' })
  @ApiResponse({ status: 200, description: 'Xóa bài thi thành công' })
  async remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
