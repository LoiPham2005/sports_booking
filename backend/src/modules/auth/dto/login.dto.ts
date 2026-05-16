import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email hoặc số điện thoại' })
  @IsString()
  identifier!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @ApiPropertyOptional({ description: 'Optional — nếu không truyền sẽ đọc từ cookie sb_refresh' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  identifier!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class SendOtpDto {
  @ApiProperty({ description: 'Email hoặc phone' })
  @IsString()
  target!: string;

  @ApiProperty({ enum: ['VERIFY_PHONE', 'VERIFY_EMAIL', 'RESET_PASSWORD'] })
  @IsString()
  purpose!: 'VERIFY_PHONE' | 'VERIFY_EMAIL' | 'RESET_PASSWORD';
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  target!: string;

  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  purpose!: string;
}
