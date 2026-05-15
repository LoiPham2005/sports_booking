import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Phone, Calendar, MoreHorizontal } from 'lucide-react';

const VENUES = [
  {
    id: 'v18',
    name: 'Sân pickleball Saigon Centre',
    owner: 'Trần Văn Hùng',
    ownerEmail: 'hung@example.com',
    address: '14 Thi Sách',
    district: 'Quận 1, HCM',
    sports: ['Pickleball'],
    courts: 4,
    submittedAt: '2 giờ trước',
    status: 'PENDING' as const,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop',
  },
  {
    id: 'v19',
    name: 'CLB tennis Garden Court',
    owner: 'Phạm Thị Linh',
    ownerEmail: 'linh@example.com',
    address: '290 Trường Chinh',
    district: 'Tân Bình, HCM',
    sports: ['Tennis'],
    courts: 3,
    submittedAt: '5 giờ trước',
    status: 'PENDING' as const,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
  },
  {
    id: 'v20',
    name: 'Sân bóng đá Mini Hà Đông',
    owner: 'Nguyễn Quốc Anh',
    ownerEmail: 'anh@example.com',
    address: '125 Quang Trung',
    district: 'Hà Đông, HN',
    sports: ['Bóng đá 5', 'Bóng đá 7'],
    courts: 5,
    submittedAt: '1 ngày trước',
    status: 'PENDING' as const,
    image: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop',
  },
  {
    id: 'v21',
    name: 'CLB cầu lông Hoàng Mai',
    owner: 'Lê Văn Mạnh',
    ownerEmail: 'manh@example.com',
    address: '78 Tam Trinh',
    district: 'Hoàng Mai, HN',
    sports: ['Cầu lông'],
    courts: 6,
    submittedAt: '2 ngày trước',
    status: 'PENDING' as const,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
  },
];

const APPROVED = [
  { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng', owner: 'Trần Văn A', city: 'HCM', courts: 3, approvedAt: '2024-08-12' },
  { id: 'v2', name: 'CLB cầu lông Vinhomes', owner: 'Lê Thị B', city: 'HCM', courts: 6, approvedAt: '2024-09-04' },
  { id: 'v3', name: 'Sân tennis Lan Anh', owner: 'Phạm C', city: 'HCM', courts: 2, approvedAt: '2024-10-15' },
];

export default function AdminVenuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Venue</h1>
          <p className="text-sm text-muted-foreground">
            {VENUES.length} venue đang chờ duyệt · {APPROVED.length} đang hoạt động
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Chờ duyệt', value: VENUES.length, tone: 'warning' as const },
          { label: 'Đang hoạt động', value: 184, tone: 'success' as const },
          { label: 'Tạm khoá', value: 3, tone: 'destructive' as const },
          { label: 'TB ngày duyệt', value: '1.2 ngày', tone: 'muted' as const },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Pending queue */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold">Đang chờ duyệt</h2>
          <Badge variant="warning">{VENUES.length} mới</Badge>
        </div>

        <div className="space-y-4">
          {VENUES.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-5 md:flex-row">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg md:h-28 md:w-44">
                  <Image src={v.image} alt={v.name} fill className="object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{v.id}</p>
                      <h3 className="text-lg font-bold">{v.name}</h3>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {v.address}, {v.district}
                      </p>
                    </div>
                    <Badge variant="warning">PENDING · {v.submittedAt}</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {v.sports.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                    <span className="text-xs text-muted-foreground">· {v.courts} sân</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{v.owner[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{v.owner}</span>
                    <span className="text-xs text-muted-foreground">· {v.ownerEmail}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3" /> Liên hệ owner
                    </Button>
                    <div className="ml-auto flex gap-2">
                      <Button variant="destructive" size="sm">
                        Từ chối
                      </Button>
                      <Button size="sm">
                        Duyệt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Approved venues table */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Venue đang hoạt động</h2>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tên venue, owner, địa chỉ..." className="pl-9" />
            </div>
            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              <option>Mọi thành phố</option>
              <option>Hà Nội</option>
              <option>Hồ Chí Minh</option>
              <option>Đà Nẵng</option>
            </select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              <option>Mọi trạng thái</option>
              <option>APPROVED</option>
              <option>SUSPENDED</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Venue</th>
                <th className="px-4 py-3 text-left font-medium">Owner</th>
                <th className="px-4 py-3 text-center font-medium">Thành phố</th>
                <th className="px-4 py-3 text-center font-medium">Sân</th>
                <th className="px-4 py-3 text-center font-medium">Duyệt từ</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {APPROVED.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.owner}</td>
                  <td className="px-4 py-3 text-center">{v.city}</td>
                  <td className="px-4 py-3 text-center">{v.courts}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{v.approvedAt}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success">APPROVED</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
