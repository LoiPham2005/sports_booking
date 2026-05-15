import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) commissionPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(60) bookingHoldMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(60) paymentTimeoutMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() defaultCancelPolicy?: unknown;
  @ApiPropertyOptional() @IsOptional() @IsString() payoutSchedule?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(50) vatPercent?: number;
}

export class SetRoleDto {
  @ApiProperty({ enum: Role }) @IsEnum(Role) role!: Role;
}

export class UpdateFeatureFlagDto {
  @ApiProperty() @IsBoolean() enabled!: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
