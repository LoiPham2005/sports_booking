import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&auto=format&fit=crop"
          alt="Sport"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 via-primary/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
              🏟️
            </span>
            <span className="text-lg font-bold">SportsBooking</span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight">
              "Mỗi trận đấu là một câu chuyện. Hãy bắt đầu của bạn ngay hôm nay."
            </h2>
            <div className="mt-6 flex gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold">600+</p>
                <p className="opacity-80">Sân thể thao</p>
              </div>
              <div>
                <p className="text-2xl font-bold">50K</p>
                <p className="opacity-80">Booking</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.8★</p>
                <p className="opacity-80">Đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="border-b p-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              🏟️
            </span>
            <span className="font-bold">SportsBooking</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
