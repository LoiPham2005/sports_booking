import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider as PaymentProviderEnum } from '@prisma/client';
import { Request, Response } from 'express';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';
import { CreatePaymentDto, RefundDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService, private cfg: ConfigService) {}

  @ApiBearerAuth()
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreatePaymentDto, @Req() req: Request) {
    return this.payments.create(user.sub, dto, req.ip);
  }

  @ApiBearerAuth()
  @Get('mine')
  mine(@CurrentUser() user: JwtUser) {
    return this.payments.listMine(user.sub);
  }

  @ApiBearerAuth()
  @Get(':id')
  detail(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.payments.detail(id, user.sub);
  }

  @ApiBearerAuth()
  @Post(':id/refund')
  refund(@Param('id') id: string, @Body() dto: RefundDto, @CurrentUser() user: JwtUser) {
    return this.payments.refund(id, dto, user.sub);
  }

  // ====== WEBHOOKS ======
  @Public()
  @HttpCode(200)
  @Post('webhooks/vnpay')
  vnpayIpn(@Body() body: any, @Req() req: Request) {
    // VNPay gửi cả qua query string (GET) lẫn body — accept both.
    return this.payments.handleCallback(
      PaymentProviderEnum.VNPAY,
      Object.keys(body ?? {}).length ? body : req.query,
      this.headers(req),
    );
  }

  @Public()
  @Get('webhooks/vnpay')
  vnpayIpnGet(@Query() query: any, @Req() req: Request) {
    return this.payments.handleCallback(PaymentProviderEnum.VNPAY, query, this.headers(req));
  }

  @Public()
  @HttpCode(200)
  @Post('webhooks/momo')
  momoIpn(@Body() body: any, @Req() req: Request) {
    return this.payments.handleCallback(PaymentProviderEnum.MOMO, body, this.headers(req));
  }

  @Public()
  @HttpCode(200)
  @Post('webhooks/zalopay')
  @Header('Content-Type', 'application/json')
  zalopayCallback(@Body() body: any, @Req() req: Request) {
    return this.payments.handleCallback(PaymentProviderEnum.ZALOPAY, body, this.headers(req));
  }

  // ====== RETURN URLS (browser redirect) ======
  @Public()
  @Get('return/vnpay')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.payments.handleCallback(PaymentProviderEnum.VNPAY, query, {});
    const web = this.cfg.get<string>('app.webUrl');
    res.redirect(
      `${web}/booking/result?provider=vnpay&orderId=${query.vnp_TxnRef}&code=${query.vnp_ResponseCode}`,
    );
  }

  @Public()
  @Get('return/momo')
  momoReturn(@Query() query: any, @Res() res: Response) {
    const web = this.cfg.get<string>('app.webUrl');
    res.redirect(
      `${web}/booking/result?provider=momo&orderId=${query.orderId}&code=${query.resultCode}`,
    );
  }

  @Public()
  @Get('return/zalopay')
  zalopayReturn(@Query() query: any, @Res() res: Response) {
    const web = this.cfg.get<string>('app.webUrl');
    res.redirect(
      `${web}/booking/result?provider=zalopay&orderId=${query.apptransid}&status=${query.status}`,
    );
  }

  private headers(req: Request): Record<string, string> {
    const h: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') h[k] = v;
    }
    return h;
  }
}
