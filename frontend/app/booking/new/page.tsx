'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PaymentMethodPicker, type PaymentMethodKey } from '@/components/booking/payment-method';
import { USE_MOCK } from '@/lib/api/config';
import { bookingsApi, type QuoteResponse } from '@/lib/api/endpoints/bookings';
import { paymentsApi } from '@/lib/api/endpoints/payments';
import { getVenue } from '@/lib/data/venues';
import { isApiError } from '@/lib/api/errors';
import type { UiVenue } from '@/lib/api/adapters/venue';
import type { PaymentProvider } from '@/lib/api/types';

const STEPS = ['Xem lại', 'Thanh toán'] as const;
const HOLD_TTL_SECONDS = 600; // 10 phút — phải khớp BOOKING_HOLD_MINUTES backend

/** Parse `?slots=c1:18:00,19:00;c2:20:00` → { courtId, hours } cho court đầu tiên (Phase 2 chỉ hỗ trợ 1 court). */
function parseSlots(raw: string | null): { courtId: string; hours: string[] } | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  // Multiple courts có ';' phân tách. Lấy court đầu tiên.
  const [firstCourtBlock] = decoded.split(';');
  const [courtId, hoursStr] = firstCourtBlock.split(':');
  if (!courtId || !hoursStr) return null;
  const hours = hoursStr.split(',').filter(Boolean);
  if (hours.length === 0) return null;
  // Validate format HH:MM
  for (const h of hours) {
    if (!/^\d{2}:\d{2}$/.test(h)) return null;
  }
  return { courtId, hours: hours.sort() };
}

function toIso(date: string, hhmm: string): string {
  // Local date + time → ISO. Backend expect ISO (timezone của browser).
  // Vì venue ở VN, dùng giờ local (browser của VN user = UTC+7).
  return new Date(`${date}T${hhmm}:00`).toISOString();
}

function nextHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function BookingNewInner() {
  const router = useRouter();
  const params = useSearchParams();

  const venueId = params.get('venue') ?? '';
  const date = params.get('date') ?? new Date().toISOString().split('T')[0];
  const parsedSlots = useMemo(() => parseSlots(params.get('slots')), [params]);

  const [venue, setVenue] = useState<UiVenue | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoting, setQuoting] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [step, setStep] = useState<0 | 1>(0);
  const [method, setMethod] = useState<PaymentMethodKey>('vnpay');
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);

  // Countdown hold timer
  const [secondsLeft, setSecondsLeft] = useState(HOLD_TTL_SECONDS);
  const startTime = useRef<number | null>(null);

  // Fetch venue info + quote on mount
  useEffect(() => {
    if (!venueId || !parsedSlots) {
      setQuoteError('Thiếu thông tin sân hoặc khung giờ');
      setQuoting(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const v = await getVenue(venueId);
      if (cancelled) return;
      setVenue(v);

      if (USE_MOCK) {
        // Mock quote — không gọi API
        const subtotal = parsedSlots.hours.length * 350000;
        setQuote({
          courtId: parsedSlots.courtId,
          startsAt: toIso(date, parsedSlots.hours[0]),
          endsAt: toIso(date, nextHour(parsedSlots.hours[parsedSlots.hours.length - 1])),
          slots: parsedSlots.hours.map((h) => ({
            startsAt: toIso(date, h),
            endsAt: toIso(date, nextHour(h)),
            price: 350000,
          })),
          subtotal,
          discount: 0,
          total: subtotal,
          holdToken: 'mock-hold-token',
        });
        startTime.current = Date.now();
        setQuoting(false);
        return;
      }

      try {
        const startsAt = toIso(date, parsedSlots.hours[0]);
        const endsAt = toIso(date, nextHour(parsedSlots.hours[parsedSlots.hours.length - 1]));
        const q = await bookingsApi.quote({
          courtId: parsedSlots.courtId,
          startsAt,
          endsAt,
        });
        if (cancelled) return;
        setQuote(q);
        startTime.current = Date.now();
      } catch (e) {
        const msg = isApiError(e) ? e.message : 'Không thể báo giá';
        setQuoteError(msg);
      } finally {
        setQuoting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, date, parsedSlots?.courtId]);

  // Countdown
  useEffect(() => {
    if (!quote || !startTime.current) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime.current!) / 1000);
      setSecondsLeft(Math.max(0, HOLD_TTL_SECONDS - elapsed));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [quote]);

  // Auto redirect khi hết giờ
  useEffect(() => {
    if (secondsLeft === 0 && quote) {
      toast.error('Phiên giữ chỗ đã hết hạn. Quay lại chọn lại khung giờ.');
      router.replace(venueId ? `/venues/${venueId}` : '/');
    }
  }, [secondsLeft, quote, venueId, router]);

  async function handlePay() {
    if (!quote) return;
    setPaying(true);
    try {
      // Step 1: create booking from hold
      const booking = USE_MOCK
        ? { id: 'mock-booking-id', code: '20260547' }
        : await bookingsApi.create({ holdToken: quote.holdToken, notes: note });

      // Step 2: create payment
      const provider = method.toUpperCase() as PaymentProvider;
      const returnUrl = `${window.location.origin}/booking/result`;

      if (USE_MOCK) {
        // Mock: chuyển thẳng tới result success
        router.replace(`/booking/result?status=success&method=${method}&code=${booking.code}`);
        return;
      }

      const payment = await paymentsApi.create({
        bookingId: booking.id,
        provider,
        returnUrl,
      });

      if (payment.redirectUrl) {
        // VNPay / MoMo flow — full page redirect
        window.location.href = payment.redirectUrl;
        return;
      }
      if (payment.qrData) {
        // ZaloPay flow — đi tới result để render QR + poll
        router.replace(`/booking/result?paymentId=${payment.id}`);
        return;
      }
      // Edge case: provider trả về cả 2 đều null
      toast.error('Không lấy được link thanh toán');
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Thanh toán thất bại';
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  }

  if (quoting) {
    return (
      <>
        <Header />
        <main className="container py-12">
          <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Đang giữ chỗ và báo giá...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (quoteError || !quote || !venue) {
    return (
      <>
        <Header />
        <main className="container py-12">
          <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
            <p className="text-base font-semibold text-destructive">
              {quoteError ?? 'Không thể đặt sân'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng quay lại trang sân và chọn lại khung giờ.
            </p>
            <Button asChild className="mt-4">
              <Link href={venueId ? `/venues/${venueId}` : '/'}>
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const startHHmm = new Date(quote.startsAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const endHHmm = new Date(quote.endsAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const hoursCount = quote.slots.length;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <>
      <Header />

      <main className="container py-6 pb-16">
        <Link
          href={`/venues/${venue.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại trang sân
        </Link>

        {/* Stepper */}
        <div className="mt-4 flex items-center gap-3">
          {STEPS.map((label, idx) => {
            const active = idx === step;
            const done = idx < step;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                      done && 'bg-primary text-primary-foreground',
                      active && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      !done && !active && 'border bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : idx + 1}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      (active || done) ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && <span className="h-px w-8 bg-border md:w-16" />}
              </div>
            );
          })}
          <div
            className={cn(
              'ml-auto inline-flex items-center gap-1.5 text-xs',
              secondsLeft < 60 ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <Timer className="h-3.5 w-3.5 text-accent" />
            Giữ chỗ trong <span className="font-mono font-semibold">{timerStr}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* MAIN */}
          <div>
            {step === 0 ? (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Xem lại đặt sân</h1>

                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="flex gap-4 p-4">
                    {venue.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="h-24 w-32 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {venue.district}, {venue.city}
                      </p>
                      <Badge className="mt-2">Sân {parsedSlots!.courtId}</Badge>
                    </div>
                  </div>
                </div>

                <DetailRow
                  label="Ngày chơi"
                  value={new Date(date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                />
                <DetailRow label="Khung giờ" value={`${startHHmm} – ${endHHmm} (${hoursCount} giờ)`} />
                <DetailRow label="Đơn giá trung bình" value={`${formatVND(Math.round(quote.subtotal / hoursCount))}/h`} />

                <div>
                  <label className="text-sm font-medium">Ghi chú cho chủ sân (tuỳ chọn)</label>
                  <Textarea
                    placeholder="VD: Cần mượn thêm 2 chiếc vợt, đội 6 người..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 text-sm">
                  <p className="font-semibold">Chính sách huỷ</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Huỷ trước 24h: hoàn 100%</li>
                    <li>Huỷ trước 12h: hoàn 50%</li>
                    <li>Huỷ dưới 12h: không hoàn tiền</li>
                  </ul>
                </div>

                <Button size="lg" className="w-full md:w-auto" onClick={() => setStep(1)}>
                  Tiếp tục đến thanh toán <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chọn phương thức thanh toán</h1>
                <PaymentMethodPicker value={method} onChange={setMethod} />

                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
                    <div>
                      <p className="font-semibold text-foreground">Thanh toán bảo mật</p>
                      <p className="mt-1">
                        Bạn sẽ được chuyển sang trang của {method.toUpperCase()} để hoàn tất giao
                        dịch. Mọi thông tin được mã hoá đầu-cuối. Số tiền chính xác là{' '}
                        <span className="font-semibold text-foreground">{formatVND(quote.total)}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} disabled={paying}>
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                  </Button>
                  <Button size="lg" className="flex-1" onClick={handlePay} disabled={paying}>
                    {paying ? (
                      'Đang tạo giao dịch...'
                    ) : (
                      <>
                        Thanh toán {formatVND(quote.total)} <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <aside>
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="font-bold">Tóm tắt</h3>

              <dl className="mt-4 space-y-2 text-sm">
                <SummaryRow label="Sân" value={parsedSlots!.courtId} />
                <SummaryRow
                  label="Thời gian"
                  value={`${new Date(date).toLocaleDateString('vi-VN')} · ${startHHmm}–${endHHmm}`}
                />
                <SummaryRow label="Số giờ" value={`${hoursCount} giờ`} />
              </dl>

              <div className="my-4 border-t" />

              <div className="space-y-1.5 text-sm">
                <SummaryRow label="Tạm tính" value={formatVND(quote.subtotal)} />
                {quote.discount > 0 && (
                  <SummaryRow
                    label={`Giảm giá${quote.voucherCode ? ` (${quote.voucherCode})` : ''}`}
                    value={`−${formatVND(quote.discount)}`}
                    highlight
                  />
                )}
              </div>

              <div className="my-4 border-t" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{formatVND(quote.total)}</span>
              </div>

              <div
                className={cn(
                  'mt-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
                  secondsLeft < 60
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Giữ chỗ sẽ hết hạn sau {timerStr}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function BookingNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <BookingNewInner />
    </Suspense>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-medium', highlight && 'text-success')}>{value}</dd>
    </div>
  );
}
