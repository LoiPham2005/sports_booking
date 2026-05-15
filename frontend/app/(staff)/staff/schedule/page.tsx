import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { formatVND } from '@/lib/format';

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);

const SCHEDULE = [
  { hour: '07:00', booked: true, customer: 'Trần Minh', court: 'Sân 1', status: 'COMPLETED' },
  { hour: '08:00', booked: true, customer: 'Saigon FC', court: 'Sân 1', status: 'COMPLETED' },
  { hour: '09:00', booked: true, customer: 'Saigon FC', court: 'Sân 1', status: 'COMPLETED' },
  { hour: '16:00', booked: true, customer: 'Lê Hà', court: 'Sân VIP', status: 'CONFIRMED' },
  { hour: '17:00', booked: true, customer: 'Lê Hà', court: 'Sân VIP', status: 'CONFIRMED' },
  { hour: '18:00', booked: true, customer: 'Đức Phạm', court: 'Sân 2', status: 'CONFIRMED' },
  { hour: '19:00', booked: true, customer: 'Đức Phạm', court: 'Sân 2', status: 'CONFIRMED' },
  { hour: '20:00', booked: true, customer: 'Nguyễn An', court: 'Sân VIP', status: 'PENDING_PAYMENT' },
];

export default function StaffSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sân</h1>
          <p className="text-sm text-muted-foreground">Xem booking theo ngày</p>
        </div>

        <div className="flex items-center gap-1 rounded-md border bg-card p-1">
          <Button size="sm" variant="ghost">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-44 border-0" />
          <Button size="sm" variant="ghost">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Giờ</th>
              <th className="px-4 py-3 text-left font-medium">Sân</th>
              <th className="px-4 py-3 text-left font-medium">Khách</th>
              <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => {
              const slot = SCHEDULE.find((s) => s.hour === h);
              if (!slot) {
                return (
                  <tr key={h} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{h}</td>
                    <td className="px-4 py-3 text-muted-foreground" colSpan={4}>
                      Còn trống
                    </td>
                  </tr>
                );
              }
              const isPast = slot.status === 'COMPLETED';
              return (
                <tr key={h} className={`border-b last:border-0 ${isPast ? 'opacity-60' : 'hover:bg-muted/30'}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{h}</td>
                  <td className="px-4 py-3">{slot.court}</td>
                  <td className="px-4 py-3 font-medium">{slot.customer}</td>
                  <td className="px-4 py-3 text-center">
                    {slot.status === 'COMPLETED' && (
                      <Badge variant="muted">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Hoàn thành
                      </Badge>
                    )}
                    {slot.status === 'CONFIRMED' && (
                      <Badge variant="success">Sẵn sàng</Badge>
                    )}
                    {slot.status === 'PENDING_PAYMENT' && (
                      <Badge variant="warning">
                        <Clock className="mr-1 h-3 w-3" />
                        Chờ TT
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/staff/bookings/t3"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Chi tiết →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Doanh thu hôm nay (tính tới hiện tại): <span className="font-bold text-foreground">{formatVND(2_400_000)}</span>
      </p>
    </div>
  );
}
