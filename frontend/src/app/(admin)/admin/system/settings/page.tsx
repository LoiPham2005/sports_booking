'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '@/lib/data/system';
import { isApiError } from '@/lib/api/errors';
import type { SystemSettings } from '@/lib/api/endpoints/system';

export default function SystemSettingsPage() {
  const [data, setData] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local form fields (override when data loads)
  const [commission, setCommission] = useState(10);
  const [vat, setVat] = useState(0);
  const [holdMin, setHoldMin] = useState(10);
  const [timeoutMin, setTimeoutMin] = useState(15);
  const [hours24, setHours24] = useState(100);
  const [hours12, setHours12] = useState(50);
  const [under12, setUnder12] = useState(0);
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY_MON');

  useEffect(() => {
    let cancelled = false;
    getSystemSettings()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setCommission(d.commissionPercent);
        setVat(d.vatPercent);
        setHoldMin(d.bookingHoldMinutes);
        setTimeoutMin(d.paymentTimeoutMinutes);
        setHours24(d.defaultCancelPolicy.hours24Refund ?? 100);
        setHours12(d.defaultCancelPolicy.hours12Refund ?? 50);
        setUnder12(d.defaultCancelPolicy.under12Refund ?? 0);
        setPayoutSchedule(d.payoutSchedule);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const next = await updateSystemSettings({
        commissionPercent: commission,
        vatPercent: vat,
        bookingHoldMinutes: holdMin,
        paymentTimeoutMinutes: timeoutMin,
        defaultCancelPolicy: {
          hours24Refund: hours24,
          hours12Refund: hours12,
          under12Refund: under12,
        },
        payoutSchedule,
      });
      setData(next);
      toast.success('Đã lưu cài đặt — audit log đã ghi nhận');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded bg-muted/30" />
        <div className="h-40 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Badge variant="destructive">
            <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-sm text-muted-foreground">Cấu hình áp dụng cho toàn nền tảng</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Mọi thay đổi ở đây ảnh hưởng <strong>toàn bộ</strong> user/owner. Mỗi thay đổi được ghi vào Audit log.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Hoa hồng & thuế</h3>
        <p className="text-sm text-muted-foreground">
          Platform thu trên mỗi booking online thành công
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="commission">Hoa hồng (%)</Label>
            <Input
              id="commission"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vat">VAT (%)</Label>
            <Input
              id="vat"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={vat}
              onChange={(e) => setVat(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Booking flow</h3>
        <p className="text-sm text-muted-foreground">Hold + timeout của booking</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="holdMin">Hold slot (phút)</Label>
            <Input
              id="holdMin"
              type="number"
              min={1}
              max={60}
              value={holdMin}
              onChange={(e) => setHoldMin(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Giữ slot khi user vào checkout. Hết hạn → slot trả về pool
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timeoutMin">Timeout thanh toán (phút)</Label>
            <Input
              id="timeoutMin"
              type="number"
              min={1}
              max={60}
              value={timeoutMin}
              onChange={(e) => setTimeoutMin(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Booking PENDING_PAYMENT quá X phút → tự CANCELLED_TIMEOUT
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Chính sách huỷ mặc định</h3>
        <p className="text-sm text-muted-foreground">Owner có thể override trong settings venue của họ</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="hours24">≥ 24h trước (%)</Label>
            <Input
              id="hours24"
              type="number"
              min={0}
              max={100}
              value={hours24}
              onChange={(e) => setHours24(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours12">12-24h trước (%)</Label>
            <Input
              id="hours12"
              type="number"
              min={0}
              max={100}
              value={hours12}
              onChange={(e) => setHours12(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="under12">{'<'} 12h trước (%)</Label>
            <Input
              id="under12"
              type="number"
              min={0}
              max={100}
              value={under12}
              onChange={(e) => setUnder12(Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Payout chu kỳ</h3>
        <p className="text-sm text-muted-foreground">Tần suất tự động tạo Payout cho Owner</p>
        <div className="mt-4 max-w-sm">
          <Label htmlFor="payoutSchedule">Lịch payout</Label>
          <select
            id="payoutSchedule"
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={payoutSchedule}
            onChange={(e) => setPayoutSchedule(e.target.value)}
          >
            <option value="WEEKLY_MON">Hàng tuần — Thứ 2</option>
            <option value="WEEKLY_FRI">Hàng tuần — Thứ 6</option>
            <option value="BIWEEKLY">2 tuần / lần</option>
            <option value="MONTHLY">Hàng tháng (ngày 1)</option>
          </select>
        </div>
      </Card>
    </div>
  );
}
