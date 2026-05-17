'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Download, Wallet, Activity } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { useStaffRole } from '@/lib/use-staff-role';
import { getRevenue } from '@/lib/data/staff';
import { isApiError } from '@/lib/api/errors';
import type { RevenueResponse } from '@/lib/api/endpoints/staff';

export default function StaffRevenuePage() {
  const role = useStaffRole();
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role === undefined) return; // đang fetch role, đừng làm gì
    if (role !== 'manager') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRevenue()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (cancelled) return;
        if (isApiError(e) && e.status === 403) {
          setError('Bạn không có quyền MANAGER ở venue nào. Liên hệ chủ sân để được gán quyền.');
        } else {
          setError(isApiError(e) ? e.message : 'Không tải được dữ liệu doanh thu');
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role === undefined || loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  if (role !== 'manager') return <AccessDenied />;

  if (error) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <Crown className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">Không thể tải doanh thu</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/staff">Về lịch hôm nay</Link>
        </Button>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  const hourMap = new Map(data.byHour.map((h) => [h.hour, h.total]));
  const hours = Array.from({ length: 16 }, (_, i) => 6 + i);
  const hourMax = Math.max(...data.byHour.map((h) => h.total), 1);
  const courtTotal = data.byCourt.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="border-transparent bg-violet-500/15 text-violet-700">
            <Crown className="mr-1 h-3 w-3" /> MANAGER
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Doanh thu venue</h1>
          <p className="text-sm text-muted-foreground">
            Số liệu ngày {new Date(data.date).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi
          label="Doanh thu hôm nay"
          value={formatVND(data.revenue)}
          trend={`${data.bookings} booking`}
          icon={<Wallet />}
        />
        <Kpi
          label="Tổng slot"
          value={`${data.totalSlots}`}
          trend="Đặt thành công + huỷ"
          icon={<Activity />}
        />
        <Kpi
          label="Avg / booking"
          value={data.bookings > 0 ? formatVND(Math.round(data.revenue / data.bookings)) : '—'}
          trend="Avg ticket"
          icon={<TrendingUp />}
        />
        <Kpi
          label="Sân hoạt động"
          value={`${data.byCourt.length}`}
          trend="Có booking hôm nay"
          icon={<Activity />}
        />
      </div>

      {/* Hourly */}
      <Card className="p-6">
        <h3 className="font-bold">Doanh thu theo giờ</h3>
        <p className="text-xs text-muted-foreground">06:00 – 21:00</p>
        <div className="mt-4 flex h-48 items-end gap-2">
          {hours.map((h) => {
            const v = hourMap.get(h) ?? 0;
            return (
              <div
                key={h}
                className="flex-1 rounded-t-md bg-gradient-to-t from-violet-400 to-violet-600"
                style={{ height: `${(v / hourMax) * 100}%`, minHeight: '2px' }}
                title={`${h}:00 — ${formatVND(v)}`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex gap-2 text-center text-xs text-muted-foreground">
          {hours.map((h) => (
            <span key={h} className="flex-1 font-mono">
              {h}
            </span>
          ))}
        </div>
      </Card>

      {/* Court split */}
      <Card className="p-6">
        <h3 className="font-bold">Phân bố theo sân</h3>
        {data.byCourt.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Chưa có booking hôm nay</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.byCourt.map((c) => {
              const pct = courtTotal > 0 ? (c.total / courtTotal) * 100 : 0;
              return (
                <div key={c.courtId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.courtName}</span>
                    <span className="text-muted-foreground">
                      {Math.round(pct)}% · {formatVND(c.total)} · {c.count} booking
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-500">
        {icon}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3" /> {trend}
      </p>
    </Card>
  );
}

function AccessDenied() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-bold">Chỉ MANAGER được truy cập</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Trang này dành cho nhân viên cấp Manager. Hãy liên hệ chủ sân nếu cần quyền cao hơn.
      </p>
      <Button asChild className="mt-4">
        <Link href="/staff">Về lịch hôm nay</Link>
      </Button>
    </Card>
  );
}
