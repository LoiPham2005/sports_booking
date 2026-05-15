'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { getStaffSchedule } from '@/lib/data/staff';
import { useStaffRole, withRole } from '@/lib/use-staff-role';
import { STATUS_LABEL } from '@/lib/api/adapters/status';
import type { UiBooking } from '@/lib/api/adapters/booking';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function StaffSchedulePage() {
  const role = useStaffRole();
  const [date, setDate] = useState(toISODate(new Date()));
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    getStaffSchedule({ date, days: 1 })
      .then((list) => !cancelled && setBookings(list))
      .catch(() => !cancelled && setBookings([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  function shiftDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(toISODate(d));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sân</h1>
          <p className="text-sm text-muted-foreground">Xem booking theo ngày</p>
        </div>

        <div className="flex items-center gap-1 rounded-md border bg-card p-1">
          <Button size="sm" variant="ghost" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44 border-0"
          />
          <Button size="sm" variant="ghost" onClick={() => shiftDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Không có booking nào trong ngày này
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Giờ</th>
                <th className="px-4 py-3 text-left font-medium">Sân</th>
                <th className="px-4 py-3 text-left font-medium">Mã</th>
                <th className="px-4 py-3 text-right font-medium">Tiền</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const start = new Date(b.startsAt);
                const end = new Date(b.endsAt);
                const status = STATUS_LABEL[b.status];
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">
                      {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}–
                      {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">{b.courtName}</td>
                    <td className="px-4 py-3 font-mono text-xs">#{b.code}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatVND(b.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={status.tone as never}>{status.text}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={withRole(`/staff/bookings/${b.id}`, role)}>Chi tiết</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
