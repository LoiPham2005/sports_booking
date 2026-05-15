'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Clock, CheckCircle, Activity, Wallet, TrendingUp, Tag } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { useStaffRole, withRole } from '@/lib/use-staff-role';

const TODAY_BOOKINGS = [
  {
    id: 't1',
    code: '20260547',
    customer: 'Trần Minh',
    phone: '+84 901 234 567',
    court: 'Sân 1',
    startsAt: '07:00',
    endsAt: '08:00',
    total: 350_000,
    status: 'COMPLETED' as const,
  },
  {
    id: 't2',
    code: '20260548',
    customer: 'Saigon FC',
    phone: '+84 909 111 222',
    court: 'Sân 1',
    startsAt: '08:00',
    endsAt: '10:00',
    total: 700_000,
    status: 'COMPLETED' as const,
  },
  {
    id: 't3',
    code: '20260549',
    customer: 'Lê Hà',
    phone: '+84 905 555 333',
    court: 'Sân VIP',
    startsAt: '16:00',
    endsAt: '18:00',
    total: 1_000_000,
    status: 'CONFIRMED' as const,
  },
  {
    id: 't4',
    code: '20260550',
    customer: 'Đức Phạm',
    phone: '+84 909 777 888',
    court: 'Sân 2',
    startsAt: '18:00',
    endsAt: '20:00',
    total: 700_000,
    status: 'CONFIRMED' as const,
  },
  {
    id: 't5',
    code: '20260551',
    customer: 'Nguyễn An',
    phone: '+84 902 333 444',
    court: 'Sân VIP',
    startsAt: '19:00',
    endsAt: '21:00',
    total: 1_000_000,
    status: 'PENDING_PAYMENT' as const,
  },
];

export default function StaffTodayPage() {
  const role = useStaffRole();
  const isManager = role === 'manager';

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

      {/* Manager-only: revenue card */}
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
              <p className="mt-1 text-3xl font-bold">{formatVND(2_400_000)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" /> +12% so với hôm qua
              </p>
            </div>
            <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Link href={withRole('/staff/revenue', role)}>Chi tiết</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Big QR scan CTA */}
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

      {/* Stats */}
      <div className={`grid gap-4 ${isManager ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <StatCard icon={Activity} label="Đang chơi" value="0" tone="primary" />
        <StatCard icon={Clock} label="Sắp đến" value="3" tone="accent" />
        <StatCard icon={CheckCircle} label="Đã xong" value="2" tone="success" />
        {isManager && (
          <StatCard icon={Tag} label="Lấp đầy" value="78%" tone="primary" />
        )}
      </div>

      {/* Manager quick actions */}
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
          <Button variant="outline" size="lg" className="justify-start">
            <CheckCircle className="h-4 w-4" /> Đóng cửa khẩn cấp
          </Button>
        </div>
      )}

      {/* Bookings list */}
      <div>
        <h2 className="mb-3 font-bold">Booking ({TODAY_BOOKINGS.length})</h2>
        <div className="space-y-3">
          {TODAY_BOOKINGS.map((b) => (
            <BookingRow key={b.id} booking={b} role={role} />
          ))}
        </div>
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
}: {
  booking: (typeof TODAY_BOOKINGS)[number];
  role: 'manager' | 'staff';
}) {
  const statusBadge = {
    COMPLETED: { variant: 'muted' as const, label: 'Hoàn thành' },
    CONFIRMED: { variant: 'success' as const, label: 'Sẵn sàng' },
    PENDING_PAYMENT: { variant: 'warning' as const, label: 'Chờ TT' },
  }[booking.status];

  return (
    <Link href={withRole(`/staff/bookings/${booking.id}`, role)}>
      <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
        {/* Time block */}
        <div className="grid w-16 shrink-0 place-items-center rounded-lg bg-muted py-2 text-center">
          <p className="font-mono text-sm font-bold">{booking.startsAt}</p>
          <p className="text-xs text-muted-foreground">{booking.endsAt}</p>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-muted-foreground">#{booking.code}</p>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="mt-0.5 font-semibold">{booking.customer}</p>
          <p className="text-xs text-muted-foreground">
            {booking.court} · {booking.phone}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-primary">{formatVND(booking.total)}</p>
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            {role === 'manager' && booking.status === 'CONFIRMED' && (
              <Button size="sm" variant="outline" className="h-8">
                Huỷ
              </Button>
            )}
            {booking.status === 'CONFIRMED' && (
              <Button size="sm" className="h-8">
                <QrCode className="h-3.5 w-3.5" /> Check-in
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
