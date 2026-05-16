import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaOwnerType } from '@prisma/client';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
]);
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB cho cả video

/**
 * Upload media qua Supabase Storage.
 *
 * - Frontend upload **trực tiếp** lên Supabase qua signed URL → backend không bottleneck
 *   với file lớn (đỡ memory + bandwidth).
 * - Sau khi upload xong, FE gọi `commit` để backend ghi `MediaAsset` row.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private supabase: SupabaseClient;
  private bucket: string;
  private supabaseUrl: string;
  private bucketEnsured = false;

  constructor(
    private cfg: ConfigService,
    private prisma: PrismaService,
  ) {
    this.supabaseUrl = cfg.get<string>('supabase.url', '');
    const key = cfg.get<string>('supabase.key', '');
    this.bucket = cfg.get<string>('supabase.bucket', 'sports_booking');
    if (!this.supabaseUrl || !key) {
      this.logger.warn('Supabase URL/KEY chưa cấu hình — upload sẽ fail');
    }
    this.supabase = createClient(this.supabaseUrl, key, {
      auth: { persistSession: false },
    });
  }

  /**
   * Auto-create bucket nếu chưa tồn tại. Chỉ work với service_role key
   * (anon không có quyền tạo bucket).
   * Cache vào `bucketEnsured` để chỉ gọi 1 lần / lifetime của process.
   */
  private async ensureBucket() {
    if (this.bucketEnsured) return;
    const { data, error } = await this.supabase.storage.getBucket(this.bucket);
    if (data) {
      this.bucketEnsured = true;
      return;
    }
    // Lỗi khác "not found" (vd 401 — sai key) → log nhưng vẫn cố create
    if (error && !/not found|does not exist/i.test(error.message)) {
      this.logger.warn(`getBucket trả lỗi: ${error.message}`);
    }
    const createRes = await this.supabase.storage.createBucket(this.bucket, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
    });
    if (createRes.error) {
      // Có thể đã tồn tại race-condition — không throw
      if (/already exists/i.test(createRes.error.message)) {
        this.bucketEnsured = true;
        return;
      }
      this.logger.error(`Tạo bucket "${this.bucket}" thất bại: ${createRes.error.message}`);
      throw new BadRequestException(
        `Không tự tạo được bucket "${this.bucket}". Có thể key không phải service_role. Lỗi: ${createRes.error.message}`,
      );
    }
    this.logger.log(`Đã tự tạo bucket "${this.bucket}" (public)`);
    this.bucketEnsured = true;
  }

  /**
   * Tạo signed upload URL — FE POST file thẳng lên Supabase qua URL này (5 phút).
   * Storage public bucket → URL public, không cần signed read.
   */
  async sign(
    kind: 'avatar' | 'venue' | 'court' | 'review',
    contentType: string,
    sizeBytes: number,
  ) {
    if (!ALLOWED_MIME.has(contentType)) {
      throw new BadRequestException(`Unsupported content type: ${contentType}`);
    }
    if (sizeBytes <= 0 || sizeBytes > MAX_SIZE) {
      throw new BadRequestException(`File size must be 1..${MAX_SIZE} bytes`);
    }
    await this.ensureBucket();
    const ext = guessExt(contentType);
    const fileKey = `${kind}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(fileKey);

    if (error || !data) {
      this.logger.error(`Supabase createSignedUploadUrl failed: ${error?.message}`);
      throw new BadRequestException(`Không tạo được upload URL: ${error?.message ?? 'unknown'}`);
    }

    const publicUrl = this.publicUrl(fileKey);

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      fileKey,
      publicUrl,
      expiresIn: 300,
    };
  }

  /**
   * Ghi MediaAsset row sau khi FE upload xong. Trả về asset đã commit.
   */
  async commit(
    _userId: string,
    ownerType: MediaOwnerType,
    ownerId: string,
    key: string,
    mimeType: string,
    sizeBytes: number,
  ) {
    const url = this.publicUrl(key);
    return this.prisma.mediaAsset.create({
      data: { ownerType, ownerId, key, url, mimeType, sizeBytes },
    });
  }

  /**
   * Xoá object trên Supabase + xoá row MediaAsset.
   */
  async remove(key: string) {
    const { error } = await this.supabase.storage.from(this.bucket).remove([key]);
    if (error) this.logger.warn(`Supabase remove failed: ${error.message}`);
    await this.prisma.mediaAsset.deleteMany({ where: { key } });
  }

  private publicUrl(key: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`;
  }
}

function guessExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'video/mp4':
      return 'mp4';
    case 'video/quicktime':
      return 'mov';
    default:
      return 'bin';
  }
}
