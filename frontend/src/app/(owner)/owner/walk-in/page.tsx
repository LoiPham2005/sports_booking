'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { formatVND } from '@/lib/format';
import { listOwnerVenues, createWalkIn } from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import type { UiVenue } from '@/lib/api/adapters/venue';

const SLOTS = Array.from({ length: 16 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);

const METHODS = [
  { id: 'cash', label: 'Tiền mặt', desc: 'Khách trả trực tiếp tại sân' },
  { id: 'transfer', label: 'Chuyển khoản', desc: 'Khách quét mã QR ngân hàng' },
  { id: 'vnpay', label: 'VNPay QR', desc: 'Tạo QR VNPay tại quầy' },
];

// Pricing trong walk-in: owner nhập giá thủ công vì sân walk-in có thể có giá custom.
// Default 350k/h cho mỗi slot 1h.
const DEFAULT_HOURLY_RATE = 350_000;

export default function OwnerWalkInPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<UiVenue[]>([]);
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [method, setMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_HOURLY_RATE);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listOwnerVenues().then((list) => {
      setVenues(list);
      if (list.length > 0) {
        setVenueId(list[0].id);
        // Court IDs sẽ dùng theo venue. Vì page UI chưa fetch courts riêng,
        // dùng prompt cho courtId hoặc để Owner gõ. Tạm thời prefill 'c1'.
        setCourtId('c1');
      }
    });
  }, []);

  const total = selectedSlots.length * hourlyRate;

  const toggleSlot = (s: string) => {
    setSelectedSlots((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].sort(),
    );
  };

  async function handleSubmit() {
    if (!courtId) return toast.error('Vui lòng chọn sân');
    if (selectedSlots.length === 0) return toast.error('Chọn ít nhất 1 khung giờ');

    const startsAt = new Date(`${date}T${selectedSlots[0]}:00`).toISOString();
    const lastSlot = selectedSlots[selectedSlots.length - 1];
    const [h, m] = lastSlot.split(':').map((x) => parseInt(x, 10));
    const endsAt = new Date(`${date}T${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`).toISOString();

    setSubmitting(true);
    try {
      const booking = await createWalkIn({
        courtId,
        startsAt,
        endsAt,
        total,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      });
      toast.success(`Đã tạo walk-in #${booking.code}`);
      router.push('/owner/bookings');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Tạo walk-in thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tạo booking thủ công</h1>
        <p className="text-sm text-muted-foreground">Cho khách đến trực tiếp sân, không qua app</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Customer */}
          <Card className="p-6">
            <h3 className="font-bold">Thông tin khách</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Họ tên</Label>
                <Input
                  id="customerName"
                  placeholder="Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  placeholder="09xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Venue + Court */}
          <Card className="p-6">
            <h3 className="font-bold">Venue + Sân</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Venue</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="courtId">Mã sân (Court ID)</Label>
                <Input
                  id="courtId"
                  placeholder="c1, c2..."
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Lấy từ tab Sân trong venue. Tương lai sẽ là dropdown.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate">Đơn giá / giờ (VND)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                  min={0}
                  step={10000}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Ngày</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Slots */}
          <Card className="p-6">
            <h3 className="font-bold">Khung giờ</h3>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {SLOTS.map((s) => {
                const active = selectedSlots.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSlot(s)}
                    className={`rounded-md border py-2 text-sm font-medium transition-all ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background hover:border-primary'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-6">
            <h3 className="font-bold">Phương thức thanh toán</h3>
            <div className="mt-4 space-y-2">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-all ${
                    method === m.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Vd: Khách quen, miễn phí nước, đội 6 người..."
              className="mt-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>
        </div>

        {/* Summary sidebar */}
        <aside>
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-bold">Tóm tắt</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Số giờ" value={`${selectedSlots.length} giờ`} />
              <Row label="Đơn giá" value={`${formatVND(hourlyRate)}/h`} />
              <Row label="Phương thức" value={METHODS.find((m) => m.id === method)?.label ?? ''} />
            </dl>
            <div className="my-4 border-t" />
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">{formatVND(total)}</span>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={selectedSlots.length === 0 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Đang tạo...' : 'Tạo booking'}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Booking sẽ ở trạng thái CONFIRMED ngay (đã thu tiền)
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
