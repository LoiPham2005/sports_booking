import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import {
  ChangePasswordDto,
  LoginDto,
  ResetPasswordDto,
} from './dto/login.dto';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'phone' | 'fullName' | 'role' | 'avatarUrl'>;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : undefined,
          dto.phone ? { phone: dto.phone } : undefined,
        ].filter(Boolean) as object[],
      },
    });
    if (existing) throw new ConflictException('Email/phone already in use');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        locale: dto.locale ?? 'vi',
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto, ctx: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { phone: dto.identifier }] },
    });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user, ctx);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const hash = this.hashToken(refreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(record.user, {
      ip: record.ip ?? undefined,
      userAgent: record.userAgent ?? undefined,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken);
    await this.prisma.refreshToken
      .update({ where: { tokenHash: hash }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash) throw new BadRequestException('Password not set');
    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(dto.newPassword) },
    });
    await this.logoutAll(userId);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const hash = this.hashToken(dto.token);
    const otp = await this.prisma.otpCode.findFirst({
      where: { codeHash: hash, purpose: 'RESET_PASSWORD', consumedAt: null },
    });
    if (!otp || otp.expiresAt < new Date()) throw new BadRequestException('Invalid or expired token');

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: otp.target }, { phone: otp.target }] },
    });
    if (!user) throw new BadRequestException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await argon2.hash(dto.newPassword) },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async findOrCreateFromGoogle(profile: {
    email: string;
    fullName: string;
    avatarUrl?: string;
  }): Promise<AuthResult> {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
        },
      });
    }
    return this.issueTokens(user);
  }

  validateForLocal(identifier: string, password: string): Promise<User | null> {
    return this.prisma.user
      .findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } })
      .then(async (user) => {
        if (!user?.passwordHash) return null;
        const ok = await argon2.verify(user.passwordHash, password);
        return ok ? user : null;
      });
  }

  // ----------------- private -----------------
  private async issueTokens(
    user: User,
    ctx: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthResult> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role as Role },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessTtl'),
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshTtl = this.config.get<string>('jwt.refreshTtl') ?? '30d';
    const expiresAt = new Date(Date.now() + this.parseDurationMs(refreshTtl));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDurationMs(d: string): number {
    const m = d.match(/^(\d+)([smhd])$/);
    if (!m) return 30 * 24 * 60 * 60 * 1000;
    const n = parseInt(m[1], 10);
    const u = m[2];
    const mult = u === 's' ? 1000 : u === 'm' ? 60_000 : u === 'h' ? 3_600_000 : 86_400_000;
    return n * mult;
  }
}
