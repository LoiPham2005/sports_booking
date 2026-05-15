import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COURTS, SURFACES, VENUES, AMENITIES } from '@/lib/mock-data';
import { formatVND } from '@/lib/format';
import { notFound } from 'next/navigation';

const PRICE_RULES = [
  { dow: 'T2–T6', timeRange: '06:00–17:00', price: 80_000 },
  { dow: 'T2–T6', timeRange: '17:00–22:00', price: 150_000 },
  { dow: 'T7–CN', timeRange: '06:00–17:00', price: 120_000 },
  { dow: 'T7–CN', timeRange: '17:00–22:00', price: 180_000 },
];

export default function OwnerVenueEditPage({ params }: { params: { id: string } }) {
  const venue = VENUES.find((v) => v.id === params.id);
  if (!venue) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/owner/venues"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tất cả venues
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
        <p className="text-sm text-muted-foreground">Quản lý thông tin venue và các sân con</p>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="courts">Sân con</TabsTrigger>
          <TabsTrigger value="prices">Bảng giá</TabsTrigger>
          <TabsTrigger value="photos">Ảnh</TabsTrigger>
          <TabsTrigger value="hours">Giờ mở cửa</TabsTrigger>
          <TabsTrigger value="amenities">Tiện ích</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tên venue</Label>
                <Input defaultValue={venue.name} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Mô tả</Label>
                <Textarea rows={4} defaultValue="Một trong những sân thể thao chất lượng cao..." />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Địa chỉ</Label>
                <Input defaultValue={venue.address} />
              </div>
              <div className="space-y-1.5">
                <Label>Quận / Huyện</Label>
                <Input defaultValue={venue.district} />
              </div>
              <div className="space-y-1.5">
                <Label>Thành phố</Label>
                <Input defaultValue={venue.city} />
              </div>
              <div className="space-y-1.5">
                <Label>Hotline</Label>
                <Input defaultValue="0901 234 567" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Huỷ</Button>
              <Button>Lưu</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="courts" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm">+ Thêm sân con</Button>
          </div>
          {COURTS.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {SURFACES[c.surface]} · {c.indoor ? 'Trong nhà' : 'Ngoài trời'} · {c.capacity} người
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold">{formatVND(c.pricePerHour)}</p>
                <p className="text-xs text-muted-foreground">đơn giá khởi điểm</p>
              </div>
              <Button size="sm" variant="ghost" className="ml-4">
                Sửa
              </Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="prices">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">Bảng giá theo khung giờ</h3>
              <Button size="sm">+ Thêm rule</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-y bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Thứ</th>
                  <th className="px-4 py-2 text-left font-medium">Khung giờ</th>
                  <th className="px-4 py-2 text-right font-medium">Giá/giờ</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {PRICE_RULES.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3">{r.dow}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.timeRange}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatVND(r.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost">
                        Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Upload ảnh sân (placeholder)</p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted" />
              ))}
              <button className="grid aspect-square place-items-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                + Thêm
              </button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="p-6">
            <div className="space-y-3">
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((d) => (
                <div key={d} className="grid grid-cols-[120px_1fr_1fr] items-center gap-3">
                  <span className="text-sm font-medium">{d}</span>
                  <Input type="time" defaultValue="06:00" />
                  <Input type="time" defaultValue="22:00" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="amenities">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(AMENITIES).map(([slug, a]) => (
                <label key={slug} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted">
                  <input
                    type="checkbox"
                    defaultChecked={venue.amenities.includes(slug)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span>{a.icon}</span>
                  <span>{a.name}</span>
                </label>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
