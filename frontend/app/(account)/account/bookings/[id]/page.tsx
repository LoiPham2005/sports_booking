import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, QrCode, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BOOKINGS, STATUS_LABEL } from '@/lib/mock-data';
import { formatDateLong, formatTime, formatVND } from '@/lib/format';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const b = BOOKINGS.find((x) => x.id === params.id);
  if (!b) notFound();
  const status = STATUS_LABEL[b.status];

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
          <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg md:h-32 md:w-48">
            <Image src={b.venue.image} alt={b.venue.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{b.venue.name}</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {b.venue.address}, {b.venue.district}, {b.venue.city}
            </p>
            <Button asChild variant="link" className="mt-1 h-auto p-0">
              <a href="tel:0901234567">
                <Phone className="h-3.5 w-3.5" /> 0901 234 567
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3">
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="Ngày & giờ">
            {formatDateLong(b.startsAt)}
            <span className="block text-xs text-muted-foreground">
              {formatTime(b.startsAt)} – {formatTime(b.endsAt)}
            </span>
          </InfoTile>
          <InfoTile label="Sân">
            {b.courtName}
            <span className="block text-xs text-muted-foreground">Cỏ nhân tạo · 10 người</span>
          </InfoTile>
          <InfoTile label="Tổng tiền" highlight>
            {formatVND(b.total)}
            <span className="block text-xs font-normal text-muted-foreground">Đã thanh toán qua VNPay</span>
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
            <div className="mt-4 flex gap-2">
              <Button variant="outline">Tải mã QR</Button>
              <Button variant="ghost">Gửi tới email</Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-bold">Lịch sử trạng thái</h3>
        <ol className="mt-4 space-y-3">
          {[
            { time: '12:30', label: 'Tạo booking', done: true },
            { time: '12:32', label: 'Thanh toán thành công qua VNPay', done: true },
            { time: '—', label: 'Đã đặt giờ, đợi check-in', done: false, current: true },
            { time: '—', label: 'Hoàn thành', done: false },
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className={`mt-0.5 h-3 w-3 rounded-full ${
                  s.done ? 'bg-success' : s.current ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{s.label}</p>
              </div>
              <span className="text-xs text-muted-foreground">{s.time}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        {b.status === 'COMPLETED' && (
          <Button>
            <Star className="h-4 w-4" /> Đánh giá sân
          </Button>
        )}
        {(b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED') && (
          <Button variant="destructive">Huỷ booking</Button>
        )}
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
      <div className={`mt-1 ${highlight ? 'text-xl font-bold text-primary' : 'text-base font-semibold'}`}>
        {children}
      </div>
    </div>
  );
}
