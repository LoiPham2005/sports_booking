'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, X, RotateCw, CalendarCheck, Home, Loader2 } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { USE_MOCK } from '@/lib/api/config';
import { paymentsApi, type PaymentDto } from '@/lib/api/endpoints/payments';
import { formatVND } from '@/lib/format';

const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_MS = 60_000;

type UiState = 'loading' | 'success' | 'fail' | 'pending';

function ResultInner() {
  const params = useSearchParams();

  // 2 dạng URL:
  // - /booking/result?status=success&method=vnpay (mock fallback)
  // - /booking/result?paymentId=xxx (real API — đến từ ZaloPay flow)
  // - /booking/result?provider=vnpay&orderId=...&code=00 (backend redirect sau IPN)
  const paymentId = params.get('paymentId');
  const externalCode = params.get('code'); // VNPay/MoMo code
  const externalStatus = params.get('status'); // ZaloPay status, hoặc mock status
  const method = (params.get('method') || params.get('provider') || 'vnpay').toUpperCase();

  const [state, setState] = useState<UiState>(USE_MOCK ? 'success' : 'loading');
  const [payment, setPayment] = useState<PaymentDto | null>(null);

  // Mock — render success immediately
  useEffect(() => {
    if (USE_MOCK) {
      setState(externalStatus === 'fail' ? 'fail' : 'success');
      return;
    }

    // Trường hợp backend redirect về với `code`/`status` từ provider — coi đó là tín hiệu
    // sớm: success nếu code = 0/00, fail ngược lại. Nhưng vẫn poll để chắc.
    if (externalCode && !paymentId) {
      const isOk = externalCode === '00' || externalCode === '0';
      setState(isOk ? 'success' : 'fail');
      return;
    }

    if (!paymentId) {
      setState('fail');
      return;
    }

    // Poll payment status từ paymentId
    let cancelled = false;
    const start = Date.now();

    const poll = async () => {
      if (cancelled) return;
      try {
        const p = await paymentsApi.detail(paymentId);
        setPayment(p);
        if (p.status === 'SUCCESS') {
          setState('success');
          return;
        }
        if (p.status === 'FAILED' || p.status === 'CANCELLED' || p.status === 'EXPIRED') {
          setState('fail');
          return;
        }
        // PENDING / REFUND_PENDING — vẫn đợi
        if (Date.now() - start < POLL_MAX_MS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setState('pending'); // timeout — vẫn còn đợi webhook
        }
      } catch {
        if (Date.now() - start < POLL_MAX_MS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setState('fail');
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentId, externalCode, externalStatus]);

  function refreshNow() {
    setState('loading');
    setPayment(null);
    // re-trigger effect
    setTimeout(() => {
      const ev = new Event('popstate');
      window.dispatchEvent(ev);
    }, 0);
  }

  if (state === 'loading') {
    return (
      <>
        <Header />
        <main className="container py-16">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Đang xác nhận thanh toán</h1>
            <p className="mt-2 text-muted-foreground">
              Đang chờ phản hồi từ {method}. Có thể mất vài giây sau khi bạn hoàn tất giao dịch.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (state === 'pending') {
    return (
      <>
        <Header />
        <main className="container py-16">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/30">
              <Loader2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Đang chờ xác nhận</h1>
            <p className="mt-2 text-muted-foreground">
              Giao dịch chưa xác nhận sau {Math.round(POLL_MAX_MS / 1000)} giây. Có thể webhook đến
              chậm — thử làm mới hoặc kiểm tra trong My Bookings sau ít phút.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={refreshNow}>
                <RotateCw className="h-4 w-4" /> Làm mới
              </Button>
              <Button asChild variant="outline">
                <Link href="/account/bookings">
                  <CalendarCheck className="h-4 w-4" /> Xem My Bookings
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isSuccess = state === 'success';
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
              : payment?.failedReason ??
                'Giao dịch không thành công. Bạn có thể thử lại với phương thức khác.'}
          </p>

          {isSuccess && payment && (
            <div className="mt-6 inline-block rounded-lg border bg-card px-6 py-4 text-left text-sm shadow-sm">
              <p className="text-muted-foreground">Số tiền đã thanh toán</p>
              <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                {formatVND(payment.amount)}
              </p>
              {payment.providerOrderId && (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">Mã giao dịch</p>
                  <p className="font-mono text-xs">{payment.providerOrderId}</p>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {isSuccess ? (
              <>
                <Button asChild size="lg">
                  <Link href="/account/bookings">
                    <CalendarCheck className="h-4 w-4" /> Xem booking của tôi
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/">
                    <Home className="h-4 w-4" /> Về trang chủ
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/">
                    <RotateCw className="h-4 w-4" /> Thử lại
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

export default function BookingResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <ResultInner />
    </Suspense>
  );
}
