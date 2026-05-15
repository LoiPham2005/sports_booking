'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Phone, QrCode, StickyNote } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { bookingsApi } from '@/lib/api/endpoints/bookings';
import { checkInBooking } from '@/lib/data/staff';
import { isApiError } from '@/lib/api/errors';
import { USE_MOCK } from '@/lib/api/config';
import { STATUS_LABEL } from '@/lib/api/adapters/status';
import type { UiBooking } from '@/lib/api/adapters/booking';

export default function StaffBookingDetailPage({ params }: { params: { id: string } }) {
  const [b, setBooking] = useState<UiBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      // Mock: tạo data từ ID
      setBooking({
        id: params.id,
        code: '20260549',
        venue: {
          id: 'v1',
          name: 'Sân bóng đá Phú Mỹ Hưng',
          slug: 'pmh',
          address: '123 Nguyễn Văn Linh',
          city: 'TP.HCM',
          district: 'Q7',
          sports: ['football_5'],
          priceFrom: 350_000,
          rating: 4.7,
          reviewCount: 120,
          distance: 0,
          image: '',
          amenities: [],
          phone: '+84 905 555 333',
        },
        courtName: 'Sân VIP',
        startsAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
        endsAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
        total: 1_000_000,
        status: 'CONFIRMED',
        notes: 'Cần mượn thêm 2 chiếc vợt, đội 6 người.',
        checkInToken: 'mock-token',
      });
      setLoading(false);
      return;
    }
    let cancelled = false;
    bookingsApi
      .detail(params.id)
      .then((data) => !cancelled && setBooking(data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleCheckIn() {
    if (!b) return;
    const token = b.checkInToken ?? b.code;
    setChecking(true);
    try {
      await checkInBooking(token);
      toast.success('Đã check-in');
      setBooking((prev) => (prev ? { ...prev, status: 'CHECKED_IN' } : prev));
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Check-in thất bại');
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }
  if (!b) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold">Không tìm thấy booking</p>
        <Button asChild className="mt-4">
          <Link href="/staff">Về lịch hôm nay</Link>
        </Button>
      </div>
    );
  }

  const start = new Date(b.startsAt);
  const end = new Date(b.endsAt);
  const status = STATUS_LABEL[b.status];
  const hours = Math.round((end.getTime() - start.getTime()) / 3600_000);
  const canCheckIn = b.status === 'CONFIRMED';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại lịch hôm nay
      </Link>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-emerald-100/50 p-6 dark:to-emerald-950/30">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Mã đặt sân
          </p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-2xl font-bold tracking-widest">{b.code}</p>
            <Badge variant={status.tone as never}>{status.text}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t p-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{b.venue.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-lg font-bold">{b.venue.name}</p>
            <p className="text-sm text-muted-foreground">
              {b.venue.address}, {b.venue.district}
            </p>
          </div>
          {b.venue.phone && (
            <Button asChild variant="outline" size="icon">
              <a href={`tel:${b.venue.phone.replace(/\s/g, '')}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <InfoRow
          icon={Calendar}
          title={`${start.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })} · ${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
          subtitle={`${hours} giờ`}
        />
        <InfoRow icon={MapPin} title={b.courtName} subtitle="" />
        <InfoRow
          icon={() => <span className="text-lg">💳</span>}
          title={formatVND(b.total)}
          subtitle={b.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' : 'Đã thanh toán'}
          highlight
        />
      </Card>

      {b.notes && (
        <Card className="bg-muted/30 p-4">
          <div className="flex gap-3">
            <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Ghi chú từ khách</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.notes}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" variant="outline" disabled>
          Đánh dấu no-show
        </Button>
        <Button size="lg" onClick={handleCheckIn} disabled={!canCheckIn || checking}>
          <QrCode className="h-4 w-4" /> {checking ? 'Đang check-in...' : 'Check-in'}
        </Button>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  subtitle,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }> | (() => React.ReactNode);
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b p-5 last:border-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={highlight ? 'text-lg font-bold text-primary' : 'font-semibold'}>{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
