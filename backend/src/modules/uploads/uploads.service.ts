import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaOwnerType } from '@prisma/client';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 10 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private cfg: ConfigService, private prisma: PrismaService) {
    this.bucket = cfg.getOrThrow<string>('s3.bucket');
    this.publicUrl = cfg.getOrThrow<string>('s3.publicUrl');
    this.s3 = new S3Client({
      region: cfg.getOrThrow<string>('s3.region'),
      endpoint: cfg.get<string>('s3.endpoint'),
      forcePathStyle: cfg.get<boolean>('s3.forcePathStyle', true),
      credentials: {
        accessKeyId: cfg.getOrThrow<string>('s3.accessKey'),
        secretAccessKey: cfg.getOrThrow<string>('s3.secretKey'),
      },
    });
  }

  async sign(kind: 'avatar' | 'venue' | 'court' | 'review', contentType: string, sizeBytes: number) {
    if (!ALLOWED_MIME.has(contentType)) {
      throw new BadRequestException('Unsupported content type');
    }
    if (sizeBytes <= 0 || sizeBytes > MAX_SIZE) {
      throw new BadRequestException(`Size must be 1..${MAX_SIZE} bytes`);
    }
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const key = `${kind}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 5 * 60 });
    const publicUrl = `${this.publicUrl}/${key}`;
    return { uploadUrl, fileKey: key, publicUrl, expiresIn: 300 };
  }

  async commit(
    userId: string,
    ownerType: MediaOwnerType,
    ownerId: string,
    key: string,
    mimeType: string,
    sizeBytes: number,
  ) {
    const url = `${this.publicUrl}/${key}`;
    return this.prisma.mediaAsset.create({
      data: { ownerType, ownerId, key, url, mimeType, sizeBytes },
    });
  }
}
