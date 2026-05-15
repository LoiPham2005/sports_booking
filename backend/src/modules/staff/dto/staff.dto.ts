import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CheckInDto {
  @ApiProperty() @IsString() token!: string;
}

export class ScheduleQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(31) days?: number;
}

export class RevenueQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venueId?: string;
}

export class CreateOverrideDto {
  @ApiProperty() @IsString() courtId!: string;
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty() @Matches(TIME) startTime!: string;
  @ApiProperty() @Matches(TIME) endTime!: string;
  @ApiProperty() @IsNumber() @Min(0) price!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
