'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, CalendarCheck, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/venues', label: 'Khám phá', icon: Compass },
  { href: '/account/bookings', label: 'Booking', icon: CalendarCheck },
  { href: '/account/favorites', label: 'Yêu thích', icon: Heart },
  { href: '/account/profile', label: 'Tài khoản', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t bg-background/95 backdrop-blur-md md:hidden">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
