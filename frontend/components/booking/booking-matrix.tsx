'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Tag, Wallet, ChevronRight as ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COURTS, TIME_SLOTS, mockCellStatus, type Venue, type CellStatus } from '@/lib/mock-data';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';

interface SlotKey {
  courtId: string;
  hour: string;
}

const slotKey = (k: SlotKey) => `${k.courtId}__${k.hour}`;

type Axis = 'time-rows' | 'court-rows';

export function BookingMatrix({ venue }: { venue: Venue }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selected, setSelected] = useState<Record<string, SlotKey>>({});
  const [voucher, setVoucher] = useState('');
  const [axis, setAxis] = useState<Axis>('time-rows');

  const selectedList = Object.values(selected);

  const subtotal = useMemo(() => {
    return selectedList.reduce((sum, s) => {
      const court = COURTS.find((c) => c.id === s.courtId);
      return sum + (court?.pricePerHour ?? 0);
    }, 0);
  }, [selectedList]);

  const discount =
    voucher.trim().toLowerCase() === 'sport20'
      ? Math.min(subtotal * 0.2, 50_000)
      : 0;
  const total = Math.max(0, subtotal - discount);

  function toggle(courtId: string, hour: string, status: CellStatus) {
    if (status !== 'available') return;
    const key = slotKey({ courtId, hour });
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { courtId, hour };
      return next;
    });
  }

  function shiftDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  }

  // For URL query
  const queryString = useMemo(() => {
    const slotsByCourt: Record<string, string[]> = {};
    for (const s of selectedList) {
      if (!slotsByCourt[s.courtId]) slotsByCourt[s.courtId] = [];
      slotsByCourt[s.courtId].push(s.hour);
    }
    const parts = Object.entries(slotsByCourt).map(
      ([c, hours]) => `${c}:${hours.sort().join(',')}`,
    );
    return parts.join(';');
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

        {/* Date picker + axis toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAxis(axis === 'time-rows' ? 'court-rows' : 'time-rows')}
            title={
              axis === 'time-rows'
                ? 'Đảo trục: chuyển sân thành hàng, giờ thành cột'
                : 'Đảo trục: chuyển giờ thành hàng, sân thành cột'
            }
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
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto p-4">
        {axis === 'time-rows' ? (
          // Layout: rows = hours, cols = courts
          <table className="min-w-full border-separate" style={{ borderSpacing: 4 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-20 bg-card pr-2 text-left">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Giờ</span>
                </th>
                {COURTS.map((c) => (
                  <th key={c.id} className="min-w-[110px] px-1">
                    <div className="rounded-md bg-muted/50 px-2 py-2 text-center">
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatVND(c.pricePerHour)}/h
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 z-10 bg-card pr-2 align-middle">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {hour}
                    </span>
                  </td>
                  {COURTS.map((c) => (
                    <td key={c.id + hour} className="px-1 py-1">
                      <Cell
                        courtId={c.id}
                        hour={hour}
                        pricePerHour={c.pricePerHour}
                        selected={!!selected[slotKey({ courtId: c.id, hour })]}
                        onToggle={toggle}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Layout: rows = courts, cols = hours
          <table className="min-w-full border-separate" style={{ borderSpacing: 4 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-32 bg-card pr-2 text-left">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Sân</span>
                </th>
                {TIME_SLOTS.map((h) => (
                  <th key={h} className="min-w-[110px] px-1">
                    <div className="rounded-md bg-muted/50 px-2 py-2 text-center">
                      <p className="font-mono text-xs font-bold">{h}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COURTS.map((c) => (
                <tr key={c.id}>
                  <td className="sticky left-0 z-10 w-32 bg-card pr-2 align-middle">
                    <div>
                      <p className="text-sm font-bold leading-tight">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatVND(c.pricePerHour)}/h
                      </p>
                    </div>
                  </td>
                  {TIME_SLOTS.map((hour) => (
                    <td key={c.id + hour} className="px-1 py-1">
                      <Cell
                        courtId={c.id}
                        hour={hour}
                        pricePerHour={c.pricePerHour}
                        selected={!!selected[slotKey({ courtId: c.id, hour })]}
                        onToggle={toggle}
                      />
                    </td>
                  ))}
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
                const court = COURTS.find((c) => c.id === s.courtId);
                return (
                  <button
                    key={slotKey(s)}
                    type="button"
                    onClick={() => toggle(s.courtId, s.hour, 'available')}
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
              <span className="text-muted-foreground">
                Tạm tính ({selectedList.length} slot)
              </span>
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
            <Link
              href={`/booking/new?venue=${venue.id}&slots=${encodeURIComponent(queryString)}`}
            >
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
          Bằng cách đặt sân, bạn đồng ý với{' '}
          <a className="underline" href="#">
            Điều khoản
          </a>{' '}
          và{' '}
          <a className="underline" href="#">
            Chính sách huỷ
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Cell({
  courtId,
  hour,
  pricePerHour,
  selected,
  onToggle,
}: {
  courtId: string;
  hour: string;
  pricePerHour: number;
  selected: boolean;
  onToggle: (courtId: string, hour: string, status: CellStatus) => void;
}) {
  const status = mockCellStatus(courtId, hour);
  const disabled = status === 'booked';

  let cellClass = '';
  let cellText: string;
  if (selected) {
    cellClass = 'bg-primary text-primary-foreground border-primary shadow-sm';
    cellText = '✓ Chọn';
  } else if (status === 'booked') {
    cellClass = 'bg-muted text-muted-foreground cursor-not-allowed border-transparent line-through';
    cellText = 'Đã đặt';
  } else if (status === 'held') {
    cellClass = 'bg-warning/15 text-amber-700 border-warning/40 dark:text-amber-300';
    cellText = 'Đang giữ';
  } else {
    cellClass = 'bg-background hover:border-primary hover:bg-primary/5 border';
    cellText = formatVND(pricePerHour);
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(courtId, hour, status)}
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
