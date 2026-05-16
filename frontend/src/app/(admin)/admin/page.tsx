'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Building2, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatNumber, formatVND } from '@/lib/format';
import { getAdminDashboard, listAdminVenues, approveVenue, rejectVenue } from '@/lib/data/admin';
import { isApiError } from '@/lib/api/errors';
import type { AdminDashboard, AdminVenueDto } from '@/lib/api/endpoints/admin';

const PROVIDER_COLORS: Record<string, string> = {
  VNPAY: 'bg-blue-500',
  MOMO: 'bg-pink-500',
  ZALOPAY: 'bg-sky-500',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [pendingVenues, setPendingVenues] = useState<AdminVenueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminDashboard(), listAdminVenues({ status: 'PENDING' })])
      .then(([d, v]) => {
        setData(d);
        setPendingVenues(v);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    setActingId(id);
    try {
      await approveVenue(id);
      setPendingVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success('Đã duyệt venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Duyệt thất bại');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Từ chối venue này?')) return;
    setActingId(id);
    try {
      await rejectVenue(id);
      setPendingVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success('Đã từ chối');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Từ chối thất bại');
    } finally {
      setActingId(null);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  const totalPayment = data.paymentSplit.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Bức tranh sức khoẻ nền tảng — tháng hiện tại</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<ShoppingCart />} label="GMV tháng" value={formatVND(data.gmvMonth)} trend={`${data.gmvDelta >= 0 ? '+' : ''}${data.gmvDelta}%`} />
        <Kpi icon={<Building2 />} label="Booking tháng" value={formatNumber(data.bookingsMonth)} trend={`${data.totalVenues} venue`} />
        <Kpi icon={<Users />} label="User mới" value={formatNumber(data.newUsersMonth)} trend={`${formatNumber(data.totalUsers)} tổng`} />
        <Kpi icon={<AlertCircle />} label="Cần xử lý" value={`${data.pendingVenues + data.pendingDisputes}`} trend={`${data.pendingVenues} venue · ${data.pendingDisputes} dispute`} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Venue chờ duyệt</h3>
              <p className="text-xs text-muted-foreground">{pendingVenues.length} venue cần phê duyệt</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/venues?status=PENDING">Xem tất cả</Link>
            </Button>
          </div>
          {pendingVenues.length === 0 ? (
            <p className="mt-4 py-8 text-center text-sm text-muted-foreground">Không có venue chờ duyệt</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingVenues.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.district ?? ''}, {v.city} · {v.owner.fullName} ·{' '}
                      {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(v.id)} disabled={actingId === v.id}>
                      Từ chối
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(v.id)} disabled={actingId === v.id}>
                      {actingId === v.id ? '...' : 'Duyệt'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold">Top venue</h3>
          <p className="text-xs text-muted-foreground">Theo doanh thu tháng</p>
          <ul className="mt-4 space-y-3">
            {data.topVenues.length === 0 ? (
              <li className="py-2 text-center text-sm text-muted-foreground">Chưa có dữ liệu</li>
            ) : (
              data.topVenues.map((v) => (
                <li key={v.id ?? v.name} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1">{v.name ?? '—'}</span>
                  <span className="font-semibold">{formatVND(v.total)}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold">Doanh thu theo cổng thanh toán</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {data.paymentSplit.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có giao dịch tháng này</p>
          ) : (
            data.paymentSplit.map((p) => {
              const pct = totalPayment > 0 ? (p.total / totalPayment) * 100 : 0;
              return (
                <div key={p.provider}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.provider}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${PROVIDER_COLORS[p.provider] ?? 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatVND(p.total)} · {p.count} GD
                  </p>
                </div>
              );
            })
          )}
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
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  tone?: 'default' | 'warning';
}) {
  const iconBg = tone === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-violet-500/10 text-violet-600';
  return (
    <Card className="p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${iconBg}`}>{icon}</div>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <Badge variant={tone === 'warning' ? 'warning' : 'success'} className="mt-2">
        {trend}
      </Badge>
    </Card>
  );
}
