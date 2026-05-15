import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DATES = ['12', '13', '14', '15', '16', '17', '18'];

type Cell = {
  day: number;
  hour: number;
  status: 'available' | 'booked' | 'pending' | 'past';
  name?: string;
};

const SAMPLE_BOOKINGS: Cell[] = [
  { day: 0, hour: 18, status: 'booked', name: 'Trần Minh' },
  { day: 0, hour: 19, status: 'booked', name: 'Trần Minh' },
  { day: 1, hour: 7, status: 'booked', name: 'Khách quen' },
  { day: 2, hour: 17, status: 'pending', name: 'A. Phạm' },
  { day: 3, hour: 19, status: 'booked', name: 'Đội Saigon FC' },
  { day: 3, hour: 20, status: 'booked', name: 'Đội Saigon FC' },
  { day: 4, hour: 18, status: 'booked', name: 'Lê Hà' },
  { day: 5, hour: 16, status: 'booked', name: 'A. Bình' },
  { day: 6, hour: 9, status: 'booked', name: 'Gia đình' },
];

export default function OwnerBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch booking</h1>
          <p className="text-sm text-muted-foreground">Tuần này · Sân cầu lông VIP — Sân 1</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border bg-card p-1">
          <Button size="sm" variant="ghost" aria-label="Tuần trước">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            Tuần này
          </Button>
          <Button size="sm" variant="ghost" aria-label="Tuần sau">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="w-16 px-3 py-2 text-left text-xs font-medium text-muted-foreground"></th>
                {DAYS.map((d, i) => (
                  <th key={d} className="px-3 py-2 text-center text-xs font-medium">
                    <div className="text-muted-foreground">{d}</div>
                    <div className={cn('text-base font-semibold', i === 3 && 'text-primary')}>
                      {DATES[i]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h, hi) => (
                <tr key={h} className="border-b last:border-0">
                  <td className="px-3 py-1 text-xs font-mono text-muted-foreground">{h}</td>
                  {DAYS.map((_, di) => {
                    const cell = SAMPLE_BOOKINGS.find((b) => b.day === di && b.hour - 6 === hi);
                    return (
                      <td key={di} className="p-1">
                        <div
                          className={cn(
                            'h-10 rounded-md border text-[11px]',
                            !cell && 'border-dashed border-border bg-muted/20 hover:bg-primary/5',
                            cell?.status === 'booked' && 'border-primary/50 bg-primary/15 text-primary',
                            cell?.status === 'pending' && 'border-warning/40 bg-warning/15 text-amber-700',
                          )}
                        >
                          {cell?.name && (
                            <div className="flex h-full items-center justify-center px-2 font-medium">
                              {cell.name}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary/15 ring-1 ring-primary/50" /> Đã xác nhận
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning/15 ring-1 ring-warning/40" /> Chờ thanh toán
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-dashed bg-muted/20" /> Còn trống
        </span>
      </div>
    </div>
  );
}
