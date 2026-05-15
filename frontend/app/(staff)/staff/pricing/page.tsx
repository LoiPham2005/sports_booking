'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Crown, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { useStaffRole } from '@/lib/use-staff-role';
import { formatVND } from '@/lib/format';
import { listMyOverrides, createOverride, deleteOverride } from '@/lib/data/staff';
import { getMyMemberships } from '@/lib/data/staff';
import { isApiError } from '@/lib/api/errors';
import type { PriceOverrideDto } from '@/lib/api/endpoints/staff';

export default function StaffPricingPage() {
  const role = useStaffRole();
  const [showCreate, setShowCreate] = useState(false);
  const [venueId, setVenueId] = useState('');
  const [overrides, setOverrides] = useState<PriceOverrideDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');
  const [price, setPrice] = useState(600_000);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role !== 'manager') {
      setLoading(false);
      return;
    }
    getMyMemberships().then((ms) => {
      const mgr = ms.find((m) => m.role === 'MANAGER');
      if (mgr) setVenueId(mgr.venueId);
    });
  }, [role]);

  useEffect(() => {
    if (!venueId || role !== 'manager') return;
    setLoading(true);
    let cancelled = false;
    listMyOverrides(venueId)
      .then((list) => !cancelled && setOverrides(list))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [venueId, role]);

  if (role !== 'manager') return <AccessDenied />;

  async function handleCreate() {
    if (!courtId.trim()) return toast.error('Nhập mã sân (court ID)');
    setSubmitting(true);
    try {
      const created = await createOverride({
        courtId,
        date,
        startTime,
        endTime,
        price,
        reason: reason || undefined,
      });
      setOverrides((prev) => [created, ...prev]);
      toast.success('Đã tạo override giá');
      setShowCreate(false);
      setCourtId('');
      setReason('');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Tạo override thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá override này?')) return;
    setOverrides((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteOverride(id);
      toast.success('Đã xoá');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="border-transparent bg-violet-500/15 text-violet-700">
            <Crown className="mr-1 h-3 w-3" /> MANAGER
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Giá tạm thời</h1>
          <p className="text-sm text-muted-foreground">
            Override giá theo khung giờ ngắn hạn (lễ, giảm sốc, sự kiện)
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" /> Tạo override
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900 dark:text-amber-200">
            Override sẽ <strong>thay thế</strong> giá rule mặc định trong khung thời gian được chọn.
            Cẩn thận để không nhầm sang giá thấp/cao ngoài ý muốn.
          </div>
        </div>
      </Card>

      {showCreate && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <h3 className="font-bold">Tạo override mới</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="courtId">Mã sân (Court ID)</Label>
              <Input
                id="courtId"
                placeholder="c1, c2, c3..."
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Ngày áp dụng</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Giá mới (VND)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                step={10000}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Từ</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">Đến</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
              <Input
                id="reason"
                placeholder="VD: Khung giờ cao điểm cuối tuần"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} disabled={submitting}>
              Huỷ
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Lưu override'}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : overrides.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Chưa có override giá nào
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Sân</th>
                <th className="px-4 py-3 text-left font-medium">Ngày</th>
                <th className="px-4 py-3 text-left font-medium">Khung giờ</th>
                <th className="px-4 py-3 text-right font-medium">Giá</th>
                <th className="px-4 py-3 text-left font-medium">Lý do</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{o.court.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {o.startTime}–{o.endTime}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-violet-600">
                    {formatVND(o.price)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.reason ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(o.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function AccessDenied() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-bold">Chỉ MANAGER được truy cập</h2>
      <Button asChild className="mt-4">
        <Link href="/staff">Về lịch hôm nay</Link>
      </Button>
    </Card>
  );
}
