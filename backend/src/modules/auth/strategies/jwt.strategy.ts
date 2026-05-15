import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email?: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get<string>('jwt.accessSecret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException();
    return { sub: user.id, email: user.email, role: user.role };
  }
}
