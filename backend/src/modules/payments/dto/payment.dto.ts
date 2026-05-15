import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty() @IsString() bookingId!: string;
  @ApiProperty({ enum: PaymentProvider }) @IsEnum(PaymentProvider) provider!: PaymentProvider;
  @ApiPropertyOptional() @IsOptional() @IsString() returnUrl?: string;
}

export class RefundDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
