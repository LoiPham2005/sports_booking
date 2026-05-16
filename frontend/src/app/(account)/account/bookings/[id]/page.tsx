'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, QrCode, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABEL } from '@/lib/api/adapters/status';
import { formatDateLong, formatTime, formatVND } from '@/lib/format';
import { getMyBooking, cancelBooking } from '@/lib/data/bookings';
import { isApiError } from '@/lib/api/errors';
import type { UiBooking } from '@/lib/api/adapters/booking';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [b, setBooking] = useState<UiBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const x = await getMyBooking(params.id);
      if (cancelled) return;
      setBooking(x);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleCancel() {
    if (!b) return;
    setCancelling(true);
    try {
      await cancelBooking(b.id);
      toast.success('Đã huỷ booking');
      setConfirmOpen(false);
      // Refetch để cập nhật status + refund amount
      const updated = await getMyBooking(b.id);
      setBooking(updated);
      router.refresh();
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Huỷ booking thất bại';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-xl border bg-muted/30" />
        <div className="h-60 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    );
  }

  if (!b) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-8 text-center">
        <p className="text-base font-semibold">Không tìm thấy booking</p>
        <Button asChild variant="outline">
          <Link href="/account/bookings">Về danh sách</Link>
        </Button>
      </div>
    );
  }

  const status = STATUS_LABEL[b.status];
  const isUpcoming = b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT';
  const canCancel = isUpcoming;

  return (
    <div className="space-y-6">
      <Link
        href="/account/bookings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="bg-gradient-to-r from-primary/10 to-emerald-100 px-6 py-5 dark:to-emerald-950/30">
          <p className="font-mono text-xs text-muted-foreground">MÃ ĐẶT SÂN</p>
          <p className="text-2xl font-bold tracking-widest">{b.code}</p>
          <Badge variant={status.tone as never} className="mt-2">
            {status.text}
          </Badge>
        </div>

        <div className="flex flex-col gap-5 p-6 md:flex-row">
          {b.venue.image && (
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg md:h-32 md:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.venue.image} alt={b.venue.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{b.venue.name}</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {b.venue.address}, {b.venue.district},{' '}
              {b.venue.city}
            </p>
            {b.venue.phone && (
              <Button asChild variant="link" className="mt-1 h-auto p-0">
                <a href={`tel:${b.venue.phone.replace(/\s/g, '')}`}>
                  <Phone className="h-3.5 w-3.5" /> {b.venue.phone}
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3">
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="Ngày & giờ">
            {formatDateLong(b.startsAt)}
            <span className="block text-xs text-muted-foreground">
              {formatTime(b.startsAt)} – {formatTime(b.endsAt)}
            </span>
          </InfoTile>
          <InfoTile label="Sân">{b.courtName}</InfoTile>
          <InfoTile label="Tổng tiền" highlight>
            {formatVND(b.total)}
            {b.refundAmount != null && b.refundAmount > 0 && (
              <span className="block text-xs font-normal text-success">
                Đã hoàn {formatVND(b.refundAmount)}
              </span>
            )}
          </InfoTile>
        </div>
      </div>

      {b.status === 'CONFIRMED' && (
        <div className="grid items-center gap-6 rounded-xl border bg-card p-6 md:grid-cols-[200px_1fr]">
          <div className="mx-auto grid h-48 w-48 place-items-center rounded-lg border-4 border-primary/10 bg-white p-3">
            <QrCode className="h-32 w-32" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Mã QR check-in</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Đưa mã này cho nhân viên tại sân để check-in. Mã chỉ dùng được 1 lần và sẽ hết hạn sau
              giờ chơi.
            </p>
            {b.checkInToken && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                Token: {b.checkInToken.slice(0, 8)}...
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline">Tải mã QR</Button>
              <Button variant="ghost">Gửi tới email</Button>
            </div>
          </div>
        </div>
      )}

      {b.cancelReason && (
        <div className="rounded-xl border bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-destructive">Lý do huỷ</p>
          <p className="mt-1 text-muted-foreground">{b.cancelReason}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {b.status === 'COMPLETED' && (
          <Button>
            <Star className="h-4 w-4" /> Đánh giá sân
          </Button>
        )}
        {canCancel &&
          (confirmOpen ? (
            <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border bg-destructive/5 p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Xác nhận huỷ booking?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hoàn tiền theo chính sách: trước 24h hoàn 100%, 12-24h hoàn 50%, dưới 12h không
                  hoàn.
                </p>
              </div>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={cancelling}>
                Đóng
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Đang huỷ...' : 'Huỷ booking'}
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Huỷ booking
            </Button>
          ))}
        <Button variant="outline">Tải hoá đơn</Button>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  children,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 ${highlight ? 'text-xl font-bold text-primary' : 'text-base font-semibold'}`}
      >
        {children}
      </div>
    </div>
  );
}
