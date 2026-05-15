import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Phone, QrCode, CheckCircle, Sticky } from 'lucide-react';
import { formatVND } from '@/lib/format';

export default function StaffBookingDetailPage({ params }: { params: { id: string } }) {
  const b = {
    code: '20260549',
    customer: 'Lê Hà',
    phone: '+84 905 555 333',
    venue: 'Sân bóng đá Phú Mỹ Hưng',
    venueAddress: '123 Nguyễn Văn Linh, Quận 7',
    court: 'Sân VIP',
    surface: 'Cỏ nhân tạo · 14 người',
    date: 'Hôm nay',
    startsAt: '16:00',
    endsAt: '18:00',
    total: 1_000_000,
    status: 'CONFIRMED' as const,
    paid: true,
    notes: 'Cần mượn thêm 2 chiếc vợt, đội 6 người.',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại lịch hôm nay
      </Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-emerald-100/50 p-6 dark:to-emerald-950/30">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Mã đặt sân
          </p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-2xl font-bold tracking-widest">{b.code}</p>
            <Badge variant="success">Sẵn sàng check-in</Badge>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-4 border-t p-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{b.customer[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-lg font-bold">{b.customer}</p>
            <p className="text-sm text-muted-foreground">{b.phone}</p>
          </div>
          <Button variant="outline" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Detail rows */}
      <Card>
        <InfoRow icon={Calendar} title={`${b.date} · ${b.startsAt} – ${b.endsAt}`} subtitle="2 giờ" />
        <InfoRow icon={MapPin} title={`${b.court}`} subtitle={b.surface} />
        <InfoRow
          icon={() => <span className="text-lg">💳</span>}
          title={formatVND(b.total)}
          subtitle={b.paid ? 'Đã thanh toán qua VNPay' : 'Chờ thanh toán'}
          highlight
        />
      </Card>

      {b.notes && (
        <Card className="bg-muted/30 p-4">
          <div className="flex gap-3">
            <Sticky className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Ghi chú từ khách</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.notes}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" variant="outline">
          <CheckCircle className="h-4 w-4" /> Đánh dấu no-show
        </Button>
        <Button size="lg">
          <QrCode className="h-4 w-4" /> Quét QR check-in
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
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
