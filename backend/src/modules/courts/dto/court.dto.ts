import { ApiPropertyOptional } from '@nestjs/swagger';
import { Surface } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCourtDto {
  @IsString() name!: string;
  @IsString() sportId!: string;
  @IsEnum(Surface) surface!: Surface;
  @IsOptional() @IsBoolean() indoor?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(100) capacity?: number;
  @IsOptional() @IsInt() @Min(15) @Max(240) slotDurationMinutes?: number;
}

export class UpdateCourtDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(Surface) surface?: Surface;
  @IsOptional() @IsBoolean() indoor?: boolean;
  @IsOptional() @IsInt() capacity?: number;
  @IsOptional() @IsInt() slotDurationMinutes?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateClosureDto {
  @ApiPropertyOptional() @IsString() startsAt!: string;
  @ApiPropertyOptional() @IsString() endsAt!: string;
  @IsOptional() @IsString() reason?: string;
}
