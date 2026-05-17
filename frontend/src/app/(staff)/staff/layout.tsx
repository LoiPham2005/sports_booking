'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ChevronLeft,
  Crown,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Shield,
  Tag,
  Users,
} from 'lucide-react';
import { LogoutButton } from '@/components/shared/logout-button';
import { useStaffRole, withRole } from '@/lib/use-staff-role';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  managerOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/staff', label: 'Hôm nay', icon: LayoutDashboard, exact: true },
  { href: '/staff/schedule', label: 'Lịch sân', icon: CalendarDays },
  { href: '/staff/revenue', label: 'Doanh thu', icon: DollarSign, managerOnly: true },
  { href: '/staff/team', label: 'Nhân viên', icon: Users, managerOnly: true },
  { href: '/staff/pricing', label: 'Giá tạm thời', icon: Tag, managerOnly: true },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <StaffLayoutInner>{children}</StaffLayoutInner>
    </Suspense>
  );
}

function StaffLayoutInner({ children }: { children: React.ReactNode }) {
  const role = useStaffRole();
  const pathname = usePathname();
  const isManager = role === 'manager';
  const isLoading = role === undefined;
  const accent = isManager ? 'violet' : 'orange';

  // Khi đang load role, hiện đủ menu để tránh flash → ẩn dần khi confirmed STAFF
  const visibleNav = NAV.filter((n) => !n.managerOnly || isManager || isLoading);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div
            className={cn(
              'grid h-8 w-8 place-items-center rounded-lg text-white',
              isManager
                ? 'bg-gradient-to-br from-violet-500 to-violet-700'
                : 'bg-gradient-to-br from-accent to-orange-700',
            )}
          >
            {isManager ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-bold">Staff Portal</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Sports Booking
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Về trang chính
        </Link>

        <div className="border-b px-5 py-3">
          {isManager ? (
            <Badge className="border-transparent bg-violet-500/15 text-violet-700 dark:text-violet-300">
              <Crown className="mr-1 h-3 w-3" /> MANAGER
            </Badge>
          ) : (
            <Badge variant="accent">
              <Shield className="mr-1 h-3 w-3" /> STAFF
            </Badge>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold leading-tight">Sân bóng đá Phú Mỹ Hưng</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const href = withRole(item.href, role);
            const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? accent === 'violet'
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300'
                      : 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Demo: role switcher inline */}
        <div className="border-t p-3">
          <p className="mb-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Demo · đổi role
          </p>
          <div className="flex gap-1">
            <Link
              href="/staff"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-bold transition-colors',
                !isManager
                  ? 'bg-accent text-white'
                  : 'border text-muted-foreground hover:bg-muted',
              )}
            >
              STAFF
            </Link>
            <Link
              href="/staff?role=manager"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-bold transition-colors',
                isManager
                  ? 'bg-violet-500 text-white'
                  : 'border text-muted-foreground hover:bg-muted',
              )}
            >
              MANAGER
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Staff Portal</h1>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · {isManager ? 'Quản lý' : 'Nhân viên'} tại Sân bóng đá Phú Mỹ Hưng
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{isManager ? 'M' : 'S'}</AvatarFallback>
            </Avatar>
            <LogoutButton variant="ghost" iconOnlyOnMobile />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
