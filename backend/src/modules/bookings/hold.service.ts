import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { customAlphabet } from 'nanoid';
import { REDIS_CLIENT } from '../../common/redis/redis.module';

const holdId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);

export interface HoldPayload {
  userId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  subtotal: string;
  total: string;
  discount: string;
  voucherCode?: string;
}

@Injectable()
export class HoldService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private config: ConfigService,
  ) {}

  private key(token: string) {
    return `booking:hold:${token}`;
  }

  private slotKey(courtId: string, slotStart: string) {
    return `booking:slot:${courtId}:${slotStart}`;
  }

  async hold(payload: HoldPayload): Promise<{ token: string; expiresInSec: number }> {
    const ttlMin = this.config.get<number>('booking.holdMinutes', 10);
    const ttl = ttlMin * 60;
    const token = holdId();

    // Đặt giữ chỗ từng slot bằng NX để không 2 user cùng giữ.
    // Slot key đại diện cho start của mỗi slot (theo timeline rời rạc).
    const slotKeys = this.enumerateSlotKeys(payload.courtId, payload.startsAt, payload.endsAt);

    const multi = this.redis.multi();
    for (const k of slotKeys) {
      multi.set(k, token, 'EX', ttl, 'NX');
    }
    const res = await multi.exec();
    const failures = (res ?? []).filter(([_, ok]) => ok !== 'OK');
    if (failures.length > 0) {
      // rollback các slot đã set thành công
      const successKeys = slotKeys.filter((_, i) => (res ?? [])[i]?.[1] === 'OK');
      if (successKeys.length) await this.redis.del(...successKeys);
      throw new Error('SLOT_HELD');
    }

    await this.redis.set(this.key(token), JSON.stringify(payload), 'EX', ttl);
    return { token, expiresInSec: ttl };
  }

  async consume(token: string): Promise<HoldPayload | null> {
    const raw = await this.redis.get(this.key(token));
    if (!raw) return null;
    const payload = JSON.parse(raw) as HoldPayload;
    // Xoá hold + slot keys ngay khi consume.
    const slotKeys = this.enumerateSlotKeys(
      payload.courtId,
      payload.startsAt,
      payload.endsAt,
    );
    await this.redis.del(this.key(token), ...slotKeys);
    return payload;
  }

  async release(token: string): Promise<void> {
    const raw = await this.redis.get(this.key(token));
    if (!raw) return;
    const payload = JSON.parse(raw) as HoldPayload;
    const slotKeys = this.enumerateSlotKeys(
      payload.courtId,
      payload.startsAt,
      payload.endsAt,
    );
    await this.redis.del(this.key(token), ...slotKeys);
  }

  /** Trả về key/30-phút từ startsAt → endsAt (resolution 30 phút đủ với slot 60'). */
  private enumerateSlotKeys(courtId: string, startsAt: string, endsAt: string): string[] {
    const step = 30 * 60_000;
    const keys: string[] = [];
    let cursor = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    while (cursor < end) {
      keys.push(this.slotKey(courtId, new Date(cursor).toISOString()));
      cursor += step;
    }
    return keys;
  }
}
