'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, MoreHorizontal } from 'lucide-react';

const STAFF = [
  {
    id: 's1',
    name: 'Nguyễn Văn Trực',
    email: 'truc@example.com',
    phone: '+84 901 234 567',
    role: 'STAFF',
    venue: 'Sân bóng đá Phú Mỹ Hưng',
    status: 'ACTIVE',
    joinedAt: '2026-01-15',
  },
  {
    id: 's2',
    name: 'Trần Thị Lan',
    email: 'lan@example.com',
    phone: '+84 909 876 543',
    role: 'MANAGER',
    venue: 'CLB cầu lông Vinhomes',
    status: 'ACTIVE',
    joinedAt: '2025-11-02',
  },
  {
    id: 's3',
    name: 'Lê Minh Đức',
    email: 'duc@example.com',
    phone: '+84 905 555 111',
    role: 'STAFF',
    venue: 'Sân bóng đá Phú Mỹ Hưng',
    status: 'PENDING',
    joinedAt: '2026-05-10',
  },
];

export default function OwnerStaffPage() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhân viên</h1>
          <p className="text-sm text-muted-foreground">{STAFF.length} người đang trực tại các venue của bạn</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <Plus className="h-4 w-4" /> Mời nhân viên
        </Button>
      </div>

      {showInvite && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <h3 className="font-bold">Mời nhân viên mới</h3>
          <p className="text-sm text-muted-foreground">Họ sẽ nhận email kèm link tạo mật khẩu.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_180px_180px_auto]">
            <Input placeholder="Họ và tên" />
            <Input placeholder="Email hoặc SĐT" />
            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              <option>Vai trò: STAFF</option>
              <option>Vai trò: MANAGER</option>
            </select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              <option>Sân: Phú Mỹ Hưng</option>
              <option>Sân: Vinhomes</option>
            </select>
            <Button>Gửi mời</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm theo tên / email / venue..." className="pl-9" />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm">
            <option>Tất cả vai trò</option>
            <option>MANAGER</option>
            <option>STAFF</option>
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm">
            <option>Tất cả trạng thái</option>
            <option>ACTIVE</option>
            <option>PENDING</option>
            <option>SUSPENDED</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nhân viên</th>
              <th className="px-4 py-3 text-left font-medium">Liên hệ</th>
              <th className="px-4 py-3 text-left font-medium">Sân được giao</th>
              <th className="px-4 py-3 text-center font-medium">Vai trò</th>
              <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-center font-medium">Từ ngày</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{s.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{s.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{s.email}</p>
                  <p className="text-xs">{s.phone}</p>
                </td>
                <td className="px-4 py-3">{s.venue}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={s.role === 'MANAGER' ? 'accent' : 'default'}>{s.role}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={s.status === 'ACTIVE' ? 'success' : 'warning'}>{s.status}</Badge>
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{s.joinedAt}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
