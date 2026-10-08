import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { QuerySubmissionDto } from './dto/query-submission.dto.js';
import { SubmitExamDto } from './dto/submit-exam.dto.js';
import { SubmissionsService } from './submissions.service.js';

@ApiTags('Submissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('submit')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Nộp bài thi TOEIC (Xử lý bất đồng bộ qua BullMQ)',
    description:
      'Nhận danh sách câu trả lời, lưu bài thi và đẩy vào hàng đợi BullMQ để chấm điểm bất đồng bộ. Trả về HTTP 202 Accepted ngay lập tức để không block kết nối.',
  })
  @ApiResponse({
    status: 202,
    description: 'Bài thi đã được tiếp nhận và xếp vào hàng đợi chấm điểm',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đề thi' })
  async submitExam(
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitExamDto,
  ) {
    return this.submissionsService.submitExam(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem kết quả chi tiết bài thi, thang điểm ETS và phân tích câu trả lời',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về bảng điểm (Listening, Reading, Tổng), phân tích từng Part và chi tiết đúng/sai',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập bài thi này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  async getSubmissionResult(
    @CurrentUser() user: { id: string; role: any },
    @Param('id') id: string,
  ) {
    return this.submissionsService.getSubmissionResult(user.id, user.role, id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử làm bài thi của học viên hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách bài thi đã làm kèm phân trang' })
  async getUserSubmissions(
    @CurrentUser() user: { id: string },
    @Query() query: QuerySubmissionDto,
  ) {
    return this.submissionsService.getUserSubmissions(user.id, query);
  }
}
