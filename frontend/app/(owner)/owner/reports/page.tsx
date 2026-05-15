'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { getOwnerReports } from '@/lib/data/owner';
import type { ReportsResponse } from '@/lib/api/endpoints/owner';

const PROVIDER_COLORS: Record<string, string> = {
  VNPAY: 'bg-blue-500',
  MOMO: 'bg-pink-500',
  ZALOPAY: 'bg-sky-500',
  STRIPE: 'bg-purple-500',
  BANK_TRANSFER: 'bg-slate-500',
  CASH: 'bg-emerald-500',
};

export default function OwnerReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    getOwnerReports({ groupBy })
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [groupBy]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    );
  }

  const totalRevenue = data.series.reduce((s, b) => s + b.total, 0);
  const totalBookings = data.series.reduce((s, b) => s + b.count, 0);
  const avgPerDay = data.series.length > 0 ? totalRevenue / data.series.length : 0;
  const paymentTotal = data.paymentBreakdown.reduce((s, p) => s + p.total, 0);
  const seriesMax = Math.max(...data.series.map((s) => s.total), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">Tổng quan doanh thu + thanh toán</p>
        </div>
        <div className="flex gap-2">
          <select
            className="h-9 rounded-md border bg-card px-3 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as never)}
          >
            <option value="day">Theo ngày (30 ngày)</option>
            <option value="week">Theo tuần (3 tháng)</option>
            <option value="month">Theo tháng (1 năm)</option>
          </select>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng doanh thu', value: formatVND(totalRevenue), trend: `${data.series.length} bucket` },
          { label: 'Tổng booking', value: totalBookings.toLocaleString('vi-VN'), trend: `${totalBookings} thành công` },
          { label: 'Trung bình / kỳ', value: formatVND(Math.round(avgPerDay)), trend: `/${groupBy === 'day' ? 'ngày' : groupBy === 'week' ? 'tuần' : 'tháng'}` },
          { label: 'Doanh thu / booking', value: totalBookings > 0 ? formatVND(Math.round(totalRevenue / totalBookings)) : '—', trend: 'Avg ticket' },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> {k.trend}
            </p>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="p-6">
        <h3 className="font-bold">Doanh thu theo {groupBy === 'day' ? 'ngày' : groupBy === 'week' ? 'tuần' : 'tháng'}</h3>
        <p className="text-xs text-muted-foreground">Max: {formatVND(seriesMax)}</p>
        <div className="mt-4 flex h-64 items-end gap-1">
          {data.series.length === 0 ? (
            <p className="m-auto text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            data.series.map((b, i) => (
              <div
                key={i}
                className="group flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary"
                style={{ height: `${(b.total / seriesMax) * 100}%`, minHeight: '2px' }}
                title={`${new Date(b.bucket).toLocaleDateString('vi-VN')}: ${formatVND(b.total)}`}
              />
            ))
          )}
        </div>
      </Card>

      {/* Payment breakdown */}
      <Card className="p-6">
        <h3 className="font-bold">Breakdown theo cổng thanh toán</h3>
        <p className="text-xs text-muted-foreground">Tổng giao dịch SUCCESS</p>
        {data.paymentBreakdown.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Chưa có giao dịch</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.paymentBreakdown.map((p) => {
              const pct = paymentTotal > 0 ? (p.total / paymentTotal) * 100 : 0;
              return (
                <div key={p.provider}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.provider}</span>
                    <span className="text-muted-foreground">
                      {formatVND(p.total)} · {p.count} giao dịch ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${PROVIDER_COLORS[p.provider] ?? 'bg-primary'}`}
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
