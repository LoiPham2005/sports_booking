import Link from 'next/link';
import { Check, X, RotateCw, CalendarCheck, Home } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';

export default function BookingResultPage({
  searchParams,
}: {
  searchParams: { status?: string; method?: string };
}) {
  const isSuccess = (searchParams.status ?? 'success') === 'success';
  const method = (searchParams.method ?? 'vnpay').toUpperCase();

  return (
    <>
      <Header />
      <main className="container py-16">
        <div className="mx-auto max-w-lg text-center">
          <div
            className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
              isSuccess ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
            }`}
          >
            {isSuccess ? <Check className="h-10 w-10" /> : <X className="h-10 w-10" />}
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            {isSuccess ? 'Đặt sân thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isSuccess
              ? `Giao dịch ${method} đã hoàn tất. Email xác nhận và mã QR check-in đã được gửi tới bạn.`
              : 'Giao dịch không thành công. Bạn có thể thử lại với phương thức khác.'}
          </p>

          {isSuccess && (
            <div className="mt-6 inline-block rounded-lg border bg-card px-6 py-4 text-left text-sm shadow-sm">
              <p className="text-muted-foreground">Mã đặt sân</p>
              <p className="font-mono text-2xl font-bold tracking-widest text-primary">20250547</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {isSuccess ? (
              <>
                <Button asChild size="lg">
                  <Link href="/account/bookings">
                    <CalendarCheck className="h-4 w-4" />
                    Xem booking của tôi
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Về trang chủ
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/booking/new">
                    <RotateCw className="h-4 w-4" />
                    Thử lại
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">Về trang chủ</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
