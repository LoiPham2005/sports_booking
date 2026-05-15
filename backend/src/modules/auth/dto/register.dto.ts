import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+84912345678' })
  @ValidateIf((o) => !o.email)
  @Matches(/^\+?\d{9,15}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty({ minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;
}
