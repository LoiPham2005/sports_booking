import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async send(target: string, purpose: string): Promise<{ debugCode?: string }> {
    // Rate limit: 60s
    const last = await this.prisma.otpCode.findFirst({
      where: { target, purpose },
      orderBy: { createdAt: 'desc' },
    });
    if (last && Date.now() - last.createdAt.getTime() < 60_000) {
      throw new BadRequestException('OTP recently sent, please wait');
    }

    const code = String(randomInt(100_000, 999_999));
    const codeHash = this.hash(code);
    await this.prisma.otpCode.create({
      data: {
        target,
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });

    // TODO: dispatch SMS/email via queue. Trả về code chỉ ở dev/test.
    return process.env.NODE_ENV === 'production' ? {} : { debugCode: code };
  }

  async verify(target: string, code: string, purpose: string): Promise<void> {
    const hash = this.hash(code);
    const otp = await this.prisma.otpCode.findFirst({
      where: { target, purpose, codeHash: hash, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired code');
    }
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
  }

  private hash(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
}
