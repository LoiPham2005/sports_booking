import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SportsBooking — Đặt sân thể thao nhanh chóng',
    template: '%s · SportsBooking',
  },
  description:
    'Nền tảng đặt sân thể thao hàng đầu Việt Nam. Bóng đá, cầu lông, tennis, pickleball, bóng rổ — tìm sân, đặt giờ, chơi liền tay.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
