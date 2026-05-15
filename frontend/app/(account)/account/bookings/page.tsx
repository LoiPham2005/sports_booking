'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, ChevronRight, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_LABEL } from '@/lib/api/adapters/status';
import { formatVND } from '@/lib/format';
import { listMyBookings } from '@/lib/data/bookings';
import type { UiBooking } from '@/lib/api/adapters/booking';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listMyBookings()
      .then((list) => {
        if (!cancelled) setBookings(list);
      })
      .catch(() => {
        if (!cancelled) setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = bookings.filter((b) =>
    (['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN'] as const).includes(b.status as never),
  );
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelled = bookings.filter(
    (b) => b.status === 'CANCELLED' || b.status === 'NO_SHOW' || b.status === 'REFUNDED',
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Booking của tôi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Theo dõi và quản lý các lượt đặt sân</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Sắp tới ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành ({completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Đã huỷ ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length === 0 ? (
              <EmptyState />
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Chưa có booking hoàn thành
              </p>
            ) : (
              completed.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            {cancelled.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Chưa có booking đã huỷ
              </p>
            ) : (
              cancelled.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: UiBooking }) {
  const status = STATUS_LABEL[booking.status];
  const tone = status.tone as 'success' | 'warning' | 'destructive' | 'muted' | 'default';
  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);

  return (
    <article className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 md:flex-row">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg md:h-28 md:w-40">
          {booking.venue.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.venue.image}
              alt={booking.venue.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-muted-foreground">#{booking.code}</p>
              <h3 className="text-base font-semibold leading-tight">{booking.venue.name}</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {booking.venue.district}, {booking.venue.city}
              </p>
            </div>
            <Badge variant={tone as never}>{status.text}</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{booking.courtName}</p>
              <p className="text-base font-bold text-primary">{formatVND(booking.total)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {booking.status === 'PENDING_PAYMENT' && (
              <Button size="sm" asChild>
                <Link href={`/account/bookings/${booking.id}`}>Thanh toán tiếp</Link>
              </Button>
            )}
            {booking.status === 'CONFIRMED' && (
              <Button size="sm" asChild>
                <Link href={`/account/bookings/${booking.id}`}>Mã QR check-in</Link>
              </Button>
            )}
            {booking.status === 'COMPLETED' && (
              <Button size="sm" variant="outline">
                <Star className="h-4 w-4" /> Đánh giá
              </Button>
            )}
            <Button size="sm" variant="ghost" asChild className="ml-auto">
              <Link href={`/account/bookings/${booking.id}`}>
                Chi tiết <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-12 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-3xl">
        🎾
      </div>
      <h3 className="mt-4 text-lg font-semibold">Chưa có booking nào</h3>
      <p className="mt-1 text-sm text-muted-foreground">Khám phá sân và đặt ngay hôm nay!</p>
      <Button className="mt-4" asChild>
        <Link href="/venues">Khám phá sân</Link>
      </Button>
    </div>
  );
}
