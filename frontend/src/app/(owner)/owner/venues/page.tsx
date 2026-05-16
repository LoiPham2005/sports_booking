'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Star, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/format';
import { listOwnerVenues } from '@/lib/data/owner';
import type { UiVenue } from '@/lib/api/adapters/venue';

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<UiVenue[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sân của tôi</h1>
          <p className="text-sm text-muted-foreground">Quản lý thông tin và lịch của các venue</p>
        </div>
        <Button>
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
          <Button className="mt-4">
            <Plus className="h-4 w-4" /> Thêm venue mới
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {venues.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
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
                        {v.district}, {v.city}
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
      )}
    </div>
  );
}
