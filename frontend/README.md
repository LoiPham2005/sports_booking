# Sports Booking — Frontend

Next.js 14 + Tailwind CSS + Radix UI. UI hoàn chỉnh chạy trên mock data (chưa nối API).

## Chạy thử

```bash
cd frontend
npm install      # hoặc pnpm install / yarn
npm run dev
```

Mở `http://localhost:3001`. Backend chạy ở `:3000`, web ở `:3001` — không xung đột.

## Tour màn hình

| URL | Mô tả |
|---|---|
| `/` | Trang chủ — hero, sports grid, featured venues, how-it-works |
| `/venues` | Tìm sân — filter + list view + map placeholder |
| `/venues/v1` | Chi tiết sân + widget đặt sân sticky |
| `/booking/new?venue=v1&court=c1&slots=18:00,19:00` | Flow đặt sân 2 bước |
| `/booking/result?status=success` | Kết quả thanh toán |
| `/login` `/register` `/forgot-password` | Auth — layout 2 cột nửa ảnh |
| `/account/bookings` | Booking của tôi (3 tab) |
| `/account/bookings/b1` | Chi tiết booking + QR check-in |
| `/account/favorites` | Sân đã lưu |
| `/account/profile` | Thông tin cá nhân |
| `/owner` | Dashboard chủ sân (KPI + chart + bảng booking) |
| `/owner/venues` | Quản lý venue |
| `/owner/venues/v1` | Edit venue (tabs: info / sân / giá / ảnh / giờ / tiện ích) |
| `/owner/bookings` | Lịch booking dạng grid theo tuần |
| `/admin` | Tổng quan admin (GMV, top venue, payment split) |

## Stack

- **Next.js 14** App Router
- **Tailwind CSS** với CSS variables (light/dark sẵn sàng)
- **Radix UI primitives**: Tabs, Dialog, Avatar, Dropdown, Popover...
- **lucide-react** icons
- **class-variance-authority** + **tailwind-merge** cho biến thể components

## Design tokens

Chỉnh trong [app/globals.css](app/globals.css):
- `--primary`: emerald-500 (#10B981)
- `--accent`: orange-500 (#F97316)
- `--radius`: 0.75rem (lg)

## Thay mock thành API

Tất cả mock đang ở [lib/mock-data.ts](lib/mock-data.ts). Khi backend stable:
1. Tạo `lib/api.ts` với fetcher gọi tới `NEXT_PUBLIC_API_URL`.
2. Thay `import { VENUES } from '@/lib/mock-data'` bằng `await getVenues()` server components.
3. Mounted page → wrap với TanStack Query (đã có sẵn trong dependencies).
4. Thêm `middleware.ts` xử lý auth/redirect.

## Component map

```
components/
├── ui/                        Primitive (button, card, input, badge, avatar, tabs, dialog, skeleton)
├── shared/                    Header, Footer, MobileNav, VenueCard
├── booking/                   SlotGrid, BookingWidget, PaymentMethodPicker
└── owner/                     Sidebar
```
