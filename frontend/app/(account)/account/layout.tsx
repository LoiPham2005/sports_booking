import Link from 'next/link';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MobileNav } from '@/components/shared/mobile-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarCheck, Heart, User, Bell, LogOut, Settings } from 'lucide-react';

const NAV = [
  { href: '/account/bookings', label: 'Booking của tôi', icon: CalendarCheck },
  { href: '/account/favorites', label: 'Sân yêu thích', icon: Heart },
  { href: '/account/notifications', label: 'Thông báo', icon: Bell },
  { href: '/account/profile', label: 'Thông tin cá nhân', icon: User },
  { href: '/account/settings', label: 'Cài đặt', icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container py-6 pb-20 md:pb-12">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>NM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">Nguyễn Minh</p>
                    <p className="text-xs text-muted-foreground">minh@example.com</p>
                  </div>
                </div>
              </div>

              <nav className="rounded-xl border bg-card p-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <hr className="my-2" />
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </Link>
              </nav>
            </div>
          </aside>

          <div>{children}</div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
