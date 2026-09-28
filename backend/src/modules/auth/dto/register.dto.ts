import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'hocvien@gmail.com',
    description: 'Địa chỉ email của học viên',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu bảo mật (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({
    example: 'Nguyễn Văn Đạt',
    description: 'Họ và tên đầy đủ',
    minLength: 2,
  })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  fullName!: string;

  @ApiPropertyOptional({
    example: 750,
    description: 'Mục tiêu điểm số TOEIC (10 - 990)',
    minimum: 10,
    maximum: 990,
    default: 700,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Điểm mục tiêu phải là số' })
  @Min(10, { message: 'Điểm mục tiêu tối thiểu là 10' })
  @Max(990, { message: 'Điểm mục tiêu tối đa là 990' })
  targetScore?: number;
}
