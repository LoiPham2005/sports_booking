'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { formatVND } from '@/lib/format';

const COURTS = [
  { id: 'c1', name: 'Sân 1', price: 350_000 },
  { id: 'c2', name: 'Sân 2', price: 350_000 },
  { id: 'c3', name: 'Sân VIP', price: 500_000 },
];

const SLOTS = Array.from({ length: 16 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);

const METHODS = [
  { id: 'cash', label: 'Tiền mặt', desc: 'Khách trả trực tiếp tại sân' },
  { id: 'transfer', label: 'Chuyển khoản', desc: 'Khách quét mã QR ngân hàng' },
  { id: 'vnpay', label: 'VNPay QR', desc: 'Tạo QR VNPay tại quầy' },
];

export default function OwnerWalkInPage() {
  const [courtId, setCourtId] = useState('c1');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [method, setMethod] = useState('cash');

  const court = COURTS.find((c) => c.id === courtId)!;
  const total = selectedSlots.length * court.price;

  const toggleSlot = (s: string) => {
    setSelectedSlots((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].sort(),
    );
  };

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
                <Label>Họ tên</Label>
                <Input placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-1.5">
                <Label>Số điện thoại</Label>
                <Input placeholder="09xxxxxxxx" />
              </div>
            </div>
          </Card>

          {/* Court */}
          <Card className="p-6">
            <h3 className="font-bold">Sân</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {COURTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCourtId(c.id)}
                  className={`rounded-md border-2 p-3 text-left transition-all ${
                    courtId === c.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{formatVND(c.price)}/h</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Slots */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Khung giờ</h3>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-44" />
            </div>
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
            <Label>Ghi chú (tuỳ chọn)</Label>
            <Textarea placeholder="Vd: Khách quen, miễn phí nước, đội 6 người..." className="mt-2" />
          </Card>
        </div>

        {/* Summary sidebar */}
        <aside>
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-bold">Tóm tắt</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Sân" value={court.name} />
              <Row label="Số giờ" value={`${selectedSlots.length} giờ`} />
              <Row label="Đơn giá" value={`${formatVND(court.price)}/h`} />
              <Row label="Phương thức" value={METHODS.find((m) => m.id === method)?.label ?? ''} />
            </dl>
            <div className="my-4 border-t" />
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary">{formatVND(total)}</span>
            </div>
            <Button size="lg" className="mt-4 w-full" disabled={selectedSlots.length === 0}>
              Tạo booking
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Booking sẽ ở trạng thái CONFIRMED ngay
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
