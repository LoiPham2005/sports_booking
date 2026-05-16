'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Tag,
  Wallet,
  ChevronRight as ArrowRight,
  ArrowLeftRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvailability } from '@/lib/data/venues';
import type {
  AvailabilityResponse,
  AvailabilityCourt,
  CellStatus,
} from '@/lib/api/endpoints/venues';
import type { UiVenue } from '@/lib/api/adapters/venue';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';

type Axis = 'time-rows' | 'court-rows';

interface SlotKey {
  courtId: string;
  hour: string;
}
const slotKey = (k: SlotKey) => `${k.courtId}__${k.hour}`;

export function BookingMatrix({ venue }: { venue: UiVenue }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selected, setSelected] = useState<Record<string, SlotKey & { price: number }>>({});
  const [voucher, setVoucher] = useState('');
  const [axis, setAxis] = useState<Axis>('time-rows');
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAvailability(venue.id, date)
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setData(null))
      .finally(() => !cancelled && setLoading(false));
    // Khi đổi ngày — clear selection để tránh slot không hợp lệ
    setSelected({});
    return () => {
      cancelled = true;
    };
  }, [venue.id, date]);

  const courts: AvailabilityCourt[] = data?.courts ?? [];

  // Union các giờ unique từ tất cả courts (cells khác nhau theo slotDurationMinutes của court)
  const allHours = useMemo(() => {
    const set = new Set<string>();
    for (const c of courts) for (const cell of c.cells) set.add(cell.hour);
    return Array.from(set).sort();
  }, [courts]);

  function cellOf(courtId: string, hour: string) {
    const court = courts.find((c) => c.id === courtId);
    return court?.cells.find((cell) => cell.hour === hour);
  }

  const selectedList = Object.values(selected);
  const subtotal = useMemo(
    () => selectedList.reduce((sum, s) => sum + s.price, 0),
    [selectedList],
  );
  const discount =
    voucher.trim().toLowerCase() === 'sport20' ? Math.min(subtotal * 0.2, 50_000) : 0;
  const total = Math.max(0, subtotal - discount);

  function toggle(courtId: string, hour: string) {
    const cell = cellOf(courtId, hour);
    if (!cell || cell.status !== 'available') return;
    const key = slotKey({ courtId, hour });
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { courtId, hour, price: cell.price };
      return next;
    });
  }

  function shiftDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  }

  const queryString = useMemo(() => {
    const slotsByCourt: Record<string, string[]> = {};
    for (const s of selectedList) {
      if (!slotsByCourt[s.courtId]) slotsByCourt[s.courtId] = [];
      slotsByCourt[s.courtId].push(s.hour);
    }
    return Object.entries(slotsByCourt)
      .map(([c, hours]) => `${c}:${hours.sort().join(',')}`)
      .join(';');
  }, [selectedList]);

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="text-lg font-bold">Đặt sân</h2>
          <p className="text-xs text-muted-foreground">
            Chọn 1 hoặc nhiều ô còn trống · giữ chỗ 10 phút sau khi xác nhận
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAxis(axis === 'time-rows' ? 'court-rows' : 'time-rows')}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">
              {axis === 'time-rows' ? 'Giờ ↓ · Sân →' : 'Sân ↓ · Giờ →'}
            </span>
          </Button>

          <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Ngày trước">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-auto w-36 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => shiftDate(1)} aria-label="Ngày sau">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b bg-muted/30 px-4 py-2 text-xs">
        <LegendDot label="Còn trống" className="border bg-background" />
        <LegendDot label="Đã chọn" className="bg-primary" />
        <LegendDot label="Đang giữ chỗ" className="bg-warning/40 border border-warning/60" />
        <LegendDot label="Đã đặt" className="bg-muted text-muted-foreground" />
        <LegendDot label="Đóng cửa" className="bg-muted/50 text-muted-foreground" />
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto p-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải lịch sân...
          </div>
        ) : courts.length === 0 || allHours.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Sân chưa có lịch / chưa cấu hình giờ mở cửa cho ngày này.
          </div>
        ) : axis === 'time-rows' ? (
          <table className="min-w-full border-separate" style={{ borderSpacing: 4 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-20 bg-card pr-2 text-left">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Giờ</span>
                </th>
                {courts.map((c) => (
                  <th key={c.id} className="min-w-[110px] px-1">
                    <div className="rounded-md bg-muted/50 px-2 py-2 text-center">
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {minPrice(c) > 0 ? `${formatVND(minPrice(c))}/h` : '—'}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allHours.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 z-10 bg-card pr-2 align-middle">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {hour}
                    </span>
                  </td>
                  {courts.map((c) => {
                    const cell = c.cells.find((cl) => cl.hour === hour);
                    return (
                      <td key={c.id + hour} className="px-1 py-1">
                        <Cell
                          cell={cell}
                          selected={!!selected[slotKey({ courtId: c.id, hour })]}
                          onToggle={() => toggle(c.id, hour)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border-separate" style={{ borderSpacing: 4 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-32 bg-card pr-2 text-left">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Sân</span>
                </th>
                {allHours.map((h) => (
                  <th key={h} className="min-w-[110px] px-1">
                    <div className="rounded-md bg-muted/50 px-2 py-2 text-center">
                      <p className="font-mono text-xs font-bold">{h}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courts.map((c) => (
                <tr key={c.id}>
                  <td className="sticky left-0 z-10 w-32 bg-card pr-2 align-middle">
                    <div>
                      <p className="text-sm font-bold leading-tight">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {minPrice(c) > 0 ? `${formatVND(minPrice(c))}/h` : '—'}
                      </p>
                    </div>
                  </td>
                  {allHours.map((hour) => {
                    const cell = c.cells.find((cl) => cl.hour === hour);
                    return (
                      <td key={c.id + hour} className="px-1 py-1">
                        <Cell
                          cell={cell}
                          selected={!!selected[slotKey({ courtId: c.id, hour })]}
                          onToggle={() => toggle(c.id, hour)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Selected slots chips */}
      {selectedList.length > 0 && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Đã chọn ({selectedList.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedList
              .slice()
              .sort((a, b) => (a.courtId + a.hour).localeCompare(b.courtId + b.hour))
              .map((s) => {
                const court = courts.find((c) => c.id === s.courtId);
                return (
                  <button
                    key={slotKey(s)}
                    type="button"
                    onClick={() => toggle(s.courtId, s.hour)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                  >
                    {court?.name} · {s.hour}
                    <span className="ml-1">×</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Voucher + Summary + CTA */}
      <div className="border-t p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="h-3.5 w-3.5" /> Mã giảm giá
            </label>
            <Input
              placeholder="Nhập mã (vd: SPORT20)"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="md:max-w-xs"
            />
          </div>

          <div className="space-y-2 rounded-lg bg-muted/40 p-4 md:min-w-[280px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính ({selectedList.length} slot)</span>
              <span className="font-medium">{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Giảm giá</span>
                <span className="font-medium">−{formatVND(discount)}</span>
              </div>
            )}
            <div className="flex items-end justify-between border-t pt-2">
              <span className="text-sm font-semibold">Tổng cộng</span>
              <span className="text-xl font-bold text-primary">{formatVND(total)}</span>
            </div>
          </div>
        </div>

        <Button
          asChild={selectedList.length > 0}
          size="lg"
          className="mt-4 w-full"
          disabled={selectedList.length === 0}
        >
          {selectedList.length > 0 ? (
            <Link href={`/booking/new?venue=${venue.id}&date=${date}&slots=${encodeURIComponent(queryString)}`}>
              <Wallet className="h-4 w-4" />
              Tiếp tục thanh toán
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <Wallet className="h-4 w-4" />
              Chọn ít nhất 1 ô để tiếp tục
            </span>
          )}
        </Button>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Bằng cách đặt sân, bạn đồng ý với <a className="underline" href="#">Điều khoản</a> và{' '}
          <a className="underline" href="#">Chính sách huỷ</a>.
        </p>
      </div>
    </div>
  );
}

function minPrice(c: AvailabilityCourt): number {
  let min = Infinity;
  for (const cell of c.cells) {
    if (cell.price > 0 && cell.price < min) min = cell.price;
  }
  return min === Infinity ? 0 : min;
}

function Cell({
  cell,
  selected,
  onToggle,
}: {
  cell: { hour: string; price: number; status: CellStatus } | undefined;
  selected: boolean;
  onToggle: () => void;
}) {
  if (!cell) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-md border bg-muted/40 px-2 py-2.5 text-xs font-semibold text-muted-foreground"
      >
        —
      </button>
    );
  }

  let cellClass = '';
  let cellText: string;
  let disabled = false;
  if (selected) {
    cellClass = 'bg-primary text-primary-foreground border-primary shadow-sm';
    cellText = '✓ Chọn';
  } else if (cell.status === 'booked') {
    cellClass = 'bg-muted text-muted-foreground cursor-not-allowed border-transparent line-through';
    cellText = 'Đã đặt';
    disabled = true;
  } else if (cell.status === 'held') {
    cellClass = 'bg-warning/15 text-amber-700 border-warning/40 dark:text-amber-300';
    cellText = 'Đang giữ';
    disabled = true;
  } else if (cell.status === 'closed') {
    cellClass = 'bg-muted/40 text-muted-foreground/60 cursor-not-allowed border-transparent';
    cellText = 'Đóng';
    disabled = true;
  } else {
    cellClass = 'bg-background hover:border-primary hover:bg-primary/5 border';
    cellText = cell.price > 0 ? formatVND(cell.price) : '—';
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border px-2 py-2.5 text-xs font-semibold transition-all',
        cellClass,
      )}
    >
      {cellText}
    </button>
  );
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-3 w-5 rounded', className)} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
