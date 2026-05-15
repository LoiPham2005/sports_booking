'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, MapPin, Shield, Crown } from 'lucide-react';
import { useStaffRole, withRole } from '@/lib/use-staff-role';
import { Suspense } from 'react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <StaffLayoutInner>{children}</StaffLayoutInner>
    </Suspense>
  );
}

function StaffLayoutInner({ children }: { children: React.ReactNode }) {
  const role = useStaffRole();
  const isManager = role === 'manager';

  const navItems = [
    { href: '/staff', label: 'Hôm nay', visible: true },
    { href: '/staff/schedule', label: 'Lịch sân', visible: true },
    { href: '/staff/revenue', label: 'Doanh thu', visible: isManager },
    { href: '/staff/team', label: 'Nhân viên', visible: isManager },
    { href: '/staff/pricing', label: 'Giá tạm thời', visible: isManager },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background shadow-sm">
        <div className="container flex h-16 items-center gap-4">
          <Link href={withRole('/staff', role)} className="flex items-center gap-2">
            <div
              className={`grid h-9 w-9 place-items-center rounded-lg text-white ${
                isManager
                  ? 'bg-gradient-to-br from-violet-500 to-violet-700'
                  : 'bg-gradient-to-br from-accent to-orange-700'
              }`}
            >
              {isManager ? <Crown className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">Staff Portal</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Sports Booking
              </span>
            </div>
          </Link>

          {isManager ? (
            <Badge className="ml-2 border-transparent bg-violet-500/15 text-violet-700 dark:text-violet-300">
              <Crown className="mr-1 h-3 w-3" /> MANAGER
            </Badge>
          ) : (
            <Badge variant="accent" className="ml-2">STAFF</Badge>
          )}

          <div className="ml-4 hidden items-center gap-1.5 text-sm md:flex">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Đang trực tại</span>
            <span className="font-semibold">Sân bóng đá Phú Mỹ Hưng</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {navItems
              .filter((n) => n.visible)
              .map((n) => (
                <Link
                  key={n.href}
                  href={withRole(n.href, role)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            <div className="mx-2 h-6 w-px bg-border" />
            <Avatar className="h-9 w-9">
              <AvatarFallback>{isManager ? 'M' : 'S'}</AvatarFallback>
            </Avatar>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Link>
            </Button>
          </div>
        </div>

        {/* Demo: switch role inline */}
        <div className="container -mt-1 flex items-center justify-end gap-2 pb-2">
          <span className="text-[11px] text-muted-foreground">Demo:</span>
          <Link
            href="/staff"
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
              !isManager
                ? 'bg-accent text-white'
                : 'border text-muted-foreground hover:bg-muted'
            }`}
          >
            STAFF
          </Link>
          <Link
            href="/staff?role=manager"
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
              isManager
                ? 'bg-violet-500 text-white'
                : 'border text-muted-foreground hover:bg-muted'
            }`}
          >
            MANAGER
          </Link>
        </div>
      </header>

      <main className="container flex-1 py-6">{children}</main>
    </div>
  );
}
