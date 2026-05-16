'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPicker } from '@/components/venues/map-picker';
import { AddressSelector, type AddressValue } from '@/components/venues/address-selector';
import { createOwnerVenue } from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

type AddressMode = 'new' | 'old';

interface FormState {
  name: string;
  addressLine: string;
  address: AddressValue;
  description: string;
  phone: string;
  lat: string;
  lng: string;
}

const EMPTY: FormState = {
  name: '',
  addressLine: '',
  address: { city: '' },
  description: '',
  phone: '',
  lat: '',
  lng: '',
};

export default function NewVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressMode>('new');

  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.addressLine.trim() || !form.address.city) {
      toast.error('Vui lòng nhập đủ Tên, Địa chỉ, Tỉnh/Thành phố');
      return;
    }
    const lat = form.lat.trim() ? Number(form.lat) : undefined;
    const lng = form.lng.trim() ? Number(form.lng) : undefined;
    if ((lat !== undefined && Number.isNaN(lat)) || (lng !== undefined && Number.isNaN(lng))) {
      toast.error('Toạ độ phải là số');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createOwnerVenue({
        name: form.name.trim(),
        addressLine: form.addressLine.trim(),
        city: form.address.city,
        // Địa chỉ mới không có Quận/Huyện — chỉ gửi nếu user chọn format cũ
        district: addressMode === 'old' ? form.address.district : undefined,
        ward: form.address.ward,
        // Địa chỉ mới (luôn gửi nếu user đã chọn qua dropdown)
        newCity: form.address.newCity,
        newWard: form.address.newWard,
        provinceCode: form.address.provinceCode,
        wardCode: form.address.wardCode,
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
        lat,
        lng,
      });
      toast.success(`Đã tạo "${created.name}"`);
      router.replace('/owner/venues');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Tạo venue thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/owner/venues"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Tạo venue mới</h1>
        <p className="text-sm text-muted-foreground">
          Sau khi tạo, venue ở trạng thái <Badge variant="outline">DRAFT</Badge> — bạn cần thêm sân
          + giờ mở cửa rồi nộp duyệt để admin phê duyệt.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* MAIN */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Thông tin cơ bản</h3>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="v-name">
                  Tên venue <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="v-name"
                  placeholder="VD: Sân bóng đá Phú Mỹ Hưng"
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-phone">Số điện thoại</Label>
                <Input
                  id="v-phone"
                  placeholder="VD: 0901234567"
                  value={form.phone}
                  onChange={(e) => patch('phone', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-desc">Mô tả</Label>
                <Textarea
                  id="v-desc"
                  rows={4}
                  placeholder="Mô tả ngắn về venue, tiện ích nổi bật, hướng dẫn tìm đường..."
                  value={form.description}
                  onChange={(e) => patch('description', e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Địa chỉ</h3>
                <p className="text-xs text-muted-foreground">
                  {addressMode === 'new'
                    ? 'Sau cải cách hành chính 7/2025: bỏ cấp Quận/Huyện, chỉ còn Tỉnh + Phường/Xã'
                    : 'Định dạng trước 7/2025: Tỉnh + Quận/Huyện + Phường/Xã'}
                </p>
              </div>
              <div className="inline-flex rounded-md border bg-card p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAddressMode('new')}
                  className={cn(
                    'rounded px-3 py-1.5 font-medium transition-colors',
                    addressMode === 'new' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Địa chỉ mới (2025)
                </button>
                <button
                  type="button"
                  onClick={() => setAddressMode('old')}
                  className={cn(
                    'rounded px-3 py-1.5 font-medium transition-colors',
                    addressMode === 'old' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Địa chỉ cũ
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="v-address">
                  Số nhà / Đường <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="v-address"
                  placeholder="VD: 123 Nguyễn Văn Linh"
                  value={form.addressLine}
                  onChange={(e) => patch('addressLine', e.target.value)}
                  required
                />
              </div>

              <AddressSelector
                mode={addressMode}
                value={form.address}
                onChange={(next) => patch('address', next)}
              />

              {addressMode === 'old' && form.address.newCity && form.address.newWard && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <p>
                    ✓ Hệ thống đã tự quy đổi sang địa chỉ mới:{' '}
                    <strong>
                      {form.address.newWard}, {form.address.newCity}
                    </strong>
                  </p>
                </div>
              )}

              {addressMode === 'old' && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>
                    Bạn đang dùng định dạng cũ. Trường <strong>Quận/Huyện</strong> vẫn lưu được để
                    tương thích dữ liệu trước 7/2025, nhưng hệ thống sẽ ưu tiên hiển thị theo địa
                    chỉ mới khi search.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Vị trí trên bản đồ</h3>
            <p className="text-xs text-muted-foreground">
              Click trực tiếp lên bản đồ để chọn vị trí. Khách hàng sẽ thấy venue trên trang khám phá.
            </p>

            <div className="mt-4">
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => {
                  patch('lat', lat);
                  patch('lng', lng);
                }}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="v-lat">Vĩ độ (lat)</Label>
                <Input
                  id="v-lat"
                  placeholder="10.7299"
                  className="font-mono text-xs"
                  value={form.lat}
                  onChange={(e) => patch('lat', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-lng">Kinh độ (lng)</Label>
                <Input
                  id="v-lng"
                  placeholder="106.7215"
                  className="font-mono text-xs"
                  value={form.lng}
                  onChange={(e) => patch('lng', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* SIDEBAR */}
        <aside>
          <Card className="sticky top-24 p-5">
            <h3 className="font-bold">Hoàn tất</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className={form.name ? 'text-foreground' : ''}>
                {form.name ? '✓' : '○'} Tên venue
              </li>
              <li className={form.addressLine && form.address.city ? 'text-foreground' : ''}>
                {form.addressLine && form.address.city ? '✓' : '○'} Địa chỉ + Tỉnh/Thành
              </li>
              <li className={form.lat && form.lng ? 'text-foreground' : ''}>
                {form.lat && form.lng ? '✓' : '○'} Toạ độ bản đồ (khuyến khích)
              </li>
              <li className={form.description ? 'text-foreground' : ''}>
                {form.description ? '✓' : '○'} Mô tả
              </li>
            </ul>

            <div className="my-4 border-t" />

            <p className="text-xs text-muted-foreground">
              Bước tiếp theo sau khi tạo:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Thêm sân con (court) + môn thể thao</li>
              <li>Đặt bảng giá theo khung giờ</li>
              <li>Upload ảnh + giờ mở cửa</li>
              <li>Nộp duyệt cho admin</li>
            </ol>

            <div className="mt-5 flex gap-2">
              <Button asChild type="button" variant="outline" className="flex-1">
                <Link href="/owner/venues">Huỷ</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Đang tạo...' : 'Tạo venue'}
              </Button>
            </div>
          </Card>
        </aside>
      </form>
    </div>
  );
}
