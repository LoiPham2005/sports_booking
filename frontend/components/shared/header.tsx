'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/venues', label: 'Khám phá' },
  { href: '/account/bookings', label: 'Booking của tôi' },
  { href: '/owner', label: 'Trở thành chủ sân' },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-emerald-700 text-white shadow-sm">
            <span className="text-base">🏟️</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">SportsBooking</span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Đặt sân nhanh — Chơi liền tay
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                pathname?.startsWith(item.href) && 'bg-muted text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
            <Link href="/account/favorites">
              <Heart className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative hidden md:inline-flex">
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
            >
              2
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/register">Đăng ký</Link>
          </Button>

          <Link href="/account/profile" className="md:hidden">
            <Avatar className="h-9 w-9">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <div className="container hidden items-center gap-2 pb-3 text-xs text-muted-foreground md:flex">
        <MapPin className="h-3.5 w-3.5" />
        Đang xem sân tại <span className="font-medium text-foreground">Hồ Chí Minh</span>
        <button className="ml-1 text-primary hover:underline">Đổi khu vực</button>
      </div>
    </header>
  );
}
