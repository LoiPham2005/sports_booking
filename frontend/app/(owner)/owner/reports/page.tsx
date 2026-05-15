import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp } from 'lucide-react';
import { formatVND } from '@/lib/format';

const REVENUE_30D = [
  40, 55, 30, 60, 75, 65, 80, 45, 90, 70, 85, 75, 95, 80, 60,
  72, 88, 91, 65, 78, 84, 92, 70, 88, 96, 105, 110, 82, 95, 100,
];

const PAYMENTS = [
  { name: 'VNPay', pct: 52, color: 'bg-blue-500', amount: 1_476_800_000 },
  { name: 'MoMo', pct: 30, color: 'bg-pink-500', amount: 852_000_000 },
  { name: 'ZaloPay', pct: 18, color: 'bg-sky-500', amount: 511_200_000 },
];

const OCCUPANCY = [
  ['06', 10], ['07', 18], ['08', 32], ['09', 28], ['10', 22], ['11', 18],
  ['12', 16], ['13', 22], ['14', 28], ['15', 36], ['16', 48], ['17', 75],
  ['18', 92], ['19', 96], ['20', 88], ['21', 64],
] as const;

export default function OwnerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">Tổng quan doanh thu, lấp đầy, top khách</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border bg-card px-3 text-sm">
            <option>30 ngày qua</option>
            <option>7 ngày qua</option>
            <option>Tháng này</option>
            <option>Quý này</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Doanh thu (30 ngày)', value: formatVND(2_300_000_000), trend: '+12.4%' },
          { label: 'Tổng booking', value: '1,248', trend: '+18 vs kỳ trước' },
          { label: 'Lấp đầy TB', value: '72%', trend: '+5% MoM' },
          { label: 'Khách quay lại', value: '38%', trend: '+3% MoM' },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" /> {k.trend}
            </p>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="p-6">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-bold">Doanh thu 30 ngày</h3>
            <p className="text-xs text-muted-foreground">So sánh với 30 ngày trước</p>
          </div>
          <Badge variant="success">+12.4%</Badge>
        </div>
        <div className="mt-6 flex h-56 items-end gap-1">
          {REVENUE_30D.map((v, i) => (
            <div
              key={i}
              className="group flex-1 rounded-t-md bg-gradient-to-t from-primary/50 to-primary transition-all hover:from-primary hover:to-emerald-400"
              style={{ height: `${(v / 110) * 100}%` }}
              title={`Ngày ${i + 1}: ${formatVND(v * 800_000)}`}
            />
          ))}
        </div>
      </Card>

      {/* Occupancy heatmap (bars per hour) */}
      <Card className="p-6">
        <h3 className="font-bold">Lấp đầy theo khung giờ</h3>
        <p className="text-xs text-muted-foreground">% slot được đặt trong ngày trung bình</p>
        <div className="mt-6 space-y-2">
          {OCCUPANCY.map(([hour, pct]) => (
            <div key={hour as string} className="flex items-center gap-3">
              <span className="w-10 text-right font-mono text-xs text-muted-foreground">{hour}h</span>
              <div className="relative flex-1 h-7 rounded-md bg-muted">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-primary to-emerald-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white mix-blend-difference">
                  {pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold">Top khách hàng</h3>
          <ul className="mt-4 space-y-3">
            {[
              ['Trần Minh', 24, 7_200_000],
              ['Lê Hà', 19, 5_700_000],
              ['Đức Phạm', 16, 4_800_000],
              ['Nguyễn An', 13, 3_900_000],
              ['Hoàng Vy', 11, 3_300_000],
            ].map(([name, count, total], i) => (
              <li key={name as string} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{count as number} bookings</p>
                </div>
                <p className="font-semibold">{formatVND(total as number)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold">Doanh thu theo cổng thanh toán</h3>
          <div className="mt-4 space-y-4">
            {PAYMENTS.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatVND(p.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
