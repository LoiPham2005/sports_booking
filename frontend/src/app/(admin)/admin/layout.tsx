'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  Tag,
  Settings,
  ChevronLeft,
  BarChart3,
  ScrollText,
  Zap,
  Crown,
  Flag,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/venues', label: 'Duyệt venue', icon: Building2 },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/disputes', label: 'Khiếu nại', icon: ShieldAlert },
  { href: '/admin/vouchers', label: 'Voucher', icon: Tag },
  { href: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
];

const SUPER_NAV = [
  { href: '/admin/system/settings', label: 'Cài đặt hệ thống', icon: Settings },
  { href: '/admin/system/roles', label: 'Quản lý role', icon: Crown },
  { href: '/admin/system/permissions', label: 'Phân quyền', icon: KeyRound },
  { href: '/admin/system/feature-flags', label: 'Feature flags', icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-white">
            ⚡
          </div>
          <div>
            <p className="text-sm font-bold">SportsBooking</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Về trang chính
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 flex items-center gap-2 px-3">
            <Zap className="h-3 w-3 text-violet-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Super Admin only
            </span>
          </div>

          {SUPER_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-lg font-semibold">Admin Portal</h1>
          <span className="text-xs text-muted-foreground">Super Admin · admin@sportsbooking.local</span>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
