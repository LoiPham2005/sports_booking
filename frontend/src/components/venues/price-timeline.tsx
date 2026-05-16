'use client';

import { useMemo } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { formatVND } from '@/lib/format';
import type { PriceRuleDto } from '@/lib/api/endpoints/venues';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']; // dayOfWeek 0..6

/** Đổi "HH:MM" → số giờ float (vd "06:30" → 6.5). */
function hhmmToHours(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10) || 0);
  return h + m / 60;
}

interface Props {
  rules: PriceRuleDto[];
  /** Click vào ô trống → callback với ngày + giờ bắt đầu. Optional: để add nhanh */
  onAdd?: (dayOfWeek: number, startTime: string) => void;
  /** Click vào block giá → edit */
  onEdit?: (rule: PriceRuleDto) => void;
}

/**
 * Timeline 7 ngày × 24h. Mỗi rule là 1 block màu, hiển thị giá.
 * Color = lerp giữa primary (rẻ) → destructive (đắt) theo `pricePerSlot`.
 */
export function PriceTimeline({ rules, onAdd, onEdit }: Props) {
  // Tính min/max price để màu lerp
  const { minPrice, maxPrice } = useMemo(() => {
    if (rules.length === 0) return { minPrice: 0, maxPrice: 0 };
    let min = Infinity;
    let max = 0;
    for (const r of rules) {
      if (r.pricePerSlot < min) min = r.pricePerSlot;
      if (r.pricePerSlot > max) max = r.pricePerSlot;
    }
    return { minPrice: min, maxPrice: max };
  }, [rules]);

  function priceColor(price: number): string {
    if (maxPrice === minPrice) return 'bg-primary/70 text-primary-foreground';
    const t = (price - minPrice) / (maxPrice - minPrice); // 0..1
    if (t < 0.25) return 'bg-emerald-500/80 text-white';
    if (t < 0.5) return 'bg-primary/85 text-primary-foreground';
    if (t < 0.75) return 'bg-amber-500/90 text-white';
    return 'bg-destructive/90 text-destructive-foreground';
  }

  // Group rules theo dayOfWeek để render
  const byDay = useMemo(() => {
    const map = new Map<number, PriceRuleDto[]>();
    for (let d = 0; d < 7; d++) map.set(d, []);
    for (const r of rules) {
      map.get(r.dayOfWeek)?.push(r);
    }
    return map;
  }, [rules]);

  // Mỗi cột giờ rộng 56px → tổng = 56 * 24 + 60 (label) = 1404px → scroll ngang trên mobile
  const HOUR_WIDTH = 56;
  const LABEL_WIDTH = 60;
  const ROW_HEIGHT = 56;

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <div style={{ minWidth: LABEL_WIDTH + HOUR_WIDTH * 24 }}>
        {/* Header hours */}
        <div
          className="grid bg-muted/40"
          style={{ gridTemplateColumns: `${LABEL_WIDTH}px repeat(24, ${HOUR_WIDTH}px)` }}
        >
          <div className="border-b border-r" />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="border-b border-r py-1.5 text-center font-mono text-xs text-muted-foreground last:border-r-0"
            >
              {String(h).padStart(2, '0')}h
            </div>
          ))}
        </div>

        {/* 7 rows */}
        {DAYS.map((label, dow) => {
          const dayRules = byDay.get(dow) ?? [];
          return (
            <div
              key={dow}
              className="grid border-b last:border-0"
              style={{ gridTemplateColumns: `${LABEL_WIDTH}px repeat(24, ${HOUR_WIDTH}px)` }}
            >
              <div
                className="flex items-center justify-center border-r bg-muted/30 text-sm font-semibold"
                style={{ height: ROW_HEIGHT }}
              >
                {label}
              </div>

              {/* Track: 1 div phủ 24 cell có position relative để overlay block */}
              <div
                className="relative"
                style={{
                  gridColumn: 'span 24 / span 24',
                  width: HOUR_WIDTH * 24,
                  height: ROW_HEIGHT,
                }}
              >
                {/* Layer 1: 24 ô trống click để add */}
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(24, ${HOUR_WIDTH}px)` }}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onAdd?.(dow, `${String(h).padStart(2, '0')}:00`)}
                      title={`Thêm khung giá lúc ${String(h).padStart(2, '0')}:00`}
                      className="group border-r border-dashed border-border/40 last:border-r-0 hover:bg-primary/5"
                    >
                      <Plus className="mx-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
                    </button>
                  ))}
                </div>

                {/* Layer 2: overlay các rule (z-index cao hơn) */}
                {dayRules.map((r) => {
                  const start = hhmmToHours(r.startTime);
                  const end = hhmmToHours(r.endTime);
                  const left = start * HOUR_WIDTH;
                  const width = (end - start) * HOUR_WIDTH;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onEdit?.(r)}
                      title={`${r.startTime}–${r.endTime} · ${formatVND(r.pricePerSlot)}`}
                      style={{ left, width }}
                      className={`absolute top-1.5 bottom-1.5 z-10 inline-flex items-center justify-center gap-1 overflow-hidden rounded-md border border-white/40 px-2 text-xs font-bold shadow-md transition-transform hover:scale-[1.02] hover:z-20 ${priceColor(
                        r.pricePerSlot,
                      )}`}
                    >
                      <Edit2 className="h-3 w-3 shrink-0 opacity-80" />
                      <span className="truncate">
                        {r.pricePerSlot >= 1000
                          ? `${Math.round(r.pricePerSlot / 1000)}k`
                          : r.pricePerSlot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>

      {/* Legend dưới timeline (sticky không trượt khi scroll ngang) */}
      {rules.length > 0 && minPrice < maxPrice && (
        <div className="sticky left-0 flex items-center gap-3 border-t bg-card px-3 py-2 text-[11px] text-muted-foreground">
          <span>Giá thấp</span>
          <div className="flex h-2 w-32 overflow-hidden rounded-full">
            <div className="flex-1 bg-emerald-500/80" />
            <div className="flex-1 bg-primary/85" />
            <div className="flex-1 bg-amber-500/90" />
            <div className="flex-1 bg-destructive/90" />
          </div>
          <span>Giá cao</span>
          <span className="ml-auto font-mono">
            {formatVND(minPrice)} – {formatVND(maxPrice)}
          </span>
        </div>
      )}
    </div>
  );
}
