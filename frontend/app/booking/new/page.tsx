'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, ShieldCheck, Timer } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VENUES, COURTS } from '@/lib/mock-data';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PaymentMethodPicker, type PaymentMethodKey } from '@/components/booking/payment-method';

const STEPS = ['Xem lại', 'Thanh toán'] as const;

export default function BookingNewPage() {
  const router = useRouter();
  const params = useSearchParams();

  const venueId = params.get('venue') ?? 'v1';
  const courtId = params.get('court') ?? 'c1';
  const date = params.get('date') ?? new Date().toISOString().split('T')[0];
  const slotsRaw = params.get('slots') ?? '';
  const slots = slotsRaw ? slotsRaw.split(',') : ['18:00', '19:00'];

  const venue = VENUES.find((v) => v.id === venueId) ?? VENUES[0];
  const court = COURTS.find((c) => c.id === courtId) ?? COURTS[0];
  const subtotal = slots.length * court.pricePerHour;
  const discount = 0;
  const total = subtotal - discount;

  const [step, setStep] = useState<0 | 1>(0);
  const [method, setMethod] = useState<PaymentMethodKey>('vnpay');
  const [note, setNote] = useState('');

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
                {idx < STEPS.length - 1 && (
                  <span className="h-px w-8 bg-border md:w-16" />
                )}
              </div>
            );
          })}
          <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-accent" />
            Giữ chỗ trong <span className="font-semibold text-foreground">09:43</span>
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
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                      <Image src={venue.image} alt={venue.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {venue.district}, {venue.city}
                      </p>
                      <Badge className="mt-2">{court.name} · Cỏ nhân tạo</Badge>
                    </div>
                  </div>
                </div>

                <DetailRow label="Ngày chơi" value={new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} />
                <DetailRow label="Khung giờ" value={`${slots[0]} – ${addHour(slots[slots.length - 1])} (${slots.length} giờ)`} />
                <DetailRow label="Sân" value={`${court.name} · ${formatVND(court.pricePerHour)}/h`} />

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
                        <span className="font-semibold text-foreground">{formatVND(total)}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => router.push(`/booking/result?status=success&method=${method}`)}
                  >
                    Thanh toán {formatVND(total)} <ChevronRight className="h-4 w-4" />
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
                <SummaryRow label="Sân" value={`${court.name}`} />
                <SummaryRow
                  label="Thời gian"
                  value={`${new Date(date).toLocaleDateString('vi-VN')} · ${slots[0]}–${addHour(slots[slots.length - 1])}`}
                />
                <SummaryRow label="Số giờ" value={`${slots.length} giờ`} />
                <SummaryRow label="Đơn giá" value={formatVND(court.pricePerHour) + '/h'} />
              </dl>

              <div className="my-4 border-t" />

              <div className="space-y-1.5 text-sm">
                <SummaryRow label="Tạm tính" value={formatVND(subtotal)} />
                {discount > 0 && (
                  <SummaryRow label="Giảm giá" value={`−${formatVND(discount)}`} highlight />
                )}
              </div>

              <div className="my-4 border-t" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{formatVND(total)}</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                Giữ chỗ sẽ hết hạn sau 10 phút
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
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

function addHour(time: string): string {
  const [h, m] = time.split(':');
  return `${String(parseInt(h, 10) + 1).padStart(2, '0')}:${m}`;
}
