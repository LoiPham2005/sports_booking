'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Download } from 'lucide-react';
import { formatVND, formatNumber } from '@/lib/format';
import { getAdminReports } from '@/lib/data/admin';
import type { AdminReportsResponse } from '@/lib/api/endpoints/admin';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function nDaysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<AdminReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState({ from: nDaysAgoKey(30), to: todayKey() });

  useEffect(() => {
    if (!range.from || !range.to) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Convert YYYY-MM-DD → ISO 00:00 và 23:59 local
    const fromIso = new Date(`${range.from}T00:00:00`).toISOString();
    const toIso = new Date(`${range.to}T23:59:59.999`).toISOString();
    getAdminReports({ from: fromIso, to: toIso })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e?.message ?? 'Không tải được báo cáo'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  if (loading) {
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

  if (error || !data) {
    return (
      <Card className="p-12 text-center">
        <p className="text-base font-semibold text-destructive">
          {error ?? 'Chưa có dữ liệu báo cáo'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Có thể chưa có booking hoàn thành trong khoảng thời gian này.
        </p>
        <Button className="mt-4" onClick={() => location.reload()}>
          Tải lại
        </Button>
      </Card>
    );
  }

  // Fill ngày trống giữa from..to → đảm bảo chart có đủ N cột (không bị 1 cột to)
  const filledSeries = fillMissingDays(data.from, data.to, data.series);
  const totalGmv = filledSeries.reduce((s, x) => s + x.gmv, 0);
  const totalBookings = filledSeries.reduce((s, x) => s + x.bookings, 0);
  const daysWithData = filledSeries.filter((s) => s.gmv > 0).length;
  const avgGmv = daysWithData > 0 ? totalGmv / daysWithData : 0;
  const seriesMax = Math.max(...filledSeries.map((s) => s.gmv), 1);
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
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={range}
            onChange={setRange}
            className="min-w-[280px]"
          />
          <Button variant="outline" disabled>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
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
          {filledSeries.map((s, i) => (
            <div
              key={i}
              className={`group flex-1 rounded-t-sm ${
                s.gmv > 0
                  ? 'bg-gradient-to-t from-violet-400 to-violet-600'
                  : 'bg-muted/40'
              }`}
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

/**
 * Fill ngày trống giữa `from` và `to` với gmv=0, bookings=0.
 * Backend chỉ trả về ngày có booking → chart bị 1 cột to. Fill để có đủ N cột.
 */
/** Backend group theo NGÀY VN (UTC+7). Frontend iter cũng phải dùng cùng convention. */
const VN_OFFSET_MS = 7 * 3600_000;

function vnDayKey(d: Date): string {
  return new Date(d.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

function fillMissingDays(
  fromIso: string,
  toIso: string,
  series: { day: string; gmv: number; bookings: number }[],
): { day: string; gmv: number; bookings: number }[] {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return series;

  // Backend trả `day` đã là chuỗi YYYY-MM-DD (giờ VN) → dùng trực tiếp làm key.
  const byKey = new Map<string, { gmv: number; bookings: number }>();
  for (const s of series) {
    // Nếu day đã là 'YYYY-MM-DD' giữ nguyên, nếu là ISO chuyển sang VN day key
    const key = /^\d{4}-\d{2}-\d{2}$/.test(s.day) ? s.day : vnDayKey(new Date(s.day));
    byKey.set(key, { gmv: s.gmv, bookings: s.bookings });
  }

  const out: { day: string; gmv: number; bookings: number }[] = [];
  // Iter từng ngày VN từ `from` đến `to`
  const startVn = new Date(from.getTime() + VN_OFFSET_MS);
  startVn.setUTCHours(0, 0, 0, 0);
  const endVn = new Date(to.getTime() + VN_OFFSET_MS);
  endVn.setUTCHours(0, 0, 0, 0);
  let safety = 0;
  while (startVn <= endVn && safety++ < 90) {
    const key = startVn.toISOString().slice(0, 10);
    const existing = byKey.get(key);
    out.push({
      day: key,
      gmv: existing?.gmv ?? 0,
      bookings: existing?.bookings ?? 0,
    });
    startVn.setUTCDate(startVn.getUTCDate() + 1);
  }
  return out;
}
