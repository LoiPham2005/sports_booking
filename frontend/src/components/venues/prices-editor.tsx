'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TimePicker24 } from '@/components/ui/time-picker';
import { PriceTimeline, type CellSelection } from './price-timeline';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm';
import { formatVND } from '@/lib/format';
import {
  listPriceRules,
  addPriceRule,
  updatePriceRule,
  deletePriceRule,
} from '@/lib/data/venues';
import { isApiError } from '@/lib/api/errors';
import type { PriceRuleDto, PriceRuleInput } from '@/lib/api/endpoints/venues';
import type { UiCourt } from '@/lib/api/adapters/venue';

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function PricesEditor({ courts }: { courts: UiCourt[] }) {
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '');
  const [rules, setRules] = useState<PriceRuleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PriceRuleDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selection, setSelection] = useState<CellSelection | null>(null);
  /** Hour đầu tiên user click (anchor) — để extend range khi click tiếp */
  const [anchorHour, setAnchorHour] = useState<number | null>(null);
  const confirm = useConfirm();

  // Reset selection khi đổi court
  useEffect(() => {
    setSelection(null);
    setAnchorHour(null);
  }, [courtId]);

  function handleCellClick(day: number, hour: number) {
    if (!selection || selection.day !== day) {
      // Khác ngày hoặc chưa có selection → bắt đầu mới
      setSelection({ day, startHour: hour, endHour: hour + 1 });
      setAnchorHour(hour);
      return;
    }
    // Cùng ngày + click ô đã chọn (duy nhất) → bỏ chọn
    if (
      selection.startHour === hour &&
      selection.endHour === hour + 1 &&
      anchorHour === hour
    ) {
      setSelection(null);
      setAnchorHour(null);
      return;
    }
    // Cùng ngày → mở rộng range từ anchor tới hour
    const anchor = anchorHour ?? selection.startHour;
    const start = Math.min(anchor, hour);
    const end = Math.max(anchor, hour) + 1;
    setSelection({ day, startHour: start, endHour: end });
  }

  function clearSelection() {
    setSelection(null);
    setAnchorHour(null);
  }

  function openCreateFromSelection() {
    if (!selection) return;
    openCreate(
      selection.day,
      `${String(selection.startHour).padStart(2, '0')}:00`,
      `${String(selection.endHour).padStart(2, '0')}:00`,
    );
  }

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('17:00');
  const [pricePerSlot, setPricePerSlot] = useState(100_000);

  useEffect(() => {
    if (!courtId) return;
    setLoading(true);
    let cancelled = false;
    listPriceRules(courtId)
      .then((list) => !cancelled && setRules(list))
      .catch(() => !cancelled && setRules([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [courtId]);

  const sorted = useMemo(
    () =>
      [...rules].sort((a, b) =>
        a.dayOfWeek !== b.dayOfWeek
          ? a.dayOfWeek - b.dayOfWeek
          : a.startTime.localeCompare(b.startTime),
      ),
    [rules],
  );

  function openCreate(prefillDay?: number, prefillStart?: string, prefillEnd?: string) {
    setEditing(null);
    setDayOfWeek(prefillDay ?? 1);
    setStartTime(prefillStart ?? '06:00');
    if (prefillEnd) {
      setEndTime(prefillEnd);
    } else if (prefillStart) {
      const [h] = prefillStart.split(':');
      const endHour = Math.min(Number(h) + 1, 23);
      setEndTime(`${String(endHour).padStart(2, '0')}:00`);
    } else {
      setEndTime('17:00');
    }
    setPricePerSlot(100_000);
    setOpen(true);
  }

  function openEdit(r: PriceRuleDto) {
    setEditing(r);
    setDayOfWeek(r.dayOfWeek);
    setStartTime(r.startTime);
    setEndTime(r.endTime);
    setPricePerSlot(r.pricePerSlot);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (startTime >= endTime) return toast.error('Giờ kết thúc phải sau giờ bắt đầu');
    if (pricePerSlot <= 0) return toast.error('Giá phải > 0');
    const body: PriceRuleInput = { dayOfWeek, startTime, endTime, pricePerSlot };
    setSubmitting(true);
    try {
      if (editing) {
        const next = await updatePriceRule(courtId, editing.id, body);
        setRules((prev) => prev.map((r) => (r.id === editing.id ? next : r)));
        toast.success('Đã cập nhật khung giá');
      } else {
        const next = await addPriceRule(courtId, body);
        setRules((prev) => [...prev, next]);
        toast.success('Đã thêm khung giá');
      }
      clearSelection();
      setOpen(false);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(r: PriceRuleDto) {
    const ok = await confirm({
      title: 'Xoá khung giá này?',
      description: `${DAY_NAMES[r.dayOfWeek]} · ${r.startTime}–${r.endTime} · ${formatVND(r.pricePerSlot)}`,
      tone: 'destructive',
      confirmText: 'Xoá',
    });
    if (!ok) return;
    try {
      await deletePriceRule(courtId, r.id);
      setRules((prev) => prev.filter((x) => x.id !== r.id));
      toast.success('Đã xoá');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  if (courts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-base font-semibold">Chưa có sân con</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo sân con trước rồi mới đặt được bảng giá
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-sm">Sân:</Label>
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={courtId}
          onChange={(e) => setCourtId(e.target.value)}
        >
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button size="sm" className="ml-auto" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" /> Thêm khung giá
        </Button>
      </div>

      {/* Timeline trực quan — 7 ngày × 24h */}
      {!loading && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Lịch giá trong tuần</h4>
            <span className="text-[11px] text-muted-foreground">
              Click ô trống để chọn · Click tiếp để mở rộng range · Click block để sửa
            </span>
          </div>
          <PriceTimeline
            rules={sorted}
            selection={selection}
            onCellClick={handleCellClick}
            onEdit={openEdit}
          />
        </Card>
      )}

      {/* Bottom bar khi có selection */}
      {selection && (
        <div className="sticky bottom-4 z-30">
          <Card className="flex flex-wrap items-center gap-3 border-primary bg-primary/5 p-3 shadow-lg">
            <Badge variant="default" className="text-xs">
              {DAY_NAMES[selection.day]}
            </Badge>
            <div className="text-sm">
              <span className="font-mono font-semibold">
                {String(selection.startHour).padStart(2, '0')}:00
              </span>
              <span className="mx-1 text-muted-foreground">–</span>
              <span className="font-mono font-semibold">
                {String(selection.endHour).padStart(2, '0')}:00
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({selection.endHour - selection.startHour} giờ)
              </span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                <X className="h-3.5 w-3.5" /> Bỏ chọn
              </Button>
              <Button size="sm" onClick={openCreateFromSelection}>
                <Plus className="h-3.5 w-3.5" /> Set giá cho khung này
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Chưa có khung giá nào cho sân này. Thêm khung đầu tiên để khách đặt được.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ngày</th>
                <th className="px-4 py-3 text-left font-medium">Khung giờ</th>
                <th className="px-4 py-3 text-right font-medium">Giá / slot</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <Badge variant="outline">{DAY_NAMES[r.dayOfWeek]}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.startTime} – {r.endTime}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatVND(r.pricePerSlot)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Edit2 className="h-3.5 w-3.5" /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa khung giá' : 'Thêm khung giá'}</DialogTitle>
            <DialogDescription>
              Khung giá theo thứ trong tuần. Có thể có nhiều khung giờ trong cùng 1 ngày
              (vd 06–17h giá khác 17–22h).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Ngày trong tuần</Label>
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDayOfWeek(i)}
                    className={`h-9 rounded-md border text-xs font-semibold transition-colors ${
                      dayOfWeek === i
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Giờ bắt đầu</Label>
                <TimePicker24 value={startTime} onChange={setStartTime} className="w-full" />
              </div>
              <div className="space-y-1.5">
                <Label>Giờ kết thúc</Label>
                <TimePicker24 value={endTime} onChange={setEndTime} className="w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Giá / slot</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  className="pr-10 text-right font-mono tabular-nums"
                  value={pricePerSlot ? pricePerSlot.toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setPricePerSlot(Number(raw) || 0);
                  }}
                  placeholder="100.000"
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  ₫
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Slot = thời lượng đặt mặc định của sân (60 phút mặc định, đổi ở tab Sân con).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Huỷ
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
