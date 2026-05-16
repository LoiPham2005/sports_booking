'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listHours, upsertHours } from '@/lib/data/venues';
import { isApiError } from '@/lib/api/errors';

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

interface Row {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

const DEFAULT_OPEN = '06:00';
const DEFAULT_CLOSE = '22:00';

export function HoursEditor({ venueId }: { venueId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listHours(venueId)
      .then((hours) => {
        if (cancelled) return;
        // Group theo dayOfWeek — chỉ lấy slot đầu mỗi ngày cho UI đơn giản
        const byDay = new Map<number, { open: string; close: string }>();
        for (const h of hours) {
          if (!byDay.has(h.dayOfWeek)) {
            byDay.set(h.dayOfWeek, { open: h.openTime, close: h.closeTime });
          }
        }
        setRows(
          Array.from({ length: 7 }, (_, dow) => {
            const slot = byDay.get(dow);
            return {
              dayOfWeek: dow,
              openTime: slot?.open ?? DEFAULT_OPEN,
              closeTime: slot?.close ?? DEFAULT_CLOSE,
              closed: !slot,
            };
          }),
        );
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  function patch(idx: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...p } : r)));
    setDirty(true);
  }

  function applyAll() {
    setRows((prev) =>
      prev.map((r) => ({ ...r, openTime: rows[1].openTime, closeTime: rows[1].closeTime, closed: rows[1].closed })),
    );
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = rows
        .filter((r) => !r.closed)
        .map((r) => ({
          dayOfWeek: r.dayOfWeek,
          openTime: r.openTime,
          closeTime: r.closeTime,
        }));
      await upsertHours(venueId, payload);
      toast.success('Đã lưu giờ mở cửa');
      setDirty(false);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Đặt giờ mở cửa cho từng ngày trong tuần. Đánh dấu "Đóng cửa" cho ngày venue không hoạt động.
        </p>
        <Button size="sm" variant="outline" onClick={applyAll} disabled={saving}>
          Áp dụng giờ T2 cho cả tuần
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.dayOfWeek}
            className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-3 rounded-md border bg-background p-3"
          >
            <span className="text-sm font-medium">{DAYS[r.dayOfWeek]}</span>
            <Input
              type="time"
              value={r.openTime}
              disabled={r.closed || saving}
              onChange={(e) => patch(i, { openTime: e.target.value })}
            />
            <Input
              type="time"
              value={r.closeTime}
              disabled={r.closed || saving}
              onChange={(e) => patch(i, { closeTime: e.target.value })}
            />
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={r.closed}
                onChange={(e) => patch(i, { closed: e.target.checked })}
                disabled={saving}
              />
              Đóng cửa
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setDirty(false)} disabled={!dirty || saving}>
          Huỷ
        </Button>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Đang lưu...' : 'Lưu giờ mở cửa'}
        </Button>
      </div>
    </Card>
  );
}
