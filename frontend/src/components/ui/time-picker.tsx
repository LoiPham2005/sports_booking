'use client';

/**
 * Time picker 24h kiểu Việt Nam (00:00 – 23:59).
 * Tránh native `<input type="time">` vì hiển thị AM/PM theo locale browser.
 *
 * Value: chuỗi "HH:MM" (vd "06:00", "17:30"). Empty string khi chưa chọn.
 */

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Bước chia phút trong dropdown. Default 15 (00/15/30/45). */
  step?: 5 | 10 | 15 | 30 | 60;
  disabled?: boolean;
  className?: string;
  /** Optional id cho label htmlFor */
  id?: string;
}

export function TimePicker24({ value, onChange, step = 15, disabled, className, id }: Props) {
  const [hStr, mStr] = (value || ':').split(':');
  const h = parseInt(hStr || '0', 10) || 0;
  const m = parseInt(mStr || '0', 10) || 0;

  const minutes: number[] = [];
  for (let i = 0; i < 60; i += step) minutes.push(i);

  function emit(nextH: number, nextM: number) {
    const hh = String(nextH).padStart(2, '0');
    const mm = String(nextM).padStart(2, '0');
    onChange(`${hh}:${mm}`);
  }

  return (
    <div
      id={id}
      className={
        'inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring ' +
        (disabled ? 'pointer-events-none opacity-50 ' : '') +
        (className ?? '')
      }
    >
      <select
        value={h}
        onChange={(e) => emit(Number(e.target.value), m)}
        className="bg-transparent text-right font-mono outline-none focus:ring-0 [appearance:none]"
        disabled={disabled}
      >
        {Array.from({ length: 24 }, (_, i) => i).map((opt) => (
          <option key={opt} value={opt}>
            {String(opt).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="font-mono text-muted-foreground">:</span>
      <select
        value={m}
        onChange={(e) => emit(h, Number(e.target.value))}
        className="bg-transparent text-right font-mono outline-none focus:ring-0 [appearance:none]"
        disabled={disabled}
      >
        {minutes.map((opt) => (
          <option key={opt} value={opt}>
            {String(opt).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
}
