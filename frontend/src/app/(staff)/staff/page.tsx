'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Clock, CheckCircle, Activity, Wallet, TrendingUp, Tag } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { useStaffRole, withRole } from '@/lib/use-staff-role';
import { getStaffToday, checkInBooking, getRevenue } from '@/lib/data/staff';
import { isApiError } from '@/lib/api/errors';
import type { UiBooking } from '@/lib/api/adapters/booking';
import { STATUS_LABEL } from '@/lib/api/adapters/status';

export default function StaffTodayPage() {
  const role = useStaffRole();
  const isManager = role === 'manager';

  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStaffToday()
      .then((list) => !cancelled && setBookings(list))
      .catch(() => !cancelled && setBookings([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isManager) return;
    getRevenue()
      .then((r) => setRevenue(r.revenue))
      .catch(() => {});
  }, [isManager]);

  async function handleCheckIn(b: UiBooking) {
    const token = b.checkInToken ?? b.code;
    setCheckingId(b.id);
    try {
      await checkInBooking(token);
      toast.success(`Đã check-in ${b.code}`);
      setBookings((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, status: 'CHECKED_IN' } : x)),
      );
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Check-in thất bại');
    } finally {
      setCheckingId(null);
    }
  }

  const stats = {
    playing: bookings.filter((b) => b.status === 'CHECKED_IN').length,
    upcoming: bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT')
      .length,
    done: bookings.filter((b) => b.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Lịch hôm nay</h1>
      </div>

      {isManager && (
        <Card className="overflow-hidden bg-gradient-to-r from-violet-500 to-violet-700 p-6 text-white">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/20">
              <Wallet className="h-9 w-9" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide opacity-80">
                Doanh thu hôm nay tại venue
              </p>
              <p className="mt-1 text-3xl font-bold">{formatVND(revenue)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" /> {bookings.length} booking
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href={withRole('/staff/revenue', role)}>Chi tiết</Link>
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary via-emerald-600 to-emerald-700 p-6 text-primary-foreground">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/20">
            <QrCode className="h-9 w-9" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Quét mã QR check-in</h3>
            <p className="text-sm text-emerald-50">Đưa mã của khách vào camera để check-in nhanh</p>
          </div>
          <Button asChild size="lg" variant="accent">
            <Link href="#scanner">Mở camera</Link>
          </Button>
        </div>
      </Card>

      <div className={`grid gap-4 ${isManager ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <StatCard icon={Activity} label="Đang chơi" value={`${stats.playing}`} tone="primary" />
        <StatCard icon={Clock} label="Sắp đến" value={`${stats.upcoming}`} tone="accent" />
        <StatCard icon={CheckCircle} label="Đã xong" value={`${stats.done}`} tone="success" />
        {isManager && (
          <StatCard icon={Tag} label="Booking" value={`${bookings.length}`} tone="primary" />
        )}
      </div>

      {isManager && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" size="lg" className="justify-start">
            <Link href={withRole('/staff/pricing', role)}>
              <Tag className="h-4 w-4" /> Sửa giá tạm thời
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="justify-start">
            <Link href={withRole('/staff/team', role)}>
              <Activity className="h-4 w-4" /> Quản lý nhân viên
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-start" disabled>
            <CheckCircle className="h-4 w-4" /> Đóng cửa khẩn cấp
          </Button>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-bold">Booking ({bookings.length})</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/30" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-base font-semibold">Không có booking nào hôm nay</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                role={role}
                onCheckIn={() => handleCheckIn(b)}
                checking={checkingId === b.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'primary' | 'accent' | 'success';
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  }[tone];
  return (
    <Card className="p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${colors}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </Card>
  );
}

function BookingRow({
  booking,
  role,
  onCheckIn,
  checking,
}: {
  booking: UiBooking;
  role: 'manager' | 'staff';
  onCheckIn: () => void;
  checking: boolean;
}) {
  const status = STATUS_LABEL[booking.status];
  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);

  return (
    <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
      <Link
        href={withRole(`/staff/bookings/${booking.id}`, role)}
        className="grid w-16 shrink-0 place-items-center rounded-lg bg-muted py-2 text-center"
      >
        <p className="font-mono text-sm font-bold">
          {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs text-muted-foreground">
          {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </Link>

      <Link href={withRole(`/staff/bookings/${booking.id}`, role)} className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-muted-foreground">#{booking.code}</p>
          <Badge variant={status.tone as never}>{status.text}</Badge>
        </div>
        <p className="mt-0.5 font-semibold">{booking.venue.name}</p>
        <p className="text-xs text-muted-foreground">{booking.courtName}</p>
      </Link>

      <div className="text-right">
        <p className="text-sm font-bold text-primary">{formatVND(booking.total)}</p>
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          {booking.status === 'CONFIRMED' && (
            <Button size="sm" className="h-8" onClick={onCheckIn} disabled={checking}>
              <QrCode className="h-3.5 w-3.5" />
              {checking ? '...' : 'Check-in'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
