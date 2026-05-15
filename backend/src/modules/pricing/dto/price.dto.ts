import { IsInt, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreatePriceRuleDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @Matches(TIME) startTime!: string;
  @Matches(TIME) endTime!: string;
  @IsNumber() pricePerSlot!: number;
}

export class CreatePriceOverrideDto {
  @IsString() date!: string; // YYYY-MM-DD
  @Matches(TIME) startTime!: string;
  @Matches(TIME) endTime!: string;
  @IsNumber() price!: number;
  @IsOptional() @IsString() reason?: string;
}
