'use client';

import { useState } from 'react';
import { SlidersHorizontal, MapIcon, List, Search } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MobileNav } from '@/components/shared/mobile-nav';
import { VenueCard } from '@/components/shared/venue-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SPORTS, VENUES, AMENITIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Gần nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export default function VenuesPage() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <Header />

      <main className="container py-6 pb-20 md:pb-16">
        {/* Breadcrumb + Title */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Trang chủ / Khám phá sân</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sân thể thao tại Hồ Chí Minh</h1>
          <p className="text-sm text-muted-foreground">
            Tìm thấy <span className="font-semibold text-foreground">{VENUES.length}</span> sân
          </p>
        </div>

        {/* Search bar inline */}
        <div className="mt-4 flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tên sân, địa chỉ..." className="pl-9" />
          </div>
          <Input placeholder="Quận / Huyện" className="md:max-w-[180px]" />
          <Input type="date" className="md:max-w-[180px]" />
          <Button>
            <Search className="h-4 w-4" />
            Tìm
          </Button>
          <Button variant="outline" className="md:hidden" onClick={() => setFilterOpen(!filterOpen)}>
            <SlidersHorizontal className="h-4 w-4" />
            Lọc
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* FILTER */}
          <aside
            className={cn(
              'space-y-6 rounded-xl border bg-card p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto',
              !filterOpen && 'hidden lg:block',
            )}
          >
            <FilterBlock title="Môn thể thao">
              <div className="flex flex-wrap gap-1.5">
                {SPORTS.slice(0, 6).map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    className="rounded-full border px-3 py-1 text-xs font-medium hover:border-primary hover:bg-primary/5"
                  >
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Khoảng giá / giờ">
              <div className="space-y-3">
                <input type="range" min={50000} max={500000} step={10000} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50.000₫</span>
                  <span>500.000₫</span>
                </div>
              </div>
            </FilterBlock>

            <FilterBlock title="Khung giờ">
              <div className="grid grid-cols-3 gap-1.5">
                {['Sáng', 'Trưa', 'Chiều', 'Tối', 'Khuya', 'Cả ngày'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="rounded-md border px-2 py-1.5 text-xs font-medium hover:border-primary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Tiện ích">
              <div className="space-y-2">
                {Object.entries(AMENITIES).map(([slug, a]) => (
                  <label key={slug} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" />
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Đánh giá">
              <div className="space-y-2">
                {[5, 4, 3].map((r) => (
                  <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" />
                    <span>
                      {'⭐'.repeat(r)} <span className="text-muted-foreground">trở lên</span>
                    </span>
                  </label>
                ))}
              </div>
            </FilterBlock>

            <Button variant="outline" className="w-full">
              Xoá bộ lọc
            </Button>
          </aside>

          {/* CONTENT */}
          <section>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Cầu lông</Badge>
                <Badge variant="outline">Quận 1, HCM</Badge>
                <Badge variant="outline">Hôm nay 18:00–20:00</Badge>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-9 rounded-md border bg-background px-3 text-sm">
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sắp xếp: {o.label}
                    </option>
                  ))}
                </select>
                <div className="inline-flex rounded-md border bg-card p-0.5">
                  <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('list')}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                    Danh sách
                  </Button>
                  <Button
                    variant={view === 'map' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('map')}
                    className="h-8"
                  >
                    <MapIcon className="h-4 w-4" />
                    Bản đồ
                  </Button>
                </div>
              </div>
            </div>

            {view === 'list' ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {VENUES.map((v) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </div>
            ) : (
              <div className="relative h-[600px] overflow-hidden rounded-xl border bg-muted">
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <MapIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Bản đồ Leaflet/OpenStreetMap sẽ được nhúng tại đây
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pin các venue với popup card khi click
                    </p>
                  </div>
                </div>
                {/* Mini pins decoration */}
                <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                <div className="absolute left-[50%] top-[60%] h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                <div className="absolute left-[75%] top-[40%] h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button variant="outline">Xem thêm sân</Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}
