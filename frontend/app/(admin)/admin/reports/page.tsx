import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp } from 'lucide-react';
import { formatVND, formatNumber } from '@/lib/format';

const MONTHLY = [
  { m: 'T11/2024', revenue: 1_950_000_000, bookings: 980 },
  { m: 'T12/2024', revenue: 2_180_000_000, bookings: 1120 },
  { m: 'T1/2025', revenue: 2_310_000_000, bookings: 1190 },
  { m: 'T2/2025', revenue: 2_050_000_000, bookings: 1050 },
  { m: 'T3/2025', revenue: 2_540_000_000, bookings: 1320 },
  { m: 'T4/2025', revenue: 2_720_000_000, bookings: 1410 },
  { m: 'T5/2025', revenue: 2_840_000_000, bookings: 1450 },
];

export default function AdminReportsPage() {
  const max = MONTHLY.reduce((a, b) => (a > b.revenue ? a : b.revenue), 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo nền tảng</h1>
          <p className="text-sm text-muted-foreground">Số liệu GMV, growth, conversion toàn hệ thống</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border bg-card px-3 text-sm">
            <option>7 tháng qua</option>
            <option>12 tháng qua</option>
            <option>Năm hiện tại</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'GMV 30 ngày', value: formatVND(2_840_000_000), delta: '+18.4%' },
          { label: 'Booking', value: formatNumber(1450), delta: '+12.1%' },
          { label: 'User mới', value: formatNumber(842), delta: '+24.3%' },
          { label: 'Doanh thu net', value: formatVND(284_000_000), delta: '+15%' },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" /> {k.delta}
            </p>
          </Card>
        ))}
      </div>

      {/* Monthly chart */}
      <Card className="p-6">
        <h3 className="font-bold">GMV theo tháng</h3>
        <p className="text-xs text-muted-foreground">Hiển thị 7 tháng gần nhất</p>
        <div className="mt-6">
          {/* Bars row */}
          <div className="flex h-64 items-end gap-3">
            {MONTHLY.map((m, i) => {
              const isLast = i === MONTHLY.length - 1;
              const pct = (m.revenue / max) * 100;
              return (
                <div
                  key={m.m}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: '100%' }}
                >
                  <span className="mb-1 text-xs font-semibold">
                    {(m.revenue / 1_000_000_000).toFixed(2)}B
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isLast
                        ? 'bg-gradient-to-t from-primary to-emerald-400'
                        : 'bg-primary/60 group-hover:bg-primary'
                    }`}
                    style={{ height: `${pct}%`, minHeight: 8 }}
                    title={`${m.m}: ${formatVND(m.revenue)} · ${m.bookings} bookings`}
                  />
                </div>
              );
            })}
          </div>
          {/* Month labels row */}
          <div className="mt-2 flex gap-3">
            {MONTHLY.map((m) => (
              <span key={m.m} className="flex-1 text-center text-xs text-muted-foreground">
                {m.m}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Splits */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold">Top venue theo doanh thu (30 ngày)</h3>
          <ul className="mt-4 space-y-3">
            {[
              ['Sân bóng đá Phú Mỹ Hưng', 142_000_000],
              ['CLB cầu lông Vinhomes', 98_000_000],
              ['Pickleball Saigon Sports', 87_000_000],
              ['Tennis Lan Anh', 65_000_000],
              ['Bóng rổ Tao Đàn', 32_000_000],
            ].map(([name, total], i) => (
              <li key={name as string} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <p className="flex-1 text-sm">{name as string}</p>
                <p className="font-semibold">{formatVND(total as number)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold">Conversion funnel</h3>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Visit', count: 84_500, pct: 100 },
              { label: 'View venue', count: 38_400, pct: 45 },
              { label: 'Tap "Đặt sân"', count: 12_200, pct: 14 },
              { label: 'Quote', count: 4_800, pct: 6 },
              { label: 'Confirm payment', count: 1_450, pct: 1.7 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(s.count)} · {s.pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold">Phân bố thanh toán</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { name: 'VNPay', pct: 52, amount: 1_476_800_000, color: 'bg-blue-500' },
            { name: 'MoMo', pct: 30, amount: 852_000_000, color: 'bg-pink-500' },
            { name: 'ZaloPay', pct: 18, amount: 511_200_000, color: 'bg-sky-500' },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{p.name}</span>
                <Badge variant="outline">{p.pct}%</Badge>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatVND(p.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
