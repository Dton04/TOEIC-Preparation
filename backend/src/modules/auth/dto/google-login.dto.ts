import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString({ message: 'Token Google không hợp lệ' })
  @IsNotEmpty({ message: 'Token Google không được để trống' })
  credential!: string;

  @IsOptional()
  @IsString()
  targetScore?: number;
}
