import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QuoteBookingDto {
  @ApiProperty() @IsString() courtId!: string;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiProperty() @IsDateString() endsAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() voucherCode?: string;
}

export class CreateBookingDto {
  @ApiProperty() @IsString() holdToken!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class RescheduleBookingDto {
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
}

export class CreateRecurringDto {
  @IsString() courtId!: string;
  @IsString() startTime!: string; // "18:00"
  @IsString() endTime!: string;   // "20:00"
  @IsDateString() fromDate!: string;
  @IsInt() @Min(1) @Max(52) weeks!: number;
  @IsInt({ each: true }) daysOfWeek!: number[]; // [1,3] = Mon, Wed
  @IsOptional() @IsString() voucherCode?: string;
}
