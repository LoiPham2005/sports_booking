import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MediaOwnerType } from '@prisma/client';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { UploadsService } from './uploads.service';

class SignDto {
  @IsEnum(['avatar', 'venue', 'court', 'review'] as const)
  kind!: 'avatar' | 'venue' | 'court' | 'review';
  @IsString() contentType!: string;
  @IsInt() sizeBytes!: number;
}

class CommitDto {
  @IsEnum(MediaOwnerType) ownerType!: MediaOwnerType;
  @IsString() ownerId!: string;
  @IsString() key!: string;
  @IsString() mimeType!: string;
  @IsInt() sizeBytes!: number;
}

@ApiBearerAuth()
@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post('sign')
  sign(@Body() dto: SignDto) {
    return this.uploads.sign(dto.kind, dto.contentType, dto.sizeBytes);
  }

  @Post('commit')
  commit(@CurrentUser() user: JwtUser, @Body() dto: CommitDto) {
    return this.uploads.commit(user.sub, dto.ownerType, dto.ownerId, dto.key, dto.mimeType, dto.sizeBytes);
  }
}
