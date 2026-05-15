'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrendingUp, CalendarCheck, Wallet, Activity, ArrowUpRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatVND, formatNumber } from '@/lib/format';
import { getOwnerDashboard } from '@/lib/data/owner';
import type { OwnerDashboard as OwnerDashboardData } from '@/lib/api/endpoints/owner';

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getOwnerDashboard()
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    );
  }

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">{dateStr} — Chào mừng trở lại 👋</p>
        </div>
        <Button asChild>
          <Link href="/owner/walk-in">
            <Plus className="h-4 w-4" /> Tạo booking thủ công
          </Link>
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Wallet className="h-5 w-5" />}
          label="Doanh thu hôm nay"
          value={formatVND(data.revenueToday)}
          trend={`${data.bookingsToday} booking`}
          tone="primary"
        />
        <KpiCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Booking hôm nay"
          value={formatNumber(data.bookingsToday)}
          trend={`${data.venueCount} venue`}
          tone="success"
        />
        <KpiCard
          icon={<Activity className="h-5 w-5" />}
          label="Tỉ lệ lấp đầy"
          value={`${data.occupancyToday}%`}
          trend={data.occupancyToday >= 70 ? 'Tốt' : 'Cần cải thiện'}
          tone="accent"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Doanh thu tháng"
          value={formatVND(data.revenueMonth)}
          trend={`${data.revenueMonthDelta >= 0 ? '+' : ''}${data.revenueMonthDelta}% so với tháng trước`}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-bold">Doanh thu 7 ngày gần nhất</h3>
              <p className="text-xs text-muted-foreground">
                Tổng: {formatVND(data.revenueLast7Days.reduce((s, v) => s + v, 0))}
              </p>
            </div>
            <Badge variant={data.revenueMonthDelta >= 0 ? 'success' : 'destructive'}>
              {data.revenueMonthDelta >= 0 ? '+' : ''}
              {data.revenueMonthDelta}%
            </Badge>
          </div>
          <SimpleChart data={data.revenueLast7Days} />
        </Card>

        {/* Top customers */}
        <Card className="p-6">
          <h3 className="font-bold">Khách quen</h3>
          <p className="text-xs text-muted-foreground">Booking nhiều nhất tháng</p>
          <ul className="mt-4 space-y-3">
            {data.topCustomers.length === 0 ? (
              <li className="py-4 text-center text-sm text-muted-foreground">Chưa có dữ liệu</li>
            ) : (
              data.topCustomers.map((c) => (
                <li key={c.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{c.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-tight">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.bookings} bookings</p>
                  </div>
                  <p className="text-sm font-semibold">{formatVND(c.total)}</p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-bold">Booking gần đây</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/bookings">
              Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {data.recentBookings.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có booking nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Mã</th>
                <th className="px-6 py-3 text-left font-medium">Khách</th>
                <th className="px-6 py-3 text-left font-medium">Sân & Giờ</th>
                <th className="px-6 py-3 text-right font-medium">Tiền</th>
                <th className="px-6 py-3 text-center font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((b) => {
                const start = new Date(b.startsAt);
                const end = new Date(b.endsAt);
                const venue = (b as { venue?: { name?: string } }).venue;
                const court = (b as { court?: { name?: string } }).court;
                const user = (b as { user?: { fullName?: string } }).user;
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-6 py-4 font-mono text-xs">#{b.code}</td>
                    <td className="px-6 py-4">{user?.fullName ?? '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {court?.name ?? '—'} ·{' '}
                      {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}–
                      {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {venue ? ` · ${venue.name}` : ''}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">{formatVND(b.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={mapTone(b.status) as never}>{statusText(b.status)}</Badge>
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

function mapTone(s: string): 'success' | 'warning' | 'destructive' | 'muted' | 'default' {
  if (s === 'CONFIRMED' || s === 'CHECKED_IN') return 'success';
  if (s === 'PENDING_PAYMENT') return 'warning';
  if (s.startsWith('CANCELLED') || s === 'NO_SHOW') return 'destructive';
  if (s === 'COMPLETED' || s === 'REFUNDED') return 'muted';
  return 'default';
}

function statusText(s: string): string {
  return (
    {
      PENDING_PAYMENT: 'Chờ thanh toán',
      CONFIRMED: 'Đã xác nhận',
      CHECKED_IN: 'Đã check-in',
      COMPLETED: 'Hoàn thành',
      CANCELLED_BY_USER: 'Khách huỷ',
      CANCELLED_BY_OWNER: 'Chủ huỷ',
      CANCELLED_TIMEOUT: 'Hết hạn',
      NO_SHOW: 'Không đến',
      REFUNDED: 'Đã hoàn',
    } as Record<string, string>
  )[s] ?? s;
}

function KpiCard({
  icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  tone: 'primary' | 'success' | 'accent';
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    accent: 'bg-accent/10 text-accent',
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
    </Card>
  );
}

function SimpleChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  return (
    <>
      <div className="mt-4 flex h-48 items-end gap-3">
        {data.map((v, i) => (
          <div
            key={i}
            className="group relative flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all hover:from-primary hover:to-emerald-400"
            style={{ height: `${(v / max) * 100}%` }}
            title={formatVND(v)}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-center text-xs text-muted-foreground">
        {data.map((_, i) => (
          <span key={i} className="flex-1">
            {labels[i] ?? i + 1}
          </span>
        ))}
      </div>
    </>
  );
}
