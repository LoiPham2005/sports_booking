import { ApiPropertyOptional } from '@nestjs/swagger';
import { VenueStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchVenuesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() district?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sportSlug?: string;
  @ApiPropertyOptional() @IsOptional() @IsLatitude() @Type(() => Number) lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsLongitude() @Type(() => Number) lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) @Max(50) radiusKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cursor?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @Min(1) @Max(50) limit?: number = 20;
  @ApiPropertyOptional({ enum: ['rating', 'newest'] })
  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'newest';
}

export class CreateVenueDto {
  @IsString() name!: string;
  @IsString() addressLine!: string;
  // Legacy format (user nhập gốc — có thể là cũ hoặc mới)
  @IsString() city!: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() district?: string;
  // New format (sau cải cách 7/2025 — luôn populate)
  @IsOptional() @IsString() newCity?: string;
  @IsOptional() @IsString() newWard?: string;
  @IsOptional() @IsString() provinceCode?: string;
  @IsOptional() @IsString() wardCode?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsLatitude() lat?: number;
  @IsOptional() @IsLongitude() lng?: number;
}

export class UpdateVenueDto extends CreateVenueDto {
  @IsOptional() @IsEnum(VenueStatus) status?: VenueStatus;
}
