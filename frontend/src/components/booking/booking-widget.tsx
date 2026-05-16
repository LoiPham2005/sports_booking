'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Tag, Wallet, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COURTS, type Venue } from '@/lib/mock-data';
import { SlotGrid } from './slot-grid';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';

export function BookingWidget({ venue }: { venue: Venue }) {
  const [courtId, setCourtId] = useState(COURTS[0].id);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<string[]>([]);
  const [voucher, setVoucher] = useState('');

  const court = COURTS.find((c) => c.id === courtId)!;
  const subtotal = slots.length * court.pricePerHour;
  const discount = voucher.trim().toLowerCase() === 'sport20' ? Math.min(subtotal * 0.2, 50_000) : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold">Đặt sân ngay</h3>
        <p className="text-sm text-muted-foreground">
          Giữ chỗ 10 phút để thanh toán
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Chọn sân</label>
        <div className="grid grid-cols-3 gap-2">
          {COURTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourtId(c.id)}
              className={cn(
                'rounded-md border p-2 text-left transition-all',
                courtId === c.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/40',
              )}
            >
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {formatVND(c.pricePerHour)}/h
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> Ngày chơi
        </label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Khung giờ
        </label>
        <SlotGrid selected={slots} onChange={setSlots} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Mã giảm giá
        </label>
        <Input
          placeholder="Nhập mã (vd: SPORT20)"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-muted/40 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tạm tính ({slots.length} giờ × {formatVND(court.pricePerHour)})</span>
          <span className="font-medium">{formatVND(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="mt-1 flex justify-between text-success">
            <span>Giảm giá</span>
            <span className="font-medium">−{formatVND(discount)}</span>
          </div>
        )}
        <div className="mt-3 flex items-end justify-between border-t pt-3">
          <span className="text-sm font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold text-primary">{formatVND(total)}</span>
        </div>
      </div>

      <Button asChild size="lg" className="w-full" disabled={slots.length === 0}>
        <Link href={`/booking/new?venue=${venue.id}&court=${courtId}&date=${date}&slots=${slots.join(',')}`}>
          <Wallet className="h-4 w-4" />
          Tiếp tục thanh toán
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Bằng cách đặt sân, bạn đồng ý với <a className="underline" href="#">Điều khoản</a> và{' '}
        <a className="underline" href="#">Chính sách huỷ</a>.
      </p>
    </div>
  );
}
