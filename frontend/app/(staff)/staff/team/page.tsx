'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Phone, MoreHorizontal, Shield } from 'lucide-react';
import { useStaffRole } from '@/lib/use-staff-role';
import Link from 'next/link';

const TEAM = [
  { id: 's2', name: 'Lê Thị Mai', email: 'mai@example.com', phone: '+84 909 876 543', role: 'STAFF', joinedAt: '2025-01-04', bookings: 215, isMe: false },
  { id: 's4', name: 'Phạm Hoàng Long', email: 'long@example.com', phone: '+84 908 333 444', role: 'STAFF', joinedAt: '2026-05-10', bookings: 12, isMe: false },
];

export default function StaffTeamPage() {
  const role = useStaffRole();
  if (role !== 'manager') {
    return <AccessDenied />;
  }
  return (
    <div className="space-y-6">
      <div>
        <Badge className="border-transparent bg-violet-500/15 text-violet-700">
          <Crown className="mr-1 h-3 w-3" /> MANAGER
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Đội ngũ tại venue</h1>
        <p className="text-sm text-muted-foreground">
          {TEAM.length} nhân viên đang trực tại Sân bóng đá Phú Mỹ Hưng
        </p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nhân viên</th>
              <th className="px-4 py-3 text-left font-medium">Liên hệ</th>
              <th className="px-4 py-3 text-center font-medium">Vai trò</th>
              <th className="px-4 py-3 text-right font-medium">Bookings xử lý</th>
              <th className="px-4 py-3 text-center font-medium">Vào ngày</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-violet-50 dark:bg-violet-950/20">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-violet-500 text-white">M</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Bạn (Manager Demo)</p>
                    <p className="text-xs text-muted-foreground">manager@sportsbooking.local</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">+84 901 000 000</td>
              <td className="px-4 py-3 text-center">
                <Badge className="border-transparent bg-violet-500/15 text-violet-700">
                  <Crown className="mr-1 h-3 w-3" /> MANAGER
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">421</td>
              <td className="px-4 py-3 text-center text-muted-foreground">2024-08-12</td>
              <td className="px-4 py-3 text-right">
                <span className="text-xs text-muted-foreground">(bạn)</span>
              </td>
            </tr>
            {TEAM.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{s.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="accent">
                    <Shield className="mr-1 h-3 w-3" /> STAFF
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">{s.bookings}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{s.joinedAt}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="border-amber-200 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
        <p className="text-amber-900 dark:text-amber-200">
          ℹ️ Manager chỉ <strong>xem</strong> đội ngũ. Mời/xoá nhân viên do <strong>Owner</strong> thực hiện tại <code>/owner/staff</code>.
        </p>
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
