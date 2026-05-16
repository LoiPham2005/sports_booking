'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Star, Share2, Heart, Phone, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MobileNav } from '@/components/shared/mobile-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AMENITIES } from '@/lib/mock-data';
import {
  getVenue,
  listSports,
  listReviews,
  listHours,
  type UiVenueDetail,
  type UiSport,
  type ReviewDto,
} from '@/lib/data/venues';
import type { VenueHourDto } from '@/lib/api/endpoints/venues';
import { isFavorite, toggleFavorite } from '@/lib/data/users';
import { useCurrentUser } from '@/lib/use-current-user';
import { isApiError } from '@/lib/api/errors';
import { BookingMatrix } from '@/components/booking/booking-matrix';
import { cn } from '@/lib/utils';

// Bản đồ vị trí — Leaflet client-only
const VenueLocationMap = dynamic(() => import('@/components/venues/venue-location-map'), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse bg-muted" />,
});

const DAYS_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/** Ảnh fallback khi venue chưa upload — chủ đề thể thao đa dạng từ Unsplash */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop', // bóng đá
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop', // tennis
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop', // cầu lông
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop', // bóng rổ
  'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop', // sân ngoài trời
];

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useCurrentUser();

  const [venue, setVenue] = useState<UiVenueDetail | null | undefined>(undefined);
  const [sports, setSports] = useState<UiSport[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [hours, setHours] = useState<VenueHourDto[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [reviewSort, setReviewSort] = useState<'recent' | 'rating'>('recent');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getVenue(id),
      listSports(),
      listReviews(id, reviewSort).catch(() => []),
      listHours(id).catch(() => []),
    ])
      .then(([v, s, r, h]) => {
        if (cancelled) return;
        setVenue(v);
        setSports(s);
        setReviews(r);
        setHours(h);
      })
      .catch(() => !cancelled && setVenue(null));
    return () => {
      cancelled = true;
    };
  }, [id, reviewSort]);

  // Fetch favorite state khi user đã login
  useEffect(() => {
    if (!user) {
      setIsFav(false);
      return;
    }
    let cancelled = false;
    isFavorite(id).then((fav) => !cancelled && setIsFav(fav));
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  async function handleFavorite() {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu yêu thích');
      return;
    }
    setFavLoading(true);
    const prev = isFav;
    setIsFav(!prev); // optimistic
    try {
      await toggleFavorite(id, prev);
      toast.success(prev ? 'Đã bỏ yêu thích' : 'Đã lưu vào yêu thích');
    } catch (e) {
      setIsFav(prev);
      toast.error(isApiError(e) ? e.message : 'Lỗi cập nhật yêu thích');
    } finally {
      setFavLoading(false);
    }
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: venue?.name, url });
        return;
      } catch {
        // user cancel
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Đã copy link sân vào clipboard');
  }

  // Loading state
  if (venue === undefined) {
    return (
      <>
        <Header />
        <main className="container py-6">
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted/40" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-72 animate-pulse rounded-xl bg-muted/30" />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  if (!venue) notFound();

  const sportNames = venue.sports
    .map((s) => sports.find((sp) => sp.slug === s)?.name)
    .filter(Boolean) as string[];

  // Gallery: 1 ảnh lớn bên trái + 4 ảnh nhỏ bên phải.
  // Nếu venue chưa có đủ ảnh → fill bằng FALLBACK_IMAGES (chủ đề thể thao).
  const realImages = venue.images.map((i) => i.url).filter(Boolean);
  const galleryUrls: string[] = [];
  for (let i = 0; i < 5; i++) {
    galleryUrls.push(realImages[i] ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]);
  }
  const primaryImage = galleryUrls[0];
  const sideImages = galleryUrls.slice(1, 5);
  const extraImagesCount = Math.max(realImages.length - 5, 0);
  const isFallback = realImages.length === 0;

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
                {venue.address}
                {venue.district ? `, ${venue.district}` : ''}, {venue.city}
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
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <Button
              variant={isFav ? 'default' : 'outline'}
              size="sm"
              onClick={handleFavorite}
              disabled={favLoading}
              className={cn(isFav && 'bg-rose-500 text-white hover:bg-rose-600')}
            >
              <Heart className={cn('h-4 w-4', isFav && 'fill-white')} />
              {isFav ? 'Đã lưu' : 'Yêu thích'}
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="relative mt-5 grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
          <div className="relative col-span-2 row-span-2 bg-muted">
            <Image
              src={primaryImage}
              alt={venue.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          {sideImages.map((url, i) => {
            const isLast = i === 3 && extraImagesCount > 0;
            return (
              <div key={i} className="relative bg-muted">
                <Image src={url} alt={`Ảnh ${i + 2}`} fill className="object-cover" unoptimized />
                {isLast && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white transition hover:bg-black/50">
                    Xem tất cả {realImages.length} ảnh
                  </button>
                )}
              </div>
            );
          })}
          {isFallback && (
            <div className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
              Ảnh minh hoạ
            </div>
          )}
        </div>

        {/* Booking matrix */}
        <div className="mt-8">
          <BookingMatrix venue={venue} />
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="courts">Sân & Giá</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá ({venue.reviewCount})</TabsTrigger>
              <TabsTrigger value="location">Vị trí</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <section>
                <h2 className="text-lg font-bold">Giới thiệu</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {venue.description ??
                    `${venue.name} là một trong những điểm đến hàng đầu cho những người yêu thích thể thao tại ${venue.district || venue.city}.`}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold">Tiện ích</h2>
                {venue.amenities.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Chưa có thông tin tiện ích.</p>
                ) : (
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
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold">Chính sách & Giờ mở cửa</h2>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-primary" />
                    <span>
                      <span className="font-semibold">Huỷ trước 24h</span>: hoàn 100% qua đúng kênh
                      thanh toán
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">Giờ mở cửa</p>
                      {hours.length === 0 ? (
                        <p className="text-muted-foreground">06:00 – 22:00 hàng ngày</p>
                      ) : (
                        <ul className="mt-1 grid gap-x-6 gap-y-0.5 text-xs sm:grid-cols-2">
                          {Array.from({ length: 7 }, (_, dow) => {
                            const slot = hours.find((h) => h.dayOfWeek === dow);
                            return (
                              <li key={dow} className="flex justify-between gap-3">
                                <span className="text-muted-foreground">{DAYS_VI[dow]}</span>
                                <span className="font-mono">
                                  {slot ? `${slot.openTime} – ${slot.closeTime}` : 'Đóng cửa'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </li>
                  {venue.phone && (
                    <li className="flex gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-primary" />
                      <span>
                        <span className="font-semibold">Hotline</span>:{' '}
                        <a href={`tel:${venue.phone}`} className="text-primary hover:underline">
                          {venue.phone}
                        </a>
                      </span>
                    </li>
                  )}
                </ul>
              </section>
            </TabsContent>

            <TabsContent value="courts" className="space-y-3">
              {venue.courts.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Chưa có thông tin sân con
                </p>
              ) : (
                venue.courts.map((c) => (
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
                      <p className="text-xs text-muted-foreground">trong bảng đặt sân ở trên</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <ReviewsSection
                avg={venue.rating}
                total={venue.reviewCount}
                reviews={reviews}
                sort={reviewSort}
                onSortChange={setReviewSort}
              />
            </TabsContent>

            <TabsContent value="location">
              <div className="overflow-hidden rounded-xl border">
                {venue.lat != null && venue.lng != null ? (
                  <div className="h-80">
                    <VenueLocationMap lat={venue.lat} lng={venue.lng} name={venue.name} />
                  </div>
                ) : (
                  <div className="grid h-80 place-items-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="mx-auto h-10 w-10" />
                      <p className="mt-2 text-sm">Sân chưa cập nhật toạ độ</p>
                    </div>
                  </div>
                )}
                <div className="border-t bg-card p-4">
                  <p className="font-semibold">{venue.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {venue.address}
                    {venue.district ? `, ${venue.district}` : ''}, {venue.city}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Reviews section
// ═══════════════════════════════════════════════════════════════

function ReviewsSection({
  avg,
  total,
  reviews,
  sort,
  onSortChange,
}: {
  avg: number;
  total: number;
  reviews: ReviewDto[];
  sort: 'recent' | 'rating';
  onSortChange: (s: 'recent' | 'rating') => void;
}) {
  // Distribution
  const dist = [0, 0, 0, 0, 0]; // index 0 = 1 sao, 4 = 5 sao
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
  }
  const max = Math.max(...dist, 1);

  return (
    <>
      <div className="flex flex-col items-center gap-2 rounded-2xl border bg-muted/30 p-6 text-center md:flex-row md:gap-8 md:text-left">
        <div>
          <div className="text-5xl font-bold">{avg.toFixed(1)}</div>
          <div className="text-amber-400">{'★'.repeat(Math.round(avg))}</div>
          <p className="mt-1 text-xs text-muted-foreground">{total} đánh giá</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = dist[s - 1];
            return (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right">{s}</span>
                <span className="text-amber-400">★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{reviews.length} đánh giá hiển thị</p>
        <select
          className="h-8 rounded-md border bg-background px-2 text-xs"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as 'recent' | 'rating')}
        >
          <option value="recent">Mới nhất</option>
          <option value="rating">Đánh giá cao</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{r.user.fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{r.user.fullName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                  <span>·</span>
                  <span>{formatRelative(r.createdAt)}</span>
                </div>
              </div>
            </div>
            {r.content && <p className="mt-3 text-sm text-foreground/90">{r.content}</p>}
            {r.ownerReply && (
              <div className="mt-3 rounded-md border-l-2 border-primary bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">Phản hồi của chủ sân</p>
                <p className="mt-1 text-sm text-foreground/90">{r.ownerReply}</p>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const day = Math.floor(diff / (24 * 3600_000));
  if (day < 1) return 'Hôm nay';
  if (day < 7) return `${day} ngày trước`;
  if (day < 30) return `${Math.floor(day / 7)} tuần trước`;
  if (day < 365) return `${Math.floor(day / 30)} tháng trước`;
  return date.toLocaleDateString('vi-VN');
}
