import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Building2, ShoppingCart } from 'lucide-react';
import { formatNumber, formatVND } from '@/lib/format';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Bức tranh sức khoẻ nền tảng — 30 ngày qua</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<ShoppingCart />} label="GMV" value={formatVND(2_840_000_000)} trend="+18.4%" />
        <Kpi icon={<Building2 />} label="Booking" value={formatNumber(4_512)} trend="+12.1%" />
        <Kpi icon={<Users />} label="User mới" value={formatNumber(842)} trend="+24.3%" />
        <Kpi icon={<TrendingUp />} label="Doanh thu net" value={formatVND(284_000_000)} trend="+15%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold">Venue chờ duyệt</h3>
          <p className="text-xs text-muted-foreground">{12} venue đang chờ phê duyệt</p>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Sân pickleball Saigon Centre', city: 'Quận 1, HCM', date: '2 giờ trước' },
              { name: 'CLB tennis Garden Court', city: 'Tân Bình, HCM', date: '5 giờ trước' },
              { name: 'Sân bóng đá Mini Hà Đông', city: 'Hà Đông, HN', date: '1 ngày trước' },
            ].map((v) => (
              <div key={v.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.city} · {v.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Xem
                  </Button>
                  <Button size="sm" variant="destructive">
                    Từ chối
                  </Button>
                  <Button size="sm">Duyệt</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold">Top venue</h3>
          <p className="text-xs text-muted-foreground">Theo doanh thu 30 ngày</p>
          <ul className="mt-4 space-y-3">
            {[
              ['Sân bóng đá Phú Mỹ Hưng', 142_000_000],
              ['CLB cầu lông Vinhomes', 98_000_000],
              ['Pickleball Saigon Sports', 87_000_000],
              ['Tennis Lan Anh', 65_000_000],
            ].map(([name, total]) => (
              <li key={name as string} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{name as string}</span>
                <span className="font-semibold">{formatVND(total as number)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold">Doanh thu theo cổng thanh toán</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <PaymentStat name="VNPay" pct={52} amount={1_476_800_000} color="bg-blue-500" />
          <PaymentStat name="MoMo" pct={30} amount={852_000_000} color="bg-pink-500" />
          <PaymentStat name="ZaloPay" pct={18} amount={511_200_000} color="bg-sky-500" />
        </div>
      </Card>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card className="p-5">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300">
        {icon}
      </div>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <Badge variant="success" className="mt-2">
        {trend}
      </Badge>
    </Card>
  );
}

function PaymentStat({
  name,
  pct,
  amount,
  color,
}: {
  name: string;
  pct: number;
  amount: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{formatVND(amount)}</p>
    </div>
  );
}
