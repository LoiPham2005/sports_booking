# Frontend Design — Sports Booking (Next.js)

> 📍 Đọc [PROJECT.md](PROJECT.md) trước. [STATUS.md](STATUS.md) cho hiện trạng + [GOTCHAS.md](GOTCHAS.md) cho các bug đã giải quyết.

Tài liệu này mô tả **giao diện** trước. Mục tiêu là UI hoàn chỉnh chạy trên mock data, chưa nối API. Khi backend stable, chỉ cần thay layer `lib/api.ts` là xong.

## 1. Tech stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + CSS variables cho dark mode
- **Component primitives**: Radix UI (Dialog, Tabs, Popover, Select, …)
- **Icons**: lucide-react
- **Date**: `date-fns`, `react-day-picker` cho lịch
- **Form**: react-hook-form + zod
- **State server**: TanStack Query (đặt sẵn để dễ gắn API sau)
- **Animations**: Tailwind transitions + `framer-motion` cho hero

## 2. Design system

### Brand
- **Identity**: thể thao, năng động, trẻ, đáng tin.
- **Primary**: `emerald-500` (#10B981) — nền tươi mát, gợi cảm giác cỏ/sân.
- **Accent**: `orange-500` (#F97316) — CTA, nhấn mạnh.
- **Neutrals**: zinc scale.
- **Success / Warning / Danger**: green-500 / amber-500 / red-500.

### Type
- Font: `Inter` (sans, var), `JetBrains Mono` cho mã booking/code.
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48.
- Heading weight 700, body 400, label 500.

### Spacing / radius
- 8px base. Tailwind default + thêm: card padding 16/24, page max-w 1280.
- Radius: sm 6, md 10, lg 14, xl 20 (cards, modals).
- Shadow: subtle (1 layer cho card, 2 cho dropdown).

### Dark mode
- Toggle qua class `dark` trên `<html>`. Lưu trong localStorage. Theo system mặc định.

## 3. Sitemap

```
/                          Home
/venues                    Search venues
/venues/[id]               Venue detail (gồm widget booking)
/booking/new               Booking flow (multi-step)
/booking/result            Sau khi pay
/login                     
/register
/forgot-password

(/account)                 Customer area
  /account/bookings        My bookings list
  /account/bookings/[id]   Booking detail
  /account/favorites
  /account/profile
  /account/notifications

(/owner)                   Owner area
  /owner                   Dashboard overview
  /owner/venues            My venues
  /owner/venues/[id]       Venue manage (tabs: info/courts/prices/photos/hours)
  /owner/bookings          Bookings calendar
  /owner/reports           Doanh thu / occupancy / top khách
  /owner/payout            Tài khoản nhận tiền + lịch sử
  /owner/staff             Quản lý nhân viên trực sân
  /owner/walk-in           Tạo booking thủ công
  /owner/settings          Cài đặt venue + commission

(/staff)                   Staff portal — đăng nhập đi thẳng vào /staff
  /staff                   Hôm nay: list booking + nút QR check-in
  /staff/schedule          Lịch sân theo ngày
  /staff/bookings/[id]     Chi tiết booking (read-only) + check-in

(/admin)                   Admin area
  /admin                   Overview KPI (GMV, booking, top venue, payment split)
  /admin/venues            Venue approval queue
  /admin/users             Quản lý người dùng (search, suspend, role)
  /admin/disputes          Khiếu nại / refund manual
  /admin/vouchers          Voucher toàn cục
  /admin/reports           Report cấp nền tảng (export CSV)
  /admin/audit             Audit log viewer

(/admin/system)            SUPER_ADMIN only — cấu hình nền tảng
  /admin/system/settings   Commission %, cancel policy default, payout schedule
  /admin/system/roles      Promote user → ADMIN, manage admins
  /admin/system/feature-flags  Feature flag toggles
```

## 3.1. Quyền theo role (RBAC matrix)

| Khu vực | CUSTOMER | OWNER | STAFF | ADMIN | SUPER_ADMIN |
|---|:-:|:-:|:-:|:-:|:-:|
| `/`, `/venues/*` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/booking/*`, `/account/*` | ✓ | ✓ (cá nhân) | — | — | — |
| `/owner/*` (venue mình sở hữu) | — | ✓ | — | ✓ (mọi venue) | ✓ |
| `/staff/*` | — | ✓ (preview) | ✓ | ✓ | ✓ |
| `/admin/*` | — | — | — | ✓ | ✓ |
| `/admin/system/*` | — | — | — | — | ✓ |

- Sau login, backend trả role trong JWT → frontend redirect đến shell phù hợp:
  - `CUSTOMER` → `/`
  - `OWNER` → `/owner`
  - `STAFF` → `/staff`
  - `ADMIN` / `SUPER_ADMIN` → `/admin`
- Middleware Next.js (`middleware.ts`) chặn truy cập trái phép.
- Trang Login có 3 nút demo (Customer / Owner / Staff / Admin) cho UI thử nhanh — bỏ khi nối API.

## 4. Các màn hình chính

### 4.1. Home
- **Hero**: tiêu đề lớn "Đặt sân thể thao chỉ với 2 cú click", search box (môn + thành phố + ngày), background ảnh sân + gradient.
- **Sport categories**: grid 6–8 thẻ tròn (bóng đá, cầu lông, tennis, pickleball, bóng rổ, bóng chuyền…).
- **Featured venues**: 6 venue carousel/grid.
- **How it works**: 3 bước (Tìm sân → Đặt giờ → Thanh toán).
- **Stats strip**: số venue, số booking, tỉnh thành.
- **Why us**: 4 lợi ích (giá tốt, hoàn tiền dễ, đa dạng thanh toán, hỗ trợ 24/7).
- **App download CTA** + **footer**.

### 4.2. Venues — Search
- Layout 2 cột (desktop): filter trái (sticky), kết quả phải.
- **Filter**: môn (chip), thành phố/quận, ngày, khung giờ, giá, tiện ích (checkbox), rating.
- **Sort**: gần nhất, giá tăng/giảm, rating, popular.
- **List view** mặc định + toggle **Map** (OpenStreetMap qua `react-leaflet`). Map layout 2 cột: panel danh sách (320px) bên trái + bản đồ bên phải.
  - Pin marker custom dạng giọt nước có đuôi, hiển thị **emoji môn thể thao** (`⚽`, `🏸`, `🎾`, `🏀`, `🏓`) tra theo `sports[0]` của venue.
  - Pin active: nền primary, scale to, glow shadow. Hover: scale 1.1.
  - Click pin → mở popup card (ảnh + tên + rating + giá + nút "Xem") + highlight card bên panel. Ngược lại click card bên panel → focus pin.
  - Auto `fitBounds` quanh tất cả venue có toạ độ; venue thiếu `lat/lng` không lên map, đếm riêng "+N thiếu toạ độ".
  - Component: [components/venues/venue-map.tsx](../frontend/src/components/venues/venue-map.tsx) (wrapper + panel) + [venue-map-inner.tsx](../frontend/src/components/venues/venue-map-inner.tsx) (Leaflet, dynamic import `ssr: false` vì Leaflet cần `window`).
- Mỗi card: ảnh primary, tên, rating + đánh giá, giá từ, badge sport, distance.

### 4.3. Venue Detail
- **Header**: gallery (1 ảnh lớn + 4 nhỏ), tên, địa chỉ, rating, share/favorite.
- **Tabs**: Tổng quan / Sân & Giá / Đánh giá / Vị trí.
- **Booking widget** (sticky right column desktop, sheet mobile):
  - chọn môn (nếu venue đa môn) → chọn sân
  - lịch (DayPicker), grid khung giờ
  - tổng tiền real-time, voucher input
  - CTA "Tiếp tục thanh toán"

### 4.4. Booking flow
3 step trong 1 trang `/booking/new` (stepper):
1. **Chọn giờ** (nếu nhảy thẳng từ Home/Search), giống widget.
2. **Xem lại** booking (sân, giờ, giá, ghi chú).
3. **Chọn phương thức thanh toán**: card lớn VNPay / MoMo / ZaloPay (+ icon, mô tả phí). Nhấn → mock redirect.

`/booking/result?status=success|fail`: trang xác nhận đẹp với mã booking, CTA "Xem trong My Bookings" / "Thử lại".

### 4.5. My Bookings
- Tabs: Sắp tới / Hoàn thành / Đã huỷ.
- Card mỗi booking: ảnh venue, tên, thời gian, trạng thái badge, action (huỷ/đánh giá/check-in QR).
- Detail page: chi tiết + QR check-in + lịch sử trạng thái + nút huỷ/đánh giá.

### 4.6. Auth
- Login: identifier (email/phone) + password, "Đăng nhập với Google".
- Register: full name + email + phone + password.
- Forgot password: 2 bước (nhập email → nhập OTP + new password).
- Trang nửa hình ảnh, nửa form (desktop). Mobile full-screen.

### 4.7. Owner area
- Layout có **sidebar trái** (collapsible).
- **Dashboard**: KPI cards (doanh thu hôm nay, booking hôm nay, tỉ lệ lấp đầy, rating), biểu đồ doanh thu 30 ngày, top khách hàng.
- **Venues list** → click vào edit (form tab Info / Sân con / Bảng giá / Ảnh / Giờ mở cửa / Đóng cửa tạm thời).
- **Bookings**: lịch theo tuần (giống Google Calendar), kéo-thả để đổi giờ (UI only).
- **Reports**: 2 chart (revenue line, occupancy heatmap), top customers, breakdown theo cổng thanh toán. Export CSV.
- **Payout**: card pending balance + bank account info + history table.
- **Staff**: list nhân viên + nút "Mời staff" + assign theo venue, role MANAGER/STAFF.
- **Walk-in**: form 1 trang để OWNER nhập booking thủ công cho khách offline.
- **Settings**: cancel policy override + commission preview + notification rules.

### 4.8. Staff portal — STAFF vs MANAGER

Layout đơn giản — top bar có badge `STAFF` (cam) hoặc `MANAGER` (tím) + venue name + logout, không có sidebar.

Role lấy từ URL `?role=manager` (demo). Hook `lib/use-staff-role.ts` (gọi `useSearchParams()`) + helper `withRole(path, role)` để preserve qua các Link.

**Common cho cả 2 role**:
- **Today** (`/staff`): list booking trong ngày, **nút QR scan to ở header**, stats (đang chơi / sắp đến / đã xong).
- **Schedule** (`/staff/schedule`): xem lịch theo ngày, date picker.
- **Booking detail** (`/staff/bookings/[id]`): read-only + nút Check-in (mở scanner) khi CONFIRMED.

**Chỉ MANAGER có thêm**:
- Top nav extra 3 mục: **Doanh thu · Nhân viên · Giá tạm thời**
- Today page: card gradient tím "Doanh thu hôm nay" + 4th KPI "Lấp đầy" + 3 quick action button (Sửa giá / Quản lý nhân viên / Đóng cửa khẩn cấp) + nút "Huỷ" trên booking row
- **`/staff/revenue`**: 4 KPI + biểu đồ doanh thu theo giờ + 7 ngày + phân bố theo sân
- **`/staff/team`**: table đội ngũ tại venue (read-only — chỉ Owner mới mời/xoá)
- **`/staff/pricing`**: list override giá tạm thời + form tạo (sân + khung giờ + giá + lý do)
- Page MANAGER-only, nếu STAFF truy cập → render `<AccessDenied />` component
- Demo: dưới header có 2 chip switch nhanh STAFF ↔ MANAGER

**Quyền cụ thể**:
| Action | STAFF | MANAGER |
|---|:-:|:-:|
| QR check-in | ✓ | ✓ |
| Tạo walk-in booking | ✓ | ✓ |
| Đánh dấu no-show | ✓ | ✓ |
| Xem doanh thu venue | — | ✓ |
| Sửa giá tạm thời (override) | — | ✓ |
| Huỷ booking đã CONFIRMED | — | ✓ |
| Xem đội ngũ cùng venue | — | ✓ |
| Mời/xoá staff khác | — | — (Owner) |

### 4.9. Admin area
- Sidebar màu tím để phân biệt với owner.
- **Overview** (`/admin`): KPI GMV, # booking, # user mới, top venue, payment split %.
- **Venues** (`/admin/venues`): approval queue venue PENDING → preview + Approve/Reject.
- **Users** (`/admin/users`): table user với search, filter role/status, bulk actions (suspend/restore/delete).
- **Disputes** (`/admin/disputes`): khiếu nại từ user/owner, chi tiết booking, action: refund manual / dismiss / escalate.
- **Vouchers** (`/admin/vouchers`): list voucher toàn cục, CRUD với scope (GLOBAL/VENUE/SPORT).
- **Reports** (`/admin/reports`): tổng quan nền tảng — GMV theo tháng/quận/sport, churn, conversion. Export CSV.
- **Audit log** (`/admin/audit`): timeline mọi action nhạy cảm (role change, refund manual, venue approve...).

### 4.10. Super Admin
Chỉ SUPER_ADMIN xem được. Hiển thị badge "SUPER ADMIN" trong header.
- **System settings** (`/admin/system/settings`): commission % default, cancel policy default JSON, payout schedule (weekly/monthly), VAT %.
- **Role management** (`/admin/system/roles`): list admin, nút "Cấp quyền admin" cho user, demote.
- **Feature flags** (`/admin/system/feature-flags`): toggle on/off feature per environment.

## 5. Components dùng chung

### UI primitives (`components/ui/`)
- `button` (variant: default/outline/ghost/destructive, size: sm/md/lg)
- `card`
- `input`, `textarea`, `select`
- `badge`
- `avatar`
- `tabs`
- `dialog` (modal)
- `sheet` (mobile drawer)
- `dropdown-menu`
- `popover`
- `tooltip`
- `skeleton`
- `toast`/`sonner`
- `confirm` — confirm dialog dùng chung. Mount `<ConfirmProvider>` ở root (qua `<Providers>` trong [components/providers.tsx](../frontend/src/components/providers.tsx)). API: `const confirm = useConfirm(); const ok = await confirm({ title, description?, confirmText?, cancelText?, tone?, requireText? })`. 4 tone (default/destructive/warning/info) với icon + màu nút phù hợp. Hỗ trợ `requireText` — yêu cầu user gõ chuỗi xác nhận cho action không thể undo.
- `pagination` — dùng chung cho mọi list/table. Props: `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange`, optional `pageSizeOptions` (default `[10, 20, 50, 100]`), `siblingCount` (default 1), `showFirstLast` (default true), `disabled`. Hiển thị `X – Y / Z bản ghi`, dropdown chọn page size, các nút trang với ellipsis `...`. Đã áp dụng tại 8 trang admin/owner/staff (xem [STATUS.md](STATUS.md#test-accounts-seed)).

### Shared (`components/shared/`)
- `header.tsx`, `footer.tsx`, `mobile-nav.tsx`
- `theme-toggle.tsx`
- `sport-icon.tsx` (map slug → emoji/svg)
- `venue-card.tsx`
- `rating-stars.tsx`
- `price-tag.tsx`

### Venues (`components/venues/`)
- `venue-map.tsx` + `venue-map-inner.tsx` — list view dạng map cho `/venues` (OpenStreetMap qua react-leaflet, dynamic import `ssr:false`).
- `map-picker.tsx` + `map-picker-inner.tsx` — picker để chọn lat/lng (click + drag pin + Geolocation API). Dùng trong form tạo/sửa venue.
- `address-selector.tsx` — cascading dropdown cho địa chỉ Việt Nam, 2 mode: format cũ (Tỉnh/Quận/Xã) và mới sau 7/2025 (Tỉnh/Xã). Source: `provinces.open-api.vn` cache localStorage 30 ngày qua [lib/vn-address.ts](../frontend/src/lib/vn-address.ts).
- `hours-editor.tsx` — 7 dòng ngày trong tuần với time inputs + checkbox "Đóng cửa" + nút "Áp dụng giờ T2 cho cả tuần". Gọi `listHours`/`upsertHours` data layer.
- `images-editor.tsx` — 3 section: **Ảnh** (max 10MB, JPG/PNG/WebP/GIF) + **Video** (max 50MB, MP4/MOV) + **Đã tải lên** (grid hiển thị tất cả). Mỗi section có staging area: chọn file → preview local → click "Tải lên (n)" mới gửi server. Hover thumb trong grid Đã tải lên: nút Sao (đặt primary) + Xoá (xoá file thật trên Supabase Storage qua `key` field).
- `prices-editor.tsx` — chọn sân con từ dropdown → list `PriceRule` + Add/Edit/Delete qua dialog. Day picker 7 nút Cuộn → 7 (CN..T7), time range, giá/slot.

### Supabase Storage upload flow
1. Frontend gọi `POST /uploads/sign` với `{ kind, contentType, sizeBytes }`.
2. Backend `UploadsService.sign()`:
   - `ensureBucket()` — lần đầu sẽ tự `createBucket({ public: true, fileSizeLimit: 50MB })` nếu bucket `SUPABASE_BUCKET` chưa tồn tại (cần `service_role` key)
   - Tạo signed upload URL qua `storage.from(bucket).createSignedUploadUrl(path)` (TTL 5 phút)
3. Frontend `PUT file` thẳng lên `uploadUrl` (Supabase) — backend không bottleneck với file lớn.
4. Frontend lấy `{ url, key }` rồi gọi `POST /venues/owner/:id/images` để link với venue. Backend lưu cả `url` + `key` trong `VenueImage`.
5. Khi xoá: `DELETE /venues/owner/:id/images/:imageId` → backend gọi `supabase.storage.remove([key])` rồi xoá DB row.

Helper: `uploadMedia(file, kind)` trong [lib/data/venues.ts](../frontend/src/lib/data/venues.ts) đóng gói 2 bước (sign + PUT). Mock mode dùng FileReader → data URL để preview offline.

ENV backend cần: `SUPABASE_URL`, `SUPABASE_KEY` (**service_role** secret, không phải anon), `SUPABASE_BUCKET` (mặc định `sports_booking`).

### Booking (`components/booking/`)
- `slot-grid.tsx` (grid khung giờ + trạng thái sẵn / đang giữ / đã đặt)
- `court-picker.tsx`
- `booking-summary.tsx`
- `payment-method-card.tsx`

### Owner (`components/owner/`)
- `sidebar.tsx`
- `revenue-chart.tsx` (đơn giản, SVG sparkline cũng đủ)
- `kpi-card.tsx`

## 6. Trạng thái UI cần xử lý

- Loading: Skeleton (không spinner).
- Empty: ảnh illustration + CTA.
- Error: alert + retry button.
- Pagination: cursor "Xem thêm" (infinite scroll) + traditional cho admin.

## 7. Responsive

- Breakpoints Tailwind default. Mobile-first.
- Mobile: bottom nav cho 4 mục (Khám phá, Booking, Yêu thích, Tài khoản).
- Tablet/Desktop: top header full menu.

## 8. Accessibility

- Mọi component có focus ring rõ.
- Form: label/aria-describedby chuẩn.
- Dialog/Sheet: trap focus + esc to close (Radix lo).
- Contrast ≥ AA.

## 9. SEO

- Server components mặc định.
- Generate metadata cho venue detail (og:image, description).
- Sitemap, robots.txt.

## 10. Cấu trúc thư mục

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                Home
│   ├── (public)/
│   │   └── venues/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── booking/
│   │   ├── new/page.tsx
│   │   └── result/page.tsx
│   ├── (account)/
│   │   └── account/
│   │       ├── layout.tsx
│   │       ├── bookings/page.tsx
│   │       ├── bookings/[id]/page.tsx
│   │       ├── favorites/page.tsx
│   │       └── profile/page.tsx
│   ├── (owner)/
│   │   └── owner/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── venues/page.tsx
│   │       ├── venues/[id]/page.tsx
│   │       └── bookings/page.tsx
│   └── (admin)/
│       └── admin/
│           ├── layout.tsx
│           ├── page.tsx
│           └── venues/page.tsx
├── components/
│   ├── ui/
│   ├── shared/
│   ├── booking/
│   └── owner/
├── lib/
│   ├── utils.ts
│   ├── mock-data.ts
│   └── format.ts
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
