import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Calendar,
  MapPin,
  ShieldCheck,
  Smartphone,
  Headphones,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { MobileNav } from '@/components/shared/mobile-nav';
import { VenueCard } from '@/components/shared/venue-card';
import { SPORTS, VENUES } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="pb-20 md:pb-0">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-orange-50 dark:from-emerald-950/40 dark:via-background dark:to-orange-950/30" />
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="container relative grid gap-10 py-12 md:grid-cols-2 md:py-20">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Đã có 50.000+ booking thành công
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Đặt sân thể thao
                <br />
                <span className="bg-gradient-to-r from-primary to-emerald-700 bg-clip-text text-transparent">
                  chỉ trong 30 giây
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
                Tìm và đặt sân bóng đá, cầu lông, tennis, pickleball gần bạn. Thanh toán dễ dàng qua
                VNPay, MoMo, ZaloPay.
              </p>

              {/* Search bar */}
              <div className="mt-8 rounded-2xl border bg-card p-3 shadow-lg shadow-emerald-900/5">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.1fr_1fr_1fr_auto]">
                  <SearchField icon={<Tag className="h-4 w-4" />} label="Môn thể thao" value="Cầu lông" />
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="Khu vực" value="Quận 1, HCM" />
                  <SearchField icon={<Calendar className="h-4 w-4" />} label="Ngày & giờ" value="Hôm nay, 18:00" />
                  <Button asChild size="lg" className="h-full">
                    <Link href="/venues">
                      <Search className="h-4 w-4" />
                      Tìm sân
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Phổ biến:</span>
                {['Cầu lông Quận 1', 'Bóng đá Phú Mỹ Hưng', 'Pickleball Quận 7', 'Tennis Bình Thạnh'].map(
                  (t) => (
                    <Link
                      key={t}
                      href="/venues"
                      className="rounded-full border bg-background px-3 py-1 hover:bg-muted"
                    >
                      {t}
                    </Link>
                  ),
                )}
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-3xl bg-gradient-to-br from-primary/20 to-orange-300/20 blur-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <HeroImage
                    src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop"
                    alt="Sân bóng đá"
                    className="h-48"
                  />
                  <HeroImage
                    src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop"
                    alt="Sân cầu lông"
                    className="h-64"
                  />
                </div>
                <div className="space-y-4 pt-10">
                  <HeroImage
                    src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&auto=format&fit=crop"
                    alt="Pickleball"
                    className="h-64"
                  />
                  <HeroImage
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop"
                    alt="Bóng rổ"
                    className="h-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SPORT CATEGORIES */}
        <section className="container py-12 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Chọn môn thể thao</h2>
              <p className="mt-2 text-muted-foreground">8 môn phổ biến với hơn 600 sân khắp Việt Nam</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {SPORTS.map((s) => (
              <Link
                key={s.slug}
                href={`/venues?sport=${s.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary/10 to-orange-100 text-2xl transition-transform group-hover:scale-110 dark:to-orange-950/30">
                  {s.icon}
                </div>
                <span className="text-sm font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.count} sân</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED VENUES */}
        <section className="container py-12 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Sân nổi bật gần bạn</h2>
              <p className="mt-2 text-muted-foreground">Đánh giá cao, giá tốt, lịch còn trống</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/venues">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VENUES.slice(0, 6).map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/venues">Xem tất cả sân</Link>
            </Button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y bg-muted/30">
          <div className="container py-12 md:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">3 bước để có sân</h2>
              <p className="mt-2 text-muted-foreground">Nhanh chóng — minh bạch — không phụ phí</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Tìm sân phù hợp',
                  desc: 'Lọc theo môn, khu vực, giờ rảnh và mức giá. So sánh đánh giá thực từ người chơi.',
                  icon: Search,
                },
                {
                  step: '02',
                  title: 'Chọn giờ & đặt',
                  desc: 'Xem lịch trống real-time. Server giữ chỗ 10 phút để bạn yên tâm thanh toán.',
                  icon: Calendar,
                },
                {
                  step: '03',
                  title: 'Thanh toán & chơi',
                  desc: 'VNPay, MoMo, ZaloPay — chọn cái bạn thích. Nhận mã QR check-in tại sân.',
                  icon: ShieldCheck,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                    BƯỚC {step}
                  </div>
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="container py-12 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Vì sao chọn SportsBooking?</h2>
              <p className="mt-3 text-muted-foreground">
                Chúng tôi không chỉ là một nền tảng đặt sân — chúng tôi là người đồng hành cùng bạn trên
                mọi trận đấu.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Tag, title: 'Giá thật, không phụ phí', desc: 'Giá trên app = giá sân. Không cộng thêm phí ẩn.' },
                  { icon: ShieldCheck, title: 'Hoàn tiền linh hoạt', desc: 'Huỷ trước 24h hoàn 100% qua đúng kênh thanh toán.' },
                  { icon: Smartphone, title: '3 cổng thanh toán', desc: 'VNPay, MoMo, ZaloPay — tiện cách nào dùng cách đó.' },
                  { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tổng đài + chat trực tuyến mọi lúc bạn cần.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{title}</h4>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard value="600+" label="Sân thể thao" />
              <StatCard value="50K" label="Booking thành công" />
              <StatCard value="4.8★" label="Đánh giá trung bình" />
              <StatCard value="63" label="Tỉnh/thành phố" />
            </div>
          </div>
        </section>

        {/* CTA OWNER */}
        <section className="container pb-16">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-emerald-600 to-emerald-700 px-6 py-12 text-primary-foreground md:px-12 md:py-16">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                  Bạn là chủ sân? Tăng doanh thu cùng SportsBooking
                </h2>
                <p className="mt-2 text-emerald-50">
                  Quản lý lịch đặt, giá, doanh thu trên một dashboard. Miễn phí setup, chỉ tính 10%
                  hoa hồng trên booking thành công.
                </p>
              </div>
              <Button asChild variant="accent" size="xl">
                <Link href="/owner">
                  Đăng ký miễn phí <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}

function SearchField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left transition-colors hover:bg-muted"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="block text-sm font-semibold">{value}</span>
      </span>
    </button>
  );
}

function HeroImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`relative ${className} overflow-hidden rounded-2xl shadow-lg`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 0vw, 300px" />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="text-3xl font-bold text-primary md:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
