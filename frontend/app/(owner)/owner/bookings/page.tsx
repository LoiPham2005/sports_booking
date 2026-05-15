'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatVND } from '@/lib/format';
import { listOwnerBookings, refuseBooking } from '@/lib/data/owner';
import type { UiBooking } from '@/lib/api/adapters/booking';
import { STATUS_LABEL } from '@/lib/api/adapters/status';
import { isApiError } from '@/lib/api/errors';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function OwnerBookingsInner() {
  const searchParams = useSearchParams();
  const venueFilter = searchParams.get('venueId') ?? undefined;

  const [date, setDate] = useState(toISODate(new Date()));
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refusingId, setRefusingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    listOwnerBookings({ date, venueId: venueFilter })
      .then((list) => !cancelled && setBookings(list))
      .catch(() => !cancelled && setBookings([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date, venueFilter]);

  const sorted = useMemo(
    () => [...bookings].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [bookings],
  );

  function shiftDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(toISODate(d));
  }

  async function handleRefuse(id: string) {
    setRefusingId(id);
    try {
      await refuseBooking(id, 'Sân không khả dụng');
      toast.success('Đã từ chối booking');
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Không thể từ chối (>5 phút sau tạo)');
    } finally {
      setRefusingId(null);
    }
  }

  const dateStr = new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch booking</h1>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-40"
          />
          <Button size="sm" variant="outline" onClick={() => setDate(toISODate(new Date()))}>
            Hôm nay
          </Button>
          <Button size="sm" variant="outline" onClick={() => shiftDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-base font-semibold">Không có booking nào hôm nay</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Đổi ngày khác hoặc tạo walk-in cho khách offline
          </p>
          <Button asChild className="mt-4">
            <Link href="/owner/walk-in">Tạo walk-in</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Giờ</th>
                <th className="px-4 py-3 text-left font-medium">Mã</th>
                <th className="px-4 py-3 text-left font-medium">Sân</th>
                <th className="px-4 py-3 text-right font-medium">Tiền</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => {
                const start = new Date(b.startsAt);
                const end = new Date(b.endsAt);
                const label = STATUS_LABEL[b.status];
                const ageMin = (Date.now() - new Date(start.getTime() - 24 * 3600_000).getTime()) / 60_000; // dummy — backend enforces
                const canRefuse =
                  (b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED') && ageMin < 5;
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">
                      {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}–
                      {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">#{b.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.courtName}</p>
                      <p className="text-xs text-muted-foreground">{b.venue.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatVND(b.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={label.tone as never}>{label.text}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/owner/bookings/${b.id}`}>
                          <Phone className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {canRefuse && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleRefuse(b.id)}
                          disabled={refusingId === b.id}
                        >
                          {refusingId === b.id ? '...' : 'Từ chối'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success/15 ring-1 ring-success/50" /> Đã xác nhận
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning/15 ring-1 ring-warning/40" /> Chờ thanh toán
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-destructive/15 ring-1 ring-destructive/40" /> Đã huỷ
        </span>
      </div>
    </div>
  );
}

export default function OwnerBookingsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted/30" />}>
      <OwnerBookingsInner />
    </Suspense>
  );
}
