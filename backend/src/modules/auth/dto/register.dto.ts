import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  fullName!: string;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm mục tiêu phải là số' })
  @Min(10, { message: 'Điểm mục tiêu tối thiểu là 10' })
  @Max(990, { message: 'Điểm mục tiêu tối đa là 990' })
  targetScore?: number;
}
