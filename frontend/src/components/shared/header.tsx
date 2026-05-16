'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, Heart, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser, notifyAuthChanged } from '@/lib/use-current-user';
import { useConfirm } from '@/components/ui/confirm';
import { logout } from '@/lib/data/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { isApiError } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/venues', label: 'Khám phá' },
  { href: '/account/bookings', label: 'Booking của tôi', authOnly: true },
  { href: '/owner', label: 'Trở thành chủ sân' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const confirm = useConfirm();
  const user = useCurrentUser();
  const isLoggedIn = !!user;
  const isLoading = user === undefined;

  async function handleLogout() {
    const ok = await confirm({
      title: 'Đăng xuất khỏi tài khoản?',
      tone: 'warning',
      confirmText: 'Đăng xuất',
      cancelText: 'Ở lại',
    });
    if (!ok) return;
    try {
      await logout();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đăng xuất thất bại');
      return;
    }
    notifyAuthChanged();
    toast.success('Đã đăng xuất');
    router.push('/');
    router.refresh();
  }

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
          {NAV.filter((item) => !item.authOnly || isLoggedIn).map((item) => (
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

          {/* Icon Heart + Bell chỉ hiện khi đã login */}
          {isLoggedIn && (
            <>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
                <Link href="/account/favorites">
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative hidden md:inline-flex" asChild>
                <Link href="/account/notifications">
                  <Bell className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
                  >
                    2
                  </Badge>
                </Link>
              </Button>
            </>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {/* Auth area */}
          {isLoading ? (
            <div className="hidden h-9 w-32 animate-pulse rounded-md bg-muted md:block" />
          ) : isLoggedIn ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/account/profile"
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.fullName[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {user.fullName}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}

          {/* Mobile avatar — vẫn hiện cho cả 2 state, link đổi tuỳ login */}
          <Link href={isLoggedIn ? '/account/profile' : '/login'} className="md:hidden">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {isLoggedIn ? user.fullName[0]?.toUpperCase() ?? 'U' : '?'}
              </AvatarFallback>
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
