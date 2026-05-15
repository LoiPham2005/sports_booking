'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Crown, Plus, Tag, AlertTriangle, Trash2 } from 'lucide-react';
import { useStaffRole } from '@/lib/use-staff-role';
import Link from 'next/link';
import { formatVND } from '@/lib/format';

const OVERRIDES = [
  {
    id: 'o1',
    court: 'Sân VIP',
    date: 'Hôm nay',
    timeRange: '17:00–19:00',
    price: 600_000,
    reason: 'Khung giờ cao điểm',
    expiresIn: '2 giờ',
  },
  {
    id: 'o2',
    court: 'Tất cả sân',
    date: 'CN 18/05',
    timeRange: '06:00–08:00',
    price: 250_000,
    reason: 'Giảm sốc sáng sớm',
    expiresIn: '3 ngày',
  },
];

export default function StaffPricingPage() {
  const role = useStaffRole();
  const [showCreate, setShowCreate] = useState(false);
  if (role !== 'manager') {
    return <AccessDenied />;
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
            Override giá theo khung giờ trong ngắn hạn (lễ, giảm giá đột xuất, sự kiện...)
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
            Override này <strong>tạm thời</strong>. Quy tắc giá gốc (theo thứ trong tuần) do <strong>Owner</strong> set ở <code>/owner/venues/[id]</code> và không bị ảnh hưởng.
          </div>
        </div>
      </Card>

      {showCreate && (
        <Card className="border-violet-300 bg-violet-50/50 p-6 dark:bg-violet-950/20">
          <h3 className="font-bold">Tạo giá override mới</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Sân</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option>Tất cả sân</option>
                <option>Sân 1</option>
                <option>Sân 2</option>
                <option>Sân VIP</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Ngày áp dụng</Label>
              <Input type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Từ giờ</Label>
              <Input type="time" defaultValue="17:00" />
            </div>
            <div className="space-y-1.5">
              <Label>Đến giờ</Label>
              <Input type="time" defaultValue="19:00" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Giá mới (₫/h)</Label>
              <Input type="number" placeholder="600000" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Lý do</Label>
              <Input placeholder="Khung giờ cao điểm cuối tuần" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button>Tạo</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-bold">Đang áp dụng ({OVERRIDES.length})</h2>
        {OVERRIDES.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-600">
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{o.court}</p>
                  <Badge variant="outline">
                    {o.date} · {o.timeRange}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Hết hạn sau {o.expiresIn}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{o.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-violet-600">{formatVND(o.price)}</p>
                <p className="text-xs text-muted-foreground">/giờ</p>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
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
