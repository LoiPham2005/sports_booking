import Link from 'next/link';
import Image from 'next/image';
import { Plus, Star, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VENUES } from '@/lib/mock-data';
import { formatVND } from '@/lib/format';

export default function OwnerVenuesPage() {
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

      <div className="grid gap-4 lg:grid-cols-2">
        {VENUES.slice(0, 3).map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                <Image src={v.image} alt={v.name} fill className="object-cover" />
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
                  <span>3 sân</span>
                  <span>·</span>
                  <span>Từ {formatVND(v.priceFrom)}/h</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/owner/venues/${v.id}`}>Chỉnh sửa</Link>
                  </Button>
                  <Button size="sm" variant="ghost">
                    Xem lịch
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
    </div>
  );
}
