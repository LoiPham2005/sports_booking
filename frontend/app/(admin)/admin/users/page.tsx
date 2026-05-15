'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MoreHorizontal, UserPlus, Download } from 'lucide-react';
import { formatVND } from '@/lib/format';

const USERS = [
  { id: 'u1', name: 'Nguyễn Minh', email: 'minh@example.com', phone: '+84 901 234 567', role: 'CUSTOMER', status: 'ACTIVE', bookings: 24, spend: 7_200_000, joined: '2025-08-12' },
  { id: 'u2', name: 'Owner Demo', email: 'owner@sportsbooking.local', phone: '+84 902 111 222', role: 'OWNER', status: 'ACTIVE', bookings: 0, spend: 0, joined: '2025-01-04' },
  { id: 'u3', name: 'Trần Văn Trực', email: 'truc@example.com', phone: '+84 905 333 444', role: 'STAFF', status: 'ACTIVE', bookings: 0, spend: 0, joined: '2026-01-15' },
  { id: 'u4', name: 'Lê Thị Hà', email: 'ha@example.com', phone: '+84 909 555 666', role: 'CUSTOMER', status: 'ACTIVE', bookings: 19, spend: 5_700_000, joined: '2025-11-08' },
  { id: 'u5', name: 'Đức Phạm', email: 'duc@example.com', phone: '+84 908 777 888', role: 'CUSTOMER', status: 'SUSPENDED', bookings: 5, spend: 1_500_000, joined: '2025-12-03' },
  { id: 'u6', name: 'Admin System', email: 'admin@sportsbooking.local', phone: '+84 900 000 000', role: 'SUPER_ADMIN', status: 'ACTIVE', bookings: 0, spend: 0, joined: '2024-12-01' },
];

const ROLE_TONE: Record<string, 'default' | 'accent' | 'warning' | 'destructive' | 'muted'> = {
  CUSTOMER: 'default',
  OWNER: 'accent',
  STAFF: 'warning',
  ADMIN: 'destructive',
  SUPER_ADMIN: 'destructive',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-sm text-muted-foreground">{USERS.length} tài khoản</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button>
            <UserPlus className="h-4 w-4" /> Tạo user
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm theo email, SĐT, tên..." className="pl-9" />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm">
            <option>Tất cả role</option>
            <option>CUSTOMER</option>
            <option>OWNER</option>
            <option>STAFF</option>
            <option>ADMIN</option>
            <option>SUPER_ADMIN</option>
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm">
            <option>Mọi trạng thái</option>
            <option>ACTIVE</option>
            <option>SUSPENDED</option>
            <option>DELETED</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Liên hệ</th>
              <th className="px-4 py-3 text-center font-medium">Role</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Booking</th>
              <th className="px-4 py-3 text-right font-medium">Chi tiêu</th>
              <th className="px-4 py-3 text-center font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">#{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{u.email}</p>
                  <p className="text-xs">{u.phone}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={ROLE_TONE[u.role] ?? 'default'}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">{u.bookings}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {u.spend > 0 ? formatVND(u.spend) : '—'}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">{u.joined}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t p-4 text-sm">
          <p className="text-muted-foreground">Hiển thị 1–{USERS.length} của 1,248 users</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="outline" size="sm">Sau</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
