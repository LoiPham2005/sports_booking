import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Star, Share2, Heart, Phone, Clock, Shield } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MobileNav } from '@/components/shared/mobile-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AMENITIES } from '@/lib/mock-data';
import { getVenue, listSports } from '@/lib/data/venues';
import { BookingMatrix } from '@/components/booking/booking-matrix';

export default async function VenueDetailPage({ params }: { params: { id: string } }) {
  const [venue, sports] = await Promise.all([getVenue(params.id), listSports()]);
  if (!venue) notFound();

  const sportNames = venue.sports
    .map((s) => sports.find((sp) => sp.slug === s)?.name)
    .filter(Boolean) as string[];

  return (
    <>
      <Header />

      <main className="container py-6 pb-20 md:pb-12">
        {/* Breadcrumb */}
        <p className="text-xs text-muted-foreground">
          Trang chủ / Khám phá / <span className="text-foreground">{venue.name}</span>
        </p>

        {/* Title row */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{venue.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{venue.rating}</span>
                <span>({venue.reviewCount} đánh giá)</span>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {venue.address}, {venue.district}, {venue.city}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sportNames.map((s) => (
                <Badge key={s} variant="default">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" /> Yêu thích
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-5 grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
          <div className="relative col-span-2 row-span-2">
            {venue.image && (
              <Image src={venue.image} alt={venue.name} fill className="object-cover" priority />
            )}
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative">
              <Image
                src={`https://images.unsplash.com/photo-${
                  i % 2 === 0
                    ? '1551958219-acbc608c6377'
                    : i === 1
                    ? '1626224583764-f87db24ac4ea'
                    : '1622279457486-62dcc4a431d6'
                }?w=600&auto=format&fit=crop`}
                alt={`Ảnh ${i}`}
                fill
                className="object-cover"
              />
              {i === 4 && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white transition hover:bg-black/50">
                  Xem tất cả ảnh
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Booking matrix (full width, prominent) */}
        <div className="mt-8">
          <BookingMatrix venue={venue} />
        </div>

        {/* Content (single column, no sidebar now) */}
        <div className="mt-8">
          <div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="courts">Sân & Giá</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá ({venue.reviewCount})</TabsTrigger>
                <TabsTrigger value="location">Vị trí</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* About */}
                <section>
                  <h2 className="text-lg font-bold">Giới thiệu</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {venue.description ??
                      `${venue.name} là một trong những điểm đến hàng đầu cho những người yêu thích thể thao tại ${venue.district}. Với hệ thống sân hiện đại, thiết kế chuẩn quốc tế và đội ngũ nhân viên thân thiện, chúng tôi mang đến trải nghiệm chơi thể thao tốt nhất cho bạn và bạn bè.`}
                  </p>
                </section>

                {/* Amenities */}
                <section>
                  <h2 className="text-lg font-bold">Tiện ích</h2>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {venue.amenities.map((slug) => {
                      const a = AMENITIES[slug];
                      if (!a) return null;
                      return (
                        <div key={slug} className="flex items-center gap-3 rounded-lg border p-3">
                          <span className="text-xl">{a.icon}</span>
                          <span className="text-sm font-medium">{a.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Policy */}
                <section>
                  <h2 className="text-lg font-bold">Chính sách</h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    <li className="flex gap-3">
                      <Shield className="h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="font-semibold">Huỷ trước 24h</span>: hoàn 100% qua đúng kênh
                        thanh toán
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <Clock className="h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="font-semibold">Mở cửa</span>: 06:00 – 22:00 hàng ngày
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="font-semibold">Hotline</span>:{' '}
                        {venue.phone ?? '0901 234 567'} (08:00 – 21:00)
                      </span>
                    </li>
                  </ul>
                </section>
              </TabsContent>

              <TabsContent value="courts" className="space-y-3">
                {venue.courts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {c.surface} · {c.indoor ? 'Trong nhà' : 'Ngoài trời'} · {c.capacity} người
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-primary">Xem giá theo giờ</p>
                      <p className="text-xs text-muted-foreground">trong bảng đặt sân</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-muted/30 p-6 text-center md:flex-row md:gap-8 md:text-left">
                  <div>
                    <div className="text-5xl font-bold">{venue.rating}</div>
                    <div className="text-amber-400">{'★'.repeat(5)}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{venue.reviewCount} đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right">{s}</span>
                        <span className="text-amber-400">★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${s === 5 ? 70 : s === 4 ? 20 : 5}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-muted-foreground">
                          {s === 5 ? '172' : s === 4 ? '49' : '7'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {[
                  {
                    name: 'Minh Trần',
                    rating: 5,
                    time: '2 ngày trước',
                    content: 'Sân chất lượng, mặt sân êm. Nhân viên nhiệt tình. Sẽ quay lại.',
                  },
                  {
                    name: 'Hà Nguyễn',
                    rating: 5,
                    time: '1 tuần trước',
                    content: 'Vị trí thuận tiện, bãi gửi xe rộng. Phòng thay đồ sạch sẽ.',
                  },
                  {
                    name: 'Đức Phạm',
                    rating: 4,
                    time: '2 tuần trước',
                    content: 'Sân ổn, giá hợp lý. Buổi tối hơi đông cần đặt sớm.',
                  },
                ].map((r) => (
                  <div key={r.name} className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{r.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                          <span>·</span>
                          <span>{r.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground/90">{r.content}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="location">
                <div className="overflow-hidden rounded-xl border">
                  <div className="relative grid h-80 place-items-center bg-muted">
                    <div className="text-center">
                      <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Bản đồ địa điểm</p>
                    </div>
                    <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-8 ring-primary/20" />
                  </div>
                  <div className="border-t bg-card p-4">
                    <p className="font-semibold">{venue.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {venue.address}, {venue.district}, {venue.city}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
