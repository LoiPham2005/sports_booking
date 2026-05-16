'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  Users,
  PlusSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NAV = [
  { href: '/owner', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/owner/venues', label: 'Sân của tôi', icon: Building2 },
  { href: '/owner/bookings', label: 'Booking', icon: CalendarRange },
  { href: '/owner/walk-in', label: 'Booking thủ công', icon: PlusSquare },
  { href: '/owner/staff', label: 'Nhân viên', icon: Users },
  { href: '/owner/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/owner/payout', label: 'Thanh toán', icon: Wallet },
  { href: '/owner/settings', label: 'Cài đặt', icon: Settings },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">🏟️</div>
          <span className="font-bold">SportsBooking</span>
        </Link>
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Về trang khách hàng
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>O</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-semibold">Demo Owner</p>
            <p className="text-xs text-muted-foreground">3 venues</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
