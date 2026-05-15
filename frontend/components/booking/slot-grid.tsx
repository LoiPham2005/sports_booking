'use client';

import { cn } from '@/lib/utils';
import { TIME_SLOTS, mockSlotStatus } from '@/lib/mock-data';
import { useState } from 'react';

interface Props {
  selected: string[];
  onChange: (slots: string[]) => void;
}

export function SlotGrid({ selected, onChange }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  function toggle(slot: string) {
    if (selected.includes(slot)) onChange(selected.filter((s) => s !== slot));
    else onChange([...selected, slot].sort());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <LegendDot color="bg-background border" label="Còn trống" />
        <LegendDot color="bg-primary" label="Đã chọn" />
        <LegendDot color="bg-warning/30" label="Đang giữ" />
        <LegendDot color="bg-muted-foreground/30" label="Đã đặt" />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {TIME_SLOTS.map((slot) => {
          const status = mockSlotStatus(slot);
          const isSelected = selected.includes(slot);
          const disabled = status === 'booked';

          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => toggle(slot)}
              onMouseEnter={() => setHovered(slot)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'rounded-md border py-2 text-sm font-medium transition-all',
                disabled && 'cursor-not-allowed bg-muted-foreground/20 text-muted-foreground line-through',
                status === 'held' && !isSelected && 'border-warning/40 bg-warning/15 text-amber-700',
                status === 'available' && !isSelected && 'bg-background hover:border-primary hover:bg-primary/5',
                isSelected && 'border-primary bg-primary text-primary-foreground shadow-sm',
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Đã chọn <span className="font-semibold text-foreground">{selected.length} khung giờ</span> · liên tục:{' '}
          {selected[0]} – {String(parseInt(selected[selected.length - 1].split(':')[0], 10) + 1).padStart(2, '0')}:00
        </p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-3 w-3 rounded-sm', color)} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
