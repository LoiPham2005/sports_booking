import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    const n = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!n) return;
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  /**
   * Public method for other modules to enqueue notifications.
   * TODO: push lên BullMQ queue thực sự để fan-out push/email/sms.
   */
  async enqueue(userId: string, type: string, title: string, body?: string, data?: object) {
    await this.prisma.notification.create({
      data: { userId, type, title, body, dataJson: (data ?? {}) as Prisma.InputJsonValue },
    });
  }

  registerDevice(userId: string, platform: 'IOS' | 'ANDROID' | 'WEB', fcmToken: string) {
    return this.prisma.device.upsert({
      where: { userId_fcmToken: { userId, fcmToken } },
      create: { userId, platform, fcmToken },
      update: { lastSeenAt: new Date() },
    });
  }

  unregisterDevice(userId: string, deviceId: string) {
    return this.prisma.device.deleteMany({ where: { userId, id: deviceId } });
  }
}
