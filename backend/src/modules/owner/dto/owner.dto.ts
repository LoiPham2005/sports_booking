import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, VenueMemberRole, VenueMemberStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateWalkInDto {
  @ApiProperty() @IsString() courtId!: string;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiProperty() @IsDateString() endsAt!: string;
  @ApiProperty() @IsNumber() @Min(0) total!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() customerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerPhone?: string;
}

export class RefuseBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class InviteStaffDto {
  @ApiProperty() @IsString() venueId!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiPropertyOptional({ enum: VenueMemberRole })
  @IsOptional()
  @IsEnum(VenueMemberRole)
  role?: VenueMemberRole;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ enum: VenueMemberRole })
  @IsOptional()
  @IsEnum(VenueMemberRole)
  role?: VenueMemberRole;

  @ApiPropertyOptional({ enum: VenueMemberStatus })
  @IsOptional()
  @IsEnum(VenueMemberStatus)
  inviteStatus?: VenueMemberStatus;
}

export class ListBookingsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() venueId?: string;
}

export class UpsertBankAccountDto {
  @ApiProperty() @IsString() @Length(2, 20) bankCode!: string;
  @ApiProperty() @IsString() @Matches(/^[0-9]{6,20}$/, { message: 'Số tài khoản gồm 6-20 chữ số' })
  accountNumber!: string;
  @ApiProperty() @IsString() @Length(2, 100) accountHolder!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class ReportsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
  @ApiPropertyOptional({ enum: ['day', 'week', 'month'] })
  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month';
}
