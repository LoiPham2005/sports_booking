import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  Payment,
  PaymentProvider as PaymentProviderEnum,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProviderFactory } from './providers/provider.factory';
import { CreatePaymentDto, RefundDto } from './dto/payment.dto';
import { VerifyCallbackResult } from './interfaces/payment-provider.interface';

const orderIdGen = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 16);

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private factory: PaymentProviderFactory,
    private cfg: ConfigService,
  ) {}

  /**
   * Tạo Payment cho 1 booking. Một booking có thể có nhiều Payment (vd retry),
   * nhưng chỉ 1 Payment SUCCESS được tính.
   */
  async create(userId: string, dto: CreatePaymentDto, ip?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { venue: true, court: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    // Nếu đã có payment SUCCESS hoặc PENDING gần đây → từ chối / trả lại link cũ
    const existing = await this.prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        status: { in: [PaymentStatus.SUCCESS, PaymentStatus.PENDING] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing?.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Booking already paid');
    }
    if (existing?.status === PaymentStatus.PENDING && existing.redirectUrl) {
      return existing;
    }

    const providerOrderId = orderIdGen();
    const provider = this.factory.get(dto.provider);

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        provider: dto.provider,
        amount: booking.total,
        currency: 'VND',
        status: PaymentStatus.PENDING,
        providerOrderId,
        metadata: {},
      },
    });

    try {
      const result = await provider.createPayment({
        paymentId: payment.id,
        providerOrderId,
        amount: Number(booking.total),
        currency: 'VND',
        description: `Booking ${booking.code} — ${booking.venue.name}`,
        ip,
        returnUrl: dto.returnUrl,
      });

      return this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          redirectUrl: result.redirectUrl,
          qrData: result.qrData,
          providerRef: result.providerRef,
          metadata: { ...(payment.metadata as object), createRaw: result.raw ?? null } as Prisma.InputJsonValue,
        },
      });
    } catch (e) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failedReason: (e as Error).message },
      });
      throw e;
    }
  }

  async handleCallback(
    providerKey: PaymentProviderEnum,
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<unknown> {
    const provider = this.factory.get(providerKey);
    const verified: VerifyCallbackResult = await provider.verifyCallback(payload, headers);

    // Lưu event để đối soát + idempotent
    try {
      await this.prisma.paymentEvent.create({
        data: {
          provider: providerKey,
          eventType: 'CALLBACK',
          externalEventId: verified.externalEventId,
          rawPayload: payload as Prisma.InputJsonValue,
          signatureValid: verified.signatureValid,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        // Trùng event → đã xử lý
        this.logger.log(`Duplicate callback ${verified.externalEventId} — skip`);
        return verified.ack;
      }
      throw e;
    }

    if (!verified.signatureValid) {
      this.logger.warn(`Invalid signature for ${providerKey} order ${verified.providerOrderId}`);
      return verified.ack;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerOrderId: verified.providerOrderId },
      include: { booking: true },
    });
    if (!payment) {
      this.logger.warn(`Payment not found for providerOrderId ${verified.providerOrderId}`);
      return verified.ack;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      // Đã xử lý từ webhook trước hoặc reconcile job
      return verified.ack;
    }

    if (verified.status === PaymentStatus.SUCCESS) {
      await this.markSuccess(payment, verified);
    } else if (verified.status === PaymentStatus.FAILED || verified.status === PaymentStatus.CANCELLED) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verified.status,
          providerRef: verified.providerRef ?? payment.providerRef,
          failedReason: 'Provider reported failure',
        },
      });
    }

    // Link event với payment
    await this.prisma.paymentEvent.updateMany({
      where: { provider: providerKey, externalEventId: verified.externalEventId },
      data: { paymentId: payment.id, processedAt: new Date() },
    });

    return verified.ack;
  }

  async detail(id: string, userId: string) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!p) throw new NotFoundException();
    if (p.userId !== userId) throw new ForbiddenException();
    return p;
  }

  async listMine(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { booking: { include: { venue: { select: { name: true } } } } },
    });
  }

  async refund(paymentId: string, dto: RefundDto, actorId: string) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: { booking: { include: { venue: true } } },
    });
    if (!payment.booking) throw new BadRequestException('Payment not tied to a booking');

    // Chỉ owner của venue hoặc admin được refund. Customer huỷ qua /bookings/:id/cancel.
    if (payment.booking.venue.ownerId !== actorId) {
      throw new ForbiddenException();
    }
    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only SUCCESS payments can be refunded');
    }

    const amount = dto.amount ?? Number(payment.amount);
    const provider = this.factory.get(payment.provider);

    const refund = await this.prisma.refund.create({
      data: {
        paymentId,
        amount,
        reason: dto.reason,
        requestedById: actorId,
      },
    });

    try {
      const res = await provider.refund({
        paymentId,
        amount,
        reason: dto.reason,
        providerRef: payment.providerRef ?? undefined,
      });
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: res.status, providerRefundRef: res.providerRefundRef },
      });
      if (res.status === 'SUCCESS') {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status:
              amount >= Number(payment.amount)
                ? PaymentStatus.REFUNDED
                : PaymentStatus.PARTIALLY_REFUNDED,
          },
        });
      }
      return { refund: { ...refund, status: res.status } };
    } catch (e) {
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: 'FAILED' },
      });
      throw e;
    }
  }

  /**
   * Cron job: query lại payment PENDING quá 10 phút để bù trường hợp mất webhook.
   */
  async reconcilePending(): Promise<number> {
    const cutoff = new Date(Date.now() - 10 * 60_000);
    const pending = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.PENDING, createdAt: { lt: cutoff } },
      take: 50,
    });
    let updated = 0;
    for (const p of pending) {
      try {
        const provider = this.factory.get(p.provider);
        const queryId =
          p.provider === 'ZALOPAY' ? (p.metadata as any)?.createRaw?.app_trans_id ?? p.providerOrderId : p.providerOrderId;
        const r = await provider.queryStatus(queryId);
        if (r.status === PaymentStatus.SUCCESS) {
          await this.markSuccess(p, {
            externalEventId: `reconcile:${p.id}:${Date.now()}`,
            providerOrderId: p.providerOrderId,
            providerRef: r.providerRef,
            amount: Number(p.amount),
            signatureValid: true,
            status: PaymentStatus.SUCCESS,
            rawPayload: r.raw,
          });
          updated += 1;
        } else if (r.status === PaymentStatus.FAILED) {
          await this.prisma.payment.update({
            where: { id: p.id },
            data: { status: PaymentStatus.FAILED, failedReason: 'reconcile failed' },
          });
        }
      } catch (e) {
        this.logger.warn(`reconcile failed for ${p.id}: ${(e as Error).message}`);
      }
    }
    return updated;
  }

  // ============ private ============
  private async markSuccess(payment: Payment, v: VerifyCallbackResult): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: v.providerRef ?? payment.providerRef,
        },
      });

      if (payment.bookingId) {
        const booking = await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.CONFIRMED },
          include: { venue: { select: { ownerId: true } } },
        });

        // Tạo OwnerEarning (tách commission)
        const commissionPct = this.cfg.get<number>('commission.percent', 10);
        const gross = new Prisma.Decimal(payment.amount);
        const commission = gross.mul(commissionPct).div(100);
        const net = gross.minus(commission);
        await tx.ownerEarning.create({
          data: {
            ownerId: booking.venue.ownerId,
            bookingId: booking.id,
            paymentId: payment.id,
            gross,
            commission,
            netAmount: net,
          },
        });

        // Voucher redemption nếu có discount
        if (Number(booking.discount) > 0 && booking.voucherId) {
          await tx.voucherRedemption.create({
            data: {
              voucherId: booking.voucherId,
              userId: booking.userId,
              bookingId: booking.id,
              amount: booking.discount,
            },
          });
        }
      }
    });
  }
}
