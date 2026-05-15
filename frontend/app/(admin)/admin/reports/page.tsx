'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatVND, formatNumber } from '@/lib/format';
import { getAdminReports } from '@/lib/data/admin';
import type { AdminReportsResponse } from '@/lib/api/endpoints/admin';

export default function AdminReportsPage() {
  const [data, setData] = useState<AdminReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAdminReports()
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
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    );
  }

  const totalGmv = data.series.reduce((s, x) => s + x.gmv, 0);
  const totalBookings = data.series.reduce((s, x) => s + x.bookings, 0);
  const avgGmv = data.series.length > 0 ? totalGmv / data.series.length : 0;
  const seriesMax = Math.max(...data.series.map((s) => s.gmv), 1);
  const sportsTotal = data.bySport.reduce((s, x) => s + x.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo nền tảng</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(data.from).toLocaleDateString('vi-VN')} –{' '}
            {new Date(data.to).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng GMV', value: formatVND(totalGmv), sub: `${data.series.length} ngày` },
          { label: 'Tổng booking', value: formatNumber(totalBookings), sub: 'thành công' },
          { label: 'Avg GMV/ngày', value: formatVND(Math.round(avgGmv)), sub: '' },
          {
            label: 'Avg ticket',
            value: totalBookings > 0 ? formatVND(Math.round(totalGmv / totalBookings)) : '—',
            sub: 'doanh thu/booking',
          },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-bold">GMV theo ngày</h3>
        <p className="text-xs text-muted-foreground">Max: {formatVND(seriesMax)}</p>
        <div className="mt-4 flex h-48 items-end gap-0.5">
          {data.series.map((s, i) => (
            <div
              key={i}
              className="group flex-1 rounded-t-sm bg-gradient-to-t from-violet-400 to-violet-600"
              style={{ height: `${(s.gmv / seriesMax) * 100}%`, minHeight: '2px' }}
              title={`${new Date(s.day).toLocaleDateString('vi-VN')}: ${formatVND(s.gmv)} (${s.bookings} bookings)`}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Phân bố theo môn thể thao</h3>
        {data.bySport.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.bySport.map((s) => {
              const pct = sportsTotal > 0 ? (s.total / sportsTotal) * 100 : 0;
              return (
                <div key={s.slug}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.sport}</span>
                    <span className="text-muted-foreground">
                      {formatVND(s.total)} · {s.count} booking ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-violet-500"
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
