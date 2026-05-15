'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Tag } from 'lucide-react';
import { formatVND } from '@/lib/format';

const VOUCHERS = [
  { code: 'SPORT20', type: 'PERCENT', value: 20, maxDiscount: 50_000, scope: 'GLOBAL', usage: 184, limit: 500, validTo: '2026-05-31', active: true },
  { code: 'WELCOME50K', type: 'FIXED', value: 50_000, maxDiscount: null, scope: 'GLOBAL', usage: 412, limit: 1000, validTo: '2026-06-30', active: true },
  { code: 'PICKLEBALL', type: 'PERCENT', value: 15, maxDiscount: 30_000, scope: 'SPORT', usage: 56, limit: 200, validTo: '2026-05-20', active: true },
  { code: 'NEWYEAR2026', type: 'PERCENT', value: 30, maxDiscount: 100_000, scope: 'GLOBAL', usage: 1024, limit: 1024, validTo: '2026-01-31', active: false },
];

export default function AdminVouchersPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voucher</h1>
          <p className="text-sm text-muted-foreground">Quản lý mã giảm giá toàn nền tảng</p>
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
              <Label>Mã code</Label>
              <Input placeholder="VD: SPORT20" className="uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label>Loại</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option>Giảm theo %</option>
                <option>Giảm số tiền cố định</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Giá trị</Label>
              <Input placeholder="20" />
            </div>
            <div className="space-y-1.5">
              <Label>Giảm tối đa (₫)</Label>
              <Input placeholder="50000" />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn tối thiểu (₫)</Label>
              <Input placeholder="100000" />
            </div>
            <div className="space-y-1.5">
              <Label>Lượt dùng tối đa</Label>
              <Input placeholder="1000" />
            </div>
            <div className="space-y-1.5">
              <Label>Phạm vi</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option>GLOBAL — toàn hệ thống</option>
                <option>SPORT — theo môn</option>
                <option>VENUE — theo venue</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Hiệu lực đến</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button>Tạo</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Giảm</th>
              <th className="px-4 py-3 text-left font-medium">Scope</th>
              <th className="px-4 py-3 text-center font-medium">Sử dụng</th>
              <th className="px-4 py-3 text-center font-medium">Hết hạn</th>
              <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {VOUCHERS.map((v) => {
              const pct = (v.usage / v.limit) * 100;
              return (
                <tr key={v.code} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="font-mono font-bold">{v.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {v.type === 'PERCENT'
                      ? `${v.value}%${v.maxDiscount ? ' · max ' + formatVND(v.maxDiscount) : ''}`
                      : formatVND(v.value)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{v.scope}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{v.usage}</span>
                        <span className="text-muted-foreground">/ {v.limit}</span>
                      </div>
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${pct >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{v.validTo}</td>
                  <td className="px-4 py-3 text-center">
                    {v.active ? (
                      <Badge variant="success">Đang chạy</Badge>
                    ) : (
                      <Badge variant="muted">Đã tắt</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
