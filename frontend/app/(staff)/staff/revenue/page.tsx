'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Download, Wallet, Activity } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { useStaffRole } from '@/lib/use-staff-role';
import Link from 'next/link';

const HOURLY = [
  ['06', 0], ['07', 350_000], ['08', 700_000], ['09', 0], ['10', 0], ['11', 0],
  ['12', 0], ['13', 0], ['14', 0], ['15', 0], ['16', 1_000_000], ['17', 0],
  ['18', 700_000], ['19', 1_000_000], ['20', 700_000], ['21', 0],
] as const;

const LAST7 = [
  { d: 'T2', value: 1_800_000 },
  { d: 'T3', value: 2_100_000 },
  { d: 'T4', value: 1_950_000 },
  { d: 'T5', value: 2_400_000 },
  { d: 'T6', value: 2_800_000 },
  { d: 'T7', value: 3_500_000 },
  { d: 'CN', value: 2_400_000 },
];

export default function StaffRevenuePage() {
  const role = useStaffRole();
  if (role !== 'manager') {
    return <AccessDenied />;
  }

  const totalToday = HOURLY.reduce((s, [, v]) => s + (v as number), 0);
  const max = Math.max(...LAST7.map((x) => x.value));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="border-transparent bg-violet-500/15 text-violet-700">
            <Crown className="mr-1 h-3 w-3" /> MANAGER
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Doanh thu venue</h1>
          <p className="text-sm text-muted-foreground">
            Số liệu trong ngày tại Sân bóng đá Phú Mỹ Hưng
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Doanh thu hôm nay" value={formatVND(totalToday)} trend="+12%" icon={<Wallet />} />
        <Kpi label="Booking hôm nay" value="6" trend="+1" icon={<Activity />} />
        <Kpi label="Lấp đầy" value="78%" trend="+5%" icon={<TrendingUp />} />
        <Kpi label="Khách quay lại" value="42%" trend="+3%" icon={<Activity />} />
      </div>

      {/* Hourly chart */}
      <Card className="p-6">
        <h3 className="font-bold">Doanh thu theo khung giờ</h3>
        <p className="text-xs text-muted-foreground">Hôm nay (so với hôm qua)</p>
        <div className="mt-6 flex h-48 items-end gap-2">
          {HOURLY.map(([h, v]) => {
            const value = v as number;
            const maxValue = 1_000_000;
            const pct = (value / maxValue) * 100;
            return (
              <div
                key={h as string}
                className="flex flex-1 flex-col items-center justify-end"
                style={{ height: '100%' }}
              >
                {value > 0 && (
                  <span className="mb-1 text-[10px] font-semibold">
                    {(value / 1_000_000).toFixed(1)}M
                  </span>
                )}
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-500/40 to-violet-500"
                  style={{ height: `${pct}%`, minHeight: value > 0 ? 6 : 0 }}
                />
                <span className="mt-1 text-[10px] text-muted-foreground">{h}h</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last 7 days */}
        <Card className="p-6">
          <h3 className="font-bold">7 ngày gần nhất</h3>
          <div className="mt-4 space-y-2">
            {LAST7.map((d) => (
              <div key={d.d} className="flex items-center gap-3">
                <span className="w-8 text-xs font-mono text-muted-foreground">{d.d}</span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-violet-600"
                    style={{ width: `${(d.value / max) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right text-sm font-semibold">
                  {formatVND(d.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Court split */}
        <Card className="p-6">
          <h3 className="font-bold">Phân bố theo sân</h3>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Sân 1', amount: 700_000, pct: 30 },
              { name: 'Sân 2', amount: 700_000, pct: 30 },
              { name: 'Sân VIP', amount: 1_000_000, pct: 40 },
            ].map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.pct}% · {formatVND(c.amount)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, trend, icon }: { label: string; value: string; trend: string; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-500">
        {icon}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
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
