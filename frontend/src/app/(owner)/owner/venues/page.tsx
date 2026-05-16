'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Star, MoreHorizontal, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Textarea } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { formatVND } from '@/lib/format';
import { listOwnerVenues, createOwnerVenue } from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import type { UiVenue } from '@/lib/api/adapters/venue';

interface FormState {
  name: string;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  description: string;
  phone: string;
  lat: string;
  lng: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  addressLine: '',
  city: 'Hồ Chí Minh',
  district: '',
  ward: '',
  description: '',
  phone: '',
  lat: '',
  lng: '',
};

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<UiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal tạo venue
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listOwnerVenues()
      .then((list) => !cancelled && setVenues(list))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const paged = useMemo(
    () => venues.slice((page - 1) * pageSize, page * pageSize),
    [venues, page, pageSize],
  );

  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.addressLine.trim() || !form.city.trim()) {
      toast.error('Vui lòng nhập đủ Tên, Địa chỉ, Thành phố');
      return;
    }
    const lat = form.lat.trim() ? Number(form.lat) : undefined;
    const lng = form.lng.trim() ? Number(form.lng) : undefined;
    if ((lat !== undefined && Number.isNaN(lat)) || (lng !== undefined && Number.isNaN(lng))) {
      toast.error('Latitude / Longitude phải là số');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createOwnerVenue({
        name: form.name.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        district: form.district.trim() || undefined,
        ward: form.ward.trim() || undefined,
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
        lat,
        lng,
      });
      setVenues((prev) => [created, ...prev]);
      toast.success(`Đã tạo "${created.name}". Vào trang chỉnh sửa để thêm sân + nộp duyệt.`);
      setOpen(false);
      setPage(1);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Tạo venue thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sân của tôi</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${venues.length} venue · Quản lý thông tin và lịch`}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm venue mới
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-base font-semibold">Chưa có venue nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo venue đầu tiên để bắt đầu nhận booking
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Thêm venue mới
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {paged.map((v) => (
              <Card key={v.id} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {v.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold leading-tight">{v.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {v.district ? `${v.district}, ` : ''}{v.city}
                        </p>
                      </div>
                      <Badge variant="success">Đang hoạt động</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {v.rating} ({v.reviewCount})
                      </span>
                      <span>·</span>
                      <span>Từ {formatVND(v.priceFrom)}/h</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/owner/venues/${v.id}`}>Chỉnh sửa</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/owner/bookings?venueId=${v.id}`}>Xem lịch</Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="ml-auto" aria-label="Tuỳ chọn">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {venues.length > 0 && (
            <Card className="overflow-hidden p-0">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={venues.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                className="border-t-0"
              />
            </Card>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo venue mới</DialogTitle>
            <DialogDescription>
              Sau khi tạo, venue ở trạng thái <strong>DRAFT</strong>. Bạn cần thêm sân + giờ mở cửa
              rồi nộp duyệt để admin phê duyệt trước khi public.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="v-name">
                Tên venue <span className="text-destructive">*</span>
              </Label>
              <Input
                id="v-name"
                placeholder="VD: Sân bóng đá Phú Mỹ Hưng"
                value={form.name}
                onChange={(e) => patch('name', e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-address">
                Địa chỉ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="v-address"
                placeholder="VD: 123 Nguyễn Văn Linh"
                value={form.addressLine}
                onChange={(e) => patch('addressLine', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-city">
                  Thành phố <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="v-city"
                  value={form.city}
                  onChange={(e) => patch('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-district">Quận/Huyện</Label>
                <Input
                  id="v-district"
                  placeholder="VD: Quận 7"
                  value={form.district}
                  onChange={(e) => patch('district', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-ward">Phường/Xã</Label>
                <Input
                  id="v-ward"
                  placeholder="VD: Tân Phú"
                  value={form.ward}
                  onChange={(e) => patch('ward', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                <Label className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Toạ độ (lat, lng)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="10.7299"
                    value={form.lat}
                    onChange={(e) => patch('lat', e.target.value)}
                    className="font-mono text-xs"
                  />
                  <Input
                    placeholder="106.7215"
                    value={form.lng}
                    onChange={(e) => patch('lng', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-desc">Mô tả</Label>
              <Textarea
                id="v-desc"
                rows={3}
                placeholder="Mô tả ngắn về venue, tiện ích nổi bật, hướng dẫn tìm đường..."
                value={form.description}
                onChange={(e) => patch('description', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Huỷ
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tạo venue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
