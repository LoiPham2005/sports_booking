# Project Status

> Snapshot trạng thái hiện tại của dự án. Update mỗi khi đã build xong tính năng lớn.

## Tổng quát

| Phần | Hoàn thành | Còn lại |
|---|---|---|
| Backend NestJS | 100% (UI-ready API) | Test, deploy, ENV thật |
| Frontend Next.js | 100% (UI mock) | Nối API |
| Mobile Flutter | 100% (UI mock) | Nối API |
| Backend ↔ Client integration | 0% | Cả 2 phía |

## Backend (NestJS)

### ✅ Đã làm
- **Prisma schema**: 27 models, 16 enums, exclusion constraint chống trùng booking (btree_gist)
- **Migration**: `prisma/migrations/000_init_extensions.sql` — extensions + EXCLUDE
- **Seed**: admin + owner + venue demo
- **Modules** (11):
  - `auth` — JWT + refresh rotation, Google OAuth, OTP, password reset
  - `users` — profile, sessions, favorites, devices
  - `sports` — catalog
  - `venues` — CRUD + search + approve flow
  - `courts` — CRUD + closures
  - `pricing` — rules + overrides + quote engine
  - `bookings` — **quote → hold (Redis 10') → create → cancel → reschedule** với anti-double-booking 2 tầng
  - `payments` — 3 providers (VNPay/MoMo/ZaloPay) với HMAC verify + idempotency + reconcile cron
  - `reviews`, `notifications`, `uploads` (signed S3)
  - `health` (Terminus)
- **Cron jobs**: cancel-expired-bookings, reconcile-pending-payments
- **Tách commission**: tạo `OwnerEarning` khi payment SUCCESS

### ⏳ Chưa làm
- Recurring bookings module (đã có field `recurringGroupId` trong DB nhưng chưa có endpoint)
- Vouchers module (DB có rồi)
- Reports module
- Admin module (chỉ có guard, chưa có endpoints)
- Payout cron + tích hợp ngân hàng
- Realtime WebSocket gateway
- Unit/integration tests
- CI/CD, Docker production

## Frontend (Next.js — web)

### ✅ Pages đã build

**Auth + public** (3 + 3):
- `/login` (5 demo chip role), `/register`, `/forgot-password`
- `/` Home, `/venues` search + filter, `/venues/[id]` detail với **BookingMatrix** (court × hour + axis toggle)

**Customer** (5 pages):
- `/account/bookings` (3 tab), `/account/bookings/[id]` (QR), `/account/favorites`, `/account/profile`, `/account/notifications`, `/account/settings`
- `/booking/new` (2-step), `/booking/result`

**Owner** (9 pages):
- `/owner` dashboard, `/owner/venues`, `/owner/venues/[id]` (5 tabs)
- `/owner/bookings` (week calendar)
- `/owner/reports`, `/owner/payout`, `/owner/staff` (invite + table), `/owner/walk-in`, `/owner/settings`

**Staff portal** (3 + 3 manager-only):
- Common: `/staff` today + revenue card (manager), `/staff/schedule`, `/staff/bookings/[id]`
- **Manager-only**: `/staff/revenue`, `/staff/team`, `/staff/pricing` (override giá)
- Phân quyền qua hook `useStaffRole()` đọc `?role=manager` URL param

**Admin** (7 pages):
- `/admin` overview, `/admin/venues` approval, `/admin/users`, `/admin/disputes`, `/admin/vouchers`, `/admin/reports`, `/admin/audit`

**Super Admin** (3 pages):
- `/admin/system/settings` (commission %, cancel policy)
- `/admin/system/roles` (promote/demote admin)
- `/admin/system/feature-flags` (per env toggle)

### ⏳ Chưa làm
- Notifications page chi tiết (đã có /account/notifications nhưng thiếu group theo ngày)
- Map view trên `/venues` (hiện là placeholder)
- Real-time booking calendar update (cần WebSocket)
- Dark mode toggle UI (theme đã chuẩn bị trong globals.css)
- i18n EN
- Mobile responsive cho admin/owner portals (hiện ưu tiên desktop)

## Mobile (Flutter)

### ✅ Đã build

**Common**:
- Splash, Onboarding (3 slide), Login (5 demo chip), Register, Forgot password

**Customer** (gom vào `features/customer/`):
- Main shell BottomNavigationBar 4 tab
- Home tab (greeting, search, promo banner, sport chips, venue list)
- Venues search + Venue detail với **BookingMatrix** (axis toggle Giờ↓·Sân→ ↔ Sân↓·Giờ→)
- Booking flow (2-step) + Result + Detail (QR code)
- Account tab + Favorites + Notifications + Profile + Settings

**Owner**:
- Shell 4 tab (Tổng quan / Lịch / Booking / Tài khoản)
- 8 pages: overview, calendar week, bookings list filter, account, **venue create**, venue edit (4 tabs), booking detail, walk-in, payout, reports, **staff list + invite**, QR scan

**Staff** (3 hoặc 4 tabs tùy role):
- Common: Today, Schedule, Account, QR scan, Booking detail
- **Manager-only**: Tab Revenue + Pricing page + Team page
- Phân quyền qua `DemoState.instance` (ChangeNotifier singleton trong `shared/mock/demo_state.dart`)

### ⏳ Chưa làm
- Dark mode toggle UI (theme đã chuẩn bị trong AppTheme.dark())
- Realtime WebSocket cho lịch booking
- Push notifications (FCM) thực
- Camera scanner thật (hiện là `QrScannerPlaceholder` với animation scan line)
- i18n EN
- Tablets layout (chỉ test trên phone)

## Tích hợp / Backend connection

❌ Chưa làm gì cả. Cả frontend lẫn mobile đều chạy 100% mock data.

> 📋 **Trước khi bắt đầu nối**: Đọc [API_INTEGRATION.md](API_INTEGRATION.md) — mapping field-by-field UI ↔ DB + checklist đầy đủ. Có drift được liệt kê (BookingStatus 5↔9, Court không có `pricePerHour` trong DB, VenueMember thiếu `inviteStatus/joinedAt`, single `image` vs `VenueImage[]`...).

### Khi sẵn sàng nối API

**Web**:
1. Tạo `lib/api/` với fetcher + types từ Prisma
2. Viết adapters (xem [API_INTEGRATION.md § 13](API_INTEGRATION.md#13-adapter-layer-khuyến-nghị))
3. Replace `import { VENUES } from '@/lib/mock-data'` → `await fetch('/venues')`
4. Thêm `middleware.ts` đọc JWT cookie, redirect role
5. Bỏ 5 demo chip ở login

**Mobile**:
1. `flutter pub add dio retrofit json_serializable freezed flutter_secure_storage`
2. Tạo `lib/data/` với services + repositories + adapters
3. Thay `MockData.x` → `FutureBuilder<List<Venue>>(future: venuesRepo.list())`
4. Thêm Riverpod hoặc Bloc nếu cần state phức tạp
5. Bỏ `DemoState`, đọc role từ JWT

**Schema cần bổ sung trước**: xem [API_INTEGRATION.md § 14](API_INTEGRATION.md#14-checklist-khi-nối-api) — `VenueMember.inviteStatus`, `Booking.handledByUserId`, endpoint denormalize cho Venue/Sport...

## Roadmap đề xuất

### Phase 2 (3-4 tuần)
1. Backend production-ready: tests, ENV thật, deploy Docker
2. Nối Mobile + Web với API
3. Test luồng đặt-thanh-toán end-to-end với sandbox VNPay/MoMo/ZaloPay

### Phase 3 (2 tuần)
1. Recurring bookings module
2. Vouchers module + UI Customer apply voucher
3. Realtime WebSocket
4. Push notifications FCM (mobile)

### Phase 4 (2 tuần)
1. Reports + Analytics backend
2. Payout cron + bank integration
3. Admin module endpoints
4. Audit log viewer

### Polish
- Dark mode toggle
- i18n EN
- Map view venue
- Tablet layout
- A11y check
