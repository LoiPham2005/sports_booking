'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag } from 'lucide-react';
import { formatVND } from '@/lib/format';
import {
  listAdminVouchers,
  createAdminVoucher,
  deleteAdminVoucher,
} from '@/lib/data/admin';
import { isApiError } from '@/lib/api/errors';
import type { VoucherDto } from '@/lib/api/endpoints/admin';

const SCOPE_LABEL: Record<string, string> = {
  GLOBAL: 'Toàn nền tảng',
  VENUE: 'Theo venue',
  SPORT: 'Theo môn',
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [minOrder, setMinOrder] = useState<number | ''>('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(
    new Date(Date.now() + 30 * 24 * 3600_000).toISOString().split('T')[0],
  );
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listAdminVouchers()
      .then(setVouchers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!code.trim()) return toast.error('Nhập mã voucher');
    setSubmitting(true);
    try {
      const created = await createAdminVoucher({
        code,
        type,
        value,
        maxDiscount: maxDiscount === '' ? undefined : Number(maxDiscount),
        minOrder: minOrder === '' ? undefined : Number(minOrder),
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        usageLimit: usageLimit === '' ? undefined : Number(usageLimit),
        scope: 'GLOBAL',
        isActive: true,
      });
      setVouchers((prev) => [created, ...prev]);
      toast.success(`Đã tạo voucher ${created.code}`);
      setShowCreate(false);
      setCode('');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Tạo voucher thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(v: VoucherDto) {
    if (!confirm(`Vô hiệu voucher ${v.code}?`)) return;
    setVouchers((prev) => prev.map((x) => (x.id === v.id ? { ...x, isActive: false } : x)));
    try {
      await deleteAdminVoucher(v.id);
      toast.success('Đã vô hiệu voucher');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voucher</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${vouchers.length} mã giảm giá`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" /> Tạo voucher
        </Button>
      </div>

      {showCreate && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <h3 className="font-bold">Tạo voucher mới</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">Mã code</Label>
              <Input
                id="code"
                placeholder="VD: SPORT20"
                className="uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Loại</Label>
              <select
                id="type"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as 'PERCENT' | 'FIXED')}
              >
                <option value="PERCENT">PERCENT (% giảm)</option>
                <option value="FIXED">FIXED (số tiền)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Giá trị {type === 'PERCENT' ? '(%)' : '(VND)'}</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxDiscount">Giảm tối đa (VND, optional)</Label>
              <Input
                id="maxDiscount"
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minOrder">Đơn tối thiểu (VND, optional)</Label>
              <Input
                id="minOrder"
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usageLimit">Tổng lượt dùng (optional)</Label>
              <Input
                id="usageLimit"
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validFrom">Bắt đầu</Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validTo">Kết thúc</Label>
              <Input
                id="validTo"
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} disabled={submitting}>
              Huỷ
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo voucher'}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có voucher nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-center font-medium">Loại</th>
                <th className="px-4 py-3 text-right font-medium">Giá trị</th>
                <th className="px-4 py-3 text-center font-medium">Scope</th>
                <th className="px-4 py-3 text-right font-medium">Đã dùng</th>
                <th className="px-4 py-3 text-center font-medium">Hết hạn</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono font-bold">{v.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="text-xs">
                      {v.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {v.type === 'PERCENT' ? `${v.value}%` : formatVND(v.value)}
                    {v.maxDiscount && (
                      <p className="text-xs font-normal text-muted-foreground">
                        max {formatVND(v.maxDiscount)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{SCOPE_LABEL[v.scope]}</td>
                  <td className="px-4 py-3 text-right text-xs">
                    {v._count?.redemptions ?? 0}
                    {v.usageLimit ? ` / ${v.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {new Date(v.validTo).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={v.isActive ? ('success' as never) : ('muted' as never)}>
                      {v.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(v)}
                      >
                        Vô hiệu
                      </Button>
                    )}
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
