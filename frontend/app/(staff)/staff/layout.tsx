'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, MapPin, Shield } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background shadow-sm">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/staff" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-orange-700 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">Staff Portal</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Sports Booking
              </span>
            </div>
          </Link>

          <Badge variant="accent" className="ml-2">STAFF</Badge>

          <div className="ml-4 hidden items-center gap-1.5 text-sm md:flex">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Đang trực tại</span>
            <span className="font-semibold">Sân bóng đá Phú Mỹ Hưng</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/staff"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Hôm nay
            </Link>
            <Link
              href="/staff/schedule"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Lịch sân
            </Link>
            <div className="mx-2 h-6 w-px bg-border" />
            <Avatar className="h-9 w-9">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-6">{children}</main>
    </div>
  );
}
