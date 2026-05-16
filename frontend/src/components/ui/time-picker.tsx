'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Bước chia phút. Default 15 (00/15/30/45). */
  step?: 5 | 10 | 15 | 30 | 60;
  disabled?: boolean;
  className?: string;
  /** Optional id (cho label htmlFor) */
  id?: string;
  placeholder?: string;
}

/**
 * Time picker 24h tiếng Việt — button hiện "HH:MM", click mở popover 2 cột scroll.
 * Không phụ thuộc locale browser (không AM/PM).
 */
export function TimePicker24({
  value,
  onChange,
  step = 15,
  disabled,
  className,
  id,
  placeholder = '--:--',
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hourColRef = useRef<HTMLDivElement | null>(null);
  const minuteColRef = useRef<HTMLDivElement | null>(null);

  const [hStr, mStr] = (value || ':').split(':');
  const h = parseInt(hStr || '', 10);
  const m = parseInt(mStr || '', 10);
  const hasValue = !Number.isNaN(h) && !Number.isNaN(m);

  const minutes: number[] = [];
  for (let i = 0; i < 60; i += step) minutes.push(i);

  // Click outside → close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Khi mở → scroll vào option đang chọn
  useEffect(() => {
    if (!open || !hasValue) return;
    requestAnimationFrame(() => {
      hourColRef.current
        ?.querySelector<HTMLElement>(`[data-h="${h}"]`)
        ?.scrollIntoView({ block: 'center' });
      minuteColRef.current
        ?.querySelector<HTMLElement>(`[data-m="${m}"]`)
        ?.scrollIntoView({ block: 'center' });
    });
  }, [open, h, m, hasValue]);

  function pickHour(nextH: number) {
    const nextM = Number.isNaN(m) ? 0 : m;
    onChange(`${pad(nextH)}:${pad(nextM)}`);
  }

  function pickMinute(nextM: number) {
    const nextH = Number.isNaN(h) ? 0 : h;
    onChange(`${pad(nextH)}:${pad(nextM)}`);
  }

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm transition-colors',
          'hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
          open && 'border-primary ring-2 ring-ring',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span
          className={cn(
            'font-mono tabular-nums',
            !hasValue && 'text-muted-foreground',
          )}
        >
          {hasValue ? `${pad(h)} : ${pad(m)}` : placeholder}
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-44 rounded-lg border bg-popover p-2 shadow-lg"
          role="dialog"
        >
          <div className="mb-1.5 grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Giờ</span>
            <span>Phút</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div
              ref={hourColRef}
              className="h-48 overflow-y-auto rounded-md border bg-background hide-scrollbar"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  data-h={opt}
                  onClick={() => pickHour(opt)}
                  className={cn(
                    'block w-full px-2 py-1.5 text-center font-mono tabular-nums text-sm transition-colors',
                    opt === h
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'hover:bg-muted',
                  )}
                >
                  {pad(opt)}
                </button>
              ))}
            </div>
            <div
              ref={minuteColRef}
              className="h-48 overflow-y-auto rounded-md border bg-background hide-scrollbar"
            >
              {minutes.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  data-m={opt}
                  onClick={() => pickMinute(opt)}
                  className={cn(
                    'block w-full px-2 py-1.5 text-center font-mono tabular-nums text-sm transition-colors',
                    opt === m
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'hover:bg-muted',
                  )}
                >
                  {pad(opt)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
