import { TrendingUp, CalendarCheck, Wallet, Activity, ArrowUpRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatVND, formatNumber } from '@/lib/format';

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Hôm nay, 15/05/2026 — Chào mừng trở lại 👋</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Tạo booking thủ công
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Wallet className="h-5 w-5" />}
          label="Doanh thu hôm nay"
          value={formatVND(4_350_000)}
          trend="+12% so với hôm qua"
          tone="primary"
        />
        <KpiCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Booking hôm nay"
          value={formatNumber(18)}
          trend="+3 booking mới"
          tone="success"
        />
        <KpiCard
          icon={<Activity className="h-5 w-5" />}
          label="Tỉ lệ lấp đầy"
          value="76%"
          trend="Cao hơn TB ngành 8%"
          tone="accent"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Doanh thu 30 ngày"
          value={formatVND(82_500_000)}
          trend="+8.3% so với tháng trước"
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-bold">Doanh thu 30 ngày</h3>
              <p className="text-xs text-muted-foreground">So sánh với 30 ngày trước</p>
            </div>
            <Badge variant="success">+12.4%</Badge>
          </div>
          <SimpleChart />
        </Card>

        {/* Top customers */}
        <Card className="p-6">
          <h3 className="font-bold">Khách quen</h3>
          <p className="text-xs text-muted-foreground">Booking nhiều nhất tháng</p>
          <ul className="mt-4 space-y-3">
            {[
              { name: 'Trần Minh', count: 8, total: 2_400_000 },
              { name: 'Lê Hà', count: 6, total: 1_800_000 },
              { name: 'Đức Phạm', count: 5, total: 1_500_000 },
              { name: 'Nguyễn An', count: 4, total: 1_200_000 },
            ].map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{c.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} bookings</p>
                </div>
                <p className="text-sm font-semibold">{formatVND(c.total)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-bold">Booking gần đây</h3>
          <Button variant="ghost" size="sm">
            Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
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
            {[
              ['20250547', 'Trần Minh', 'Sân 1 · 18:00–20:00 hôm nay', 700_000, 'success', 'Đã xác nhận'],
              ['20250546', 'Lê Hà', 'Sân VIP · 19:00–21:00 hôm nay', 1_000_000, 'success', 'Đã xác nhận'],
              ['20250545', 'Đức Phạm', 'Sân 2 · 17:00–18:00 hôm nay', 350_000, 'warning', 'Chờ thanh toán'],
              ['20250544', 'Nguyễn An', 'Sân 1 · 16:00–17:00 hôm nay', 350_000, 'muted', 'Hoàn thành'],
            ].map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-6 py-4 font-mono text-xs">#{r[0]}</td>
                <td className="px-6 py-4">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4 text-right font-semibold">{formatVND(r[3] as number)}</td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={r[4] as never}>{r[5]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
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
      <p className="mt-1 text-xs text-success">{trend}</p>
    </Card>
  );
}

function SimpleChart() {
  // Simple SVG bar chart
  const data = [40, 55, 30, 60, 75, 65, 80, 45, 90, 70, 85, 75, 95, 80, 60];
  const max = 100;
  return (
    <div className="mt-4 flex h-48 items-end gap-1.5">
      {data.map((v, i) => (
        <div
          key={i}
          className="group flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all hover:from-primary hover:to-emerald-400"
          style={{ height: `${(v / max) * 100}%` }}
          title={`Ngày ${i + 1}: ${formatVND(v * 50_000)}`}
        />
      ))}
    </div>
  );
}
