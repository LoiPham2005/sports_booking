import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyOtpDto,
} from './dto/login.dto';
import { OtpService } from './otp.service';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private otp: OtpService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @HttpCode(204)
  @Post('logout-all')
  async logoutAll(@CurrentUser() user: JwtUser) {
    await this.auth.logoutAll(user.sub);
  }

  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(user.sub, dto);
    return { ok: true };
  }

  @Public()
  @Post('forgot-password')
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.otp.send(dto.identifier, 'RESET_PASSWORD');
  }

  @Public()
  @Post('reset-password')
  async reset(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto);
    return { ok: true };
  }

  @Public()
  @Post('otp/send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.otp.send(dto.target, dto.purpose);
  }

  @Public()
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    await this.otp.verify(dto.target, dto.code, dto.purpose);
    return { ok: true };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    return this.auth.findOrCreateFromGoogle(req.user as { email: string; fullName: string; avatarUrl?: string });
  }
}
