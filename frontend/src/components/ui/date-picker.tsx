'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Date picker tiếng Việt với popover lịch tháng.
 *
 * Value: chuỗi `YYYY-MM-DD` hoặc empty.
 */

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseKey(key: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
}

function formatVi(key: string): string {
  const p = parseKey(key);
  if (!p) return '';
  return `${pad(p.d)}/${pad(p.m + 1)}/${p.y}`;
}

interface CalendarPanelProps {
  /** Tháng đang hiển thị — viewYear / viewMonth (0-based) */
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  selected: string;
  /** Khi range mode bật, second highlight color */
  rangeStart?: string;
  rangeEnd?: string;
  onPick: (key: string) => void;
  /** Disable ngày ngoài [min, max] */
  min?: string;
  max?: string;
}

function CalendarPanel({
  viewYear,
  viewMonth,
  onViewChange,
  selected,
  rangeStart,
  rangeEnd,
  onPick,
  min,
  max,
}: CalendarPanelProps) {
  // Tính các ô trong grid 6x7 = 42 ô
  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const firstDow = firstDay.getDay(); // 0=CN
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const out: { key: string; day: number; inMonth: boolean }[] = [];
    // Padding đầu (tháng trước)
    for (let i = firstDow - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      out.push({ key: toKey(y, m, day), day, inMonth: false });
    }
    // Ngày trong tháng
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ key: toKey(viewYear, viewMonth, d), day: d, inMonth: true });
    }
    // Padding cuối (tháng sau)
    while (out.length < 42) {
      const idx = out.length - firstDow - daysInMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      out.push({ key: toKey(y, m, idx), day: idx, inMonth: false });
    }
    return out;
  }, [viewYear, viewMonth]);

  function isInRange(key: string): boolean {
    if (!rangeStart || !rangeEnd) return false;
    return key > rangeStart && key < rangeEnd;
  }
  function isDisabled(key: string): boolean {
    if (min && key < min) return true;
    if (max && key > max) return true;
    return false;
  }

  function prevMonth() {
    if (viewMonth === 0) onViewChange(viewYear - 1, 11);
    else onViewChange(viewYear, viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) onViewChange(viewYear + 1, 0);
    else onViewChange(viewYear, viewMonth + 1);
  }

  const todayKey = toKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  return (
    <div className="w-[300px] p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {DAY_NAMES.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const isSelected = c.key === selected;
          const isStart = c.key === rangeStart;
          const isEnd = c.key === rangeEnd;
          const inRange = isInRange(c.key);
          const isToday = c.key === todayKey;
          const disabled = isDisabled(c.key);
          return (
            <button
              key={i}
              type="button"
              onClick={() => !disabled && onPick(c.key)}
              disabled={disabled}
              className={cn(
                'h-9 rounded-md text-sm font-medium transition-colors',
                !c.inMonth && 'text-muted-foreground/40',
                c.inMonth && !isSelected && !isStart && !isEnd && !inRange && 'hover:bg-muted',
                inRange && 'bg-primary/15 text-primary',
                (isSelected || isStart || isEnd) && 'bg-primary text-primary-foreground font-bold',
                isToday && !isSelected && !isStart && !isEnd && 'ring-1 ring-primary/40',
                disabled && 'cursor-not-allowed opacity-30',
              )}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Single date picker
// ═══════════════════════════════════════════════════════════════

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  /** Anchor popover relative to trigger. Default 'start' (popover-left = trigger-left). */
  align?: 'start' | 'end';
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disabled,
  className,
  min,
  max,
  clearable,
  align = 'start',
}: DatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const parsed = parseKey(value);
  const now = new Date();
  const [view, setView] = useState({
    y: parsed?.y ?? now.getFullYear(),
    m: parsed?.m ?? now.getMonth(),
  });

  useEffect(() => {
    if (parsed) setView({ y: parsed.y, m: parsed.m });
  }, [parsed?.y, parsed?.m]);

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

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm transition-colors',
          'hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
          open && 'border-primary ring-2 ring-ring',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn(!value && 'text-muted-foreground')}>
            {value ? formatVi(value) : placeholder}
          </span>
        </span>
        {clearable && value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="grid h-5 w-5 place-items-center rounded hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-1.5 rounded-lg border bg-popover shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          <CalendarPanel
            viewYear={view.y}
            viewMonth={view.m}
            onViewChange={(y, m) => setView({ y, m })}
            selected={value}
            onPick={(k) => {
              onChange(k);
              setOpen(false);
            }}
            min={min}
            max={max}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Date range picker
// ═══════════════════════════════════════════════════════════════

interface DateRangePickerProps {
  /** Cặp `{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }`. */
  value: { from: string; to: string };
  onChange: (next: { from: string; to: string }) => void;
  presets?: { label: string; days: number }[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [
  { label: '7 ngày qua', days: 7 },
  { label: '30 ngày qua', days: 30 },
  { label: '90 ngày qua', days: 90 },
];

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  disabled,
  className,
}: DateRangePickerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const now = new Date();
  const parsed = parseKey(value.from);
  const [view, setView] = useState({
    y: parsed?.y ?? now.getFullYear(),
    m: parsed?.m ?? now.getMonth(),
  });
  /** Lần click đầu = chọn from. Lần click 2 = chọn to. */
  const [pickingEnd, setPickingEnd] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPickingEnd(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function applyPreset(days: number) {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days + 1);
    onChange({
      from: toKey(from.getFullYear(), from.getMonth(), from.getDate()),
      to: toKey(today.getFullYear(), today.getMonth(), today.getDate()),
    });
    setOpen(false);
  }

  function pick(key: string) {
    if (!pickingEnd) {
      onChange({ from: key, to: '' });
      setPickingEnd(true);
    } else {
      // Ép thứ tự: nếu pick < from thì swap
      if (key < value.from) {
        onChange({ from: key, to: value.from });
      } else {
        onChange({ ...value, to: key });
      }
      setPickingEnd(false);
      setOpen(false);
    }
  }

  const label =
    value.from && value.to
      ? `${formatVi(value.from)} – ${formatVi(value.to)}`
      : value.from
        ? `${formatVi(value.from)} – chọn ngày kết thúc...`
        : 'Chọn khoảng thời gian';

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)}>
      <button
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
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className={cn(!value.from && 'text-muted-foreground')}>{label}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 flex rounded-lg border bg-popover shadow-lg">
          {/* Presets — sidebar hẹp để nhường chỗ cho lịch */}
          <div className="w-24 shrink-0 border-r p-1.5">
            <p className="mb-1 px-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Nhanh
            </p>
            {presets.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => applyPreset(p.days)}
                className="block w-full rounded px-1.5 py-1 text-left text-[11px] font-medium hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
          </div>
          <CalendarPanel
            viewYear={view.y}
            viewMonth={view.m}
            onViewChange={(y, m) => setView({ y, m })}
            selected=""
            rangeStart={value.from}
            rangeEnd={value.to}
            onPick={pick}
          />
        </div>
      )}
    </div>
  );
}
