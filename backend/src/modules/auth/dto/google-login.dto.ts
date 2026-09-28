import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    description: 'Google ID Token (JWT do Google cấp sau khi đăng nhập qua One Tap hoặc Google SDK)',
  })
  @IsString({ message: 'Token Google không hợp lệ' })
  @IsNotEmpty({ message: 'Token Google không được để trống' })
  credential!: string;

  @ApiPropertyOptional({
    example: 750,
    description: 'Điểm mục tiêu (tuỳ chọn)',
  })
  @IsOptional()
  @IsString()
  targetScore?: number;
}
