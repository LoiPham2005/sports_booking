# Project Status

> Snapshot trạng thái hiện tại của dự án. Update mỗi khi đã build xong tính năng lớn.

## Tổng quát

| Phần | Hoàn thành | Còn lại |
|---|---|---|
| Backend NestJS | 100% (UI-ready API) | Test, deploy, ENV thật |
| Frontend Next.js | 100% (UI mock) | Nối API |
| Mobile Flutter | 100% (UI mock) | Nối API |
| Backend ↔ Client integration | ✅ **100% — All 7 phases done** | Mobile API integration (sau roadmap) |

## Backend (NestJS)

### ✅ Đã làm
- **Prisma schema**: 27 models, 16 enums, exclusion constraint chống trùng booking (btree_gist)
- **Migration**: `prisma/migrations/000_init_extensions.sql` — extensions + EXCLUDE
- **Seed**: đầy đủ test account 5 role + 1 venue cầu lông demo + 6 venue HCM cho map. Manager/Staff đã có `VenueMember` ACTIVE gắn với venue demo. Xem [§ Test accounts](#test-accounts-seed) bên dưới.
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

**Super Admin** (4 pages):
- `/admin/system/settings` (commission %, cancel policy)
- `/admin/system/roles` (promote/demote admin)
- `/admin/system/permissions` (matrix tích chọn permission × role, lưu theo từng role)
- `/admin/system/feature-flags` (per env toggle)

### ⏳ Chưa làm
- **Admin broadcast notifications** — viết thông báo gửi all user / theo role / theo city. Schema `Notification` đã có; cần `POST /admin/notifications/broadcast` + UI form. (Owner cũng cần `/owner/notifications/send` để gửi cho khách của venue mình.)
- Real-time booking calendar update (cần WebSocket)
- Dark mode toggle UI (theme đã chuẩn bị trong globals.css)
- i18n EN
- Mobile responsive cho admin/owner portals (hiện ưu tiên desktop)
- Multi-booking single-payment: hiện chọn N slot rời rạc → backend tạo N booking + N payment riêng. Cần endpoint merge thanh toán nếu muốn 1 transaction cho nhiều slot.

## Mobile (Flutter)

### ✅ Đã build

**Common**:
- Splash, Onboarding (3 slide), Login (5 demo chip), Register, Forgot password

**Customer** (gom vào `features/customer/`):
- Main shell BottomNavigationBar 4 tab
- Home tab (greeting, search, promo banner, sport chips, venue list)
- Venues search + Venue detail với **BookingMatrix** (axis toggle Giờ↓·Sân→ ↔ Sân↓·Giờ→)
- **Venues map view** (`/venues/map`) — OpenStreetMap full-screen: custom pin marker theo môn, search + filter + draggable bottom sheet + selected card, my-location, "tìm trong khu vực" pill khi pan
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

### ✅ Phase 0 — Foundation (đã xong)

**Backend** (`backend/src/`):
- `common/interceptors/decimal-serializer.interceptor.ts` — convert `Decimal` → `number` recursive cho mọi response, registered globally trong `main.ts`
- `main.ts` CORS update — reflect origin trong dev, allow credentials, expose headers `Content-Type / Authorization / Idempotency-Key`
- `modules/auth/auth.controller.ts` — login/register/refresh/logout/google-callback đều set/clear cookie `sb_access` (15') + `sb_refresh` (30d), `httpOnly + sameSite`
- `modules/auth/strategies/jwt.strategy.ts` — extract JWT từ Authorization header HOẶC cookie `sb_access` (cho Next.js web)
- `modules/auth/auth.service.ts` — export `AuthResult` interface
- `.env.example` — thêm `CORS_ORIGINS=http://localhost:3001`

**Frontend** (`frontend/`):
- `lib/api/config.ts` — `API_BASE`, `USE_MOCK`, cookie names
- `lib/api/errors.ts` — `ApiError` class (RFC 7807 style)
- `lib/api/types.ts` — DTO types mirror Prisma schema (enums + entities)
- `lib/api/client.ts` — fetch wrapper với auto-refresh trên 401, timeout 15s, idempotency key, server-side cookie passthrough
- `lib/api/adapters/{status,venue,booking,user}.ts` — map DTO → UI types
- `lib/api/endpoints/{auth,sports}.ts` — typed endpoint helpers (Phase 0 chỉ làm 2 endpoint cơ bản để smoke test)
- `middleware.ts` — decode JWT từ cookie, redirect `/login` khi chưa auth, redirect home khi sai role
- `.env.local.example` — `NEXT_PUBLIC_API_BASE` + `NEXT_PUBLIC_USE_MOCK`

### 🧪 Cách test Phase 0

```bash
# Terminal 1 — backend
cd backend
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev

# Terminal 2 — smoke test cookie + Decimal
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@sportsbooking.local","password":"admin@1234"}'
# → response phải có Set-Cookie: sb_access=...; HttpOnly, sb_refresh=...
# → JSON body có total/amount là number không phải string

# Terminal 3 — frontend
cd frontend
cp .env.local.example .env.local
# sửa NEXT_PUBLIC_USE_MOCK=false để test API thật
npm install
npm run dev
# → mở localhost:3001, /login đang dùng mock chip (chưa nối API ở UI — Phase 1)
```

### ✅ Phase 1 — Auth + Customer Read (đã xong)

**Backend** (`backend/src/modules/`):
- `venues/venues.service.ts` — enhance `search()` + `detail()`: denormalize `sports[]`, `priceFrom` (MIN PriceRule), `amenities[]` flat, `distance` (Haversine khi có lat/lng), nested `images/courts/reviews/hours` cho detail. Hỗ trợ tra cứu bằng `id` cuid hoặc `slug`
- `venues/dto/venue.dto.ts` — thêm `sortBy: rating | newest`
- `sports/sports.service.ts` — `list()` aggregate `count` (số venue APPROVED có court của môn) qua `$queryRaw` GROUP BY

**Frontend** (`frontend/`):
- `lib/api/endpoints/venues.ts` — `venuesApi.list()`, `venuesApi.detail()` trả `UiVenue` / `UiVenueDetail` đã adapter
- `lib/data/venues.ts` — wrapper chọn mock vs API qua `USE_MOCK`, dùng được ở server component
- `app/(auth)/login/page.tsx` — convert thành client component + form submit qua `authApi.login`, redirect theo role, demo chip 5 role chỉ hiện khi `USE_MOCK=true`
- `app/(auth)/register/page.tsx` — wire `authApi.register`, validate fullName + email/phone + password ≥8 + agree terms
- `app/(auth)/forgot-password/page.tsx` — 2-step: request OTP → reset password
- `app/page.tsx` — async server component fetch `listSports()` + `listVenues({ limit: 6, sortBy: 'rating' })`
- `app/(public)/venues/page.tsx` — client component với filter sport/q/sortBy reactive, debounce search 300ms, loading skeleton, empty state
- `app/(public)/venues/[id]/page.tsx` — async server component fetch `getVenue(id-or-slug)`, hiển thị courts thật + amenities + description
- `app/layout.tsx` — mount `<Toaster>` (sonner) ở root

### 🧪 Test Phase 1

```bash
# 1. Backend (cần Docker + Postgres + Redis chạy):
cd backend
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 2. Frontend với mock (giữ UI cũ):
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_USE_MOCK=true  → mock như cũ, login 5 chip
npm run dev

# 3. Frontend với API thật:
# Sửa .env.local: NEXT_PUBLIC_USE_MOCK=false
# - /login → form gọi POST /auth/login, redirect theo role
# - / + /venues + /venues/[id] → fetch từ /api/v1/venues
# - 5 demo chip biến mất, middleware chặn /owner /admin khi chưa login
```

### ✅ Phase 2 — Booking + Payment (đã xong code)

**Backend** — verify đã có đủ:
- `POST /bookings/quote` (hold 10' Redis + price)
- `POST /bookings` (create từ holdToken)
- `POST /payments` (return redirectUrl/qrData)
- `GET /payments/:id` (poll status)
- `POST /bookings/:id/cancel` (refund auto theo cancel policy)
- `payments.controller.ts` — đổi redirect sau IPN từ `/payments/result` → `/booking/result` để khớp UI

**Frontend** (`frontend/`):
- `lib/api/endpoints/bookings.ts` — `quote`, `create`, `detail`, `mine`, `cancel`
- `lib/api/endpoints/payments.ts` — `create`, `detail` (poll)
- `lib/api/endpoints/pricing.ts` — `quote` (preview giá, không hold)
- `lib/data/bookings.ts` — wrapper mock/API cho `listMyBookings`, `getMyBooking`, `cancelBooking`
- `app/booking/new/page.tsx` — refactor full: client component, parse URL `?venue=&date=&slots=courtId:HH:MM,HH:MM`, on-mount gọi `bookingsApi.quote()` để hold + lấy price + token, **hold timer countdown 10' live**, auto redirect khi hết giờ, step 1 review + notes, step 2 chọn provider → `bookingsApi.create()` → `paymentsApi.create()` → redirect `redirectUrl` (VNPay/MoMo) hoặc đi `/booking/result?paymentId=...` (ZaloPay/poll)
- `app/booking/result/page.tsx` — 4 state (loading/pending/success/fail): mock fallback, parse `?code=&status=` từ backend redirect, **poll `paymentsApi.detail(id)` mỗi 3s, max 60s** rồi đi `pending` state với nút "Làm mới"
- `app/(account)/account/bookings/[id]/page.tsx` — client component fetch `getMyBooking`, hiển thị status + refund + cancelReason, **cancel inline confirm card** với policy 24h/12h, refetch sau cancel

### 🧪 Test Phase 2

```bash
# Cần ngrok cho webhook (sandbox VNPay/MoMo/ZaloPay):
ngrok http 3000
# Update env backend: VNPAY_RETURN_URL=https://xxxx.ngrok.io/api/v1/payments/return/vnpay
# (tương tự cho MoMo + ZaloPay webhook URLs)

# Smoke test trên localhost:
# 1. Login → /venues/[id] chọn slot trên matrix → click "Tiếp tục thanh toán"
# 2. /booking/new tự gọi quote → countdown 10:00 hiện trên header
# 3. Chọn VNPay → "Thanh toán X" → redirect vnpayment.vn sandbox
# 4. Hoàn tất sandbox → backend nhận IPN → set Booking.status = CONFIRMED
# 5. Backend redirect về /booking/result?provider=vnpay&orderId=&code=00
# 6. UI nhận code=00 → render success ngay
# 7. /account/bookings/[id] → "Huỷ booking" → confirm card → API call cancel → refresh
```

### ✅ Phase 3 — Customer Account (đã xong)

**Backend** — verify đã có đủ endpoints (`/me/*` + `/bookings/mine`):
- `GET /me`, `PATCH /me` (profile)
- `GET /me/favorites`, `POST/DELETE /me/favorites/:venueId`
- `GET /me/notifications`, `POST /me/notifications/:id/read`
- `GET /bookings/mine` (đã có từ Phase 2)

**Frontend** (`frontend/`):
- `lib/api/endpoints/users.ts` — `me`, `updateMe`, `favorites`, `addFavorite`, `removeFavorite`
- `lib/api/endpoints/notifications.ts` — `list`, `markRead` + `UiNotification` type + `toUiNotification` adapter
- `lib/data/users.ts` — wrapper mock/API cho profile + favorites + notifications, có mock state in-memory cho toggle favorite + mark read khi `USE_MOCK=true`
- `app/(account)/account/bookings/page.tsx` — client component fetch `listMyBookings`, group 3 tab (Sắp tới/Hoàn thành/Đã huỷ), gom `CANCELLED + NO_SHOW + REFUNDED` thành tab "Đã huỷ"
- `app/(account)/account/favorites/page.tsx` — client component fetch `listFavorites`, nút heart inline để bỏ favorite + optimistic update + empty state
- `app/(account)/account/profile/page.tsx` — fetch `getMe`, form patch `fullName + dob` (email/phone read-only — cần admin đổi), avatar fallback initials
- `app/(account)/account/notifications/page.tsx` — fetch `listNotifications`, click 1 item tự mark read (optimistic), nút "Đánh dấu đọc hết" gọi `Promise.all`, format thời gian tương đối (phút/giờ/ngày)

### 🧪 Test Phase 3

```bash
# Backend cần seed user demo (admin@sportsbooking.local hoặc tạo customer mới qua /auth/register)
# Frontend NEXT_PUBLIC_USE_MOCK=false → login với customer → vào /account/*
```

### ✅ Phase 4 — Owner (đã xong)

**Backend schema migration** (`prisma/schema.prisma` — chạy `npx prisma migrate dev --name phase4_owner`):
- `VenueMember`: thêm `email`, `inviteStatus` (enum `VenueMemberStatus`: PENDING/ACTIVE/SUSPENDED/REMOVED), `inviteToken`, `inviteExpiresAt`, `createdAt`, `acceptedAt`. `userId` đổi sang nullable (cho invite trước khi user accept)
- `Booking`: thêm `handledByUserId`, `refusedAt`, `refuseReason`

**Backend module mới** (`src/modules/owner/`):
- `owner.service.ts` — dashboard (KPI tổng aggregate revenue/occupancy/top customers + revenue 7 ngày qua `$queryRaw`), submit venue, list bookings, **walk-in** (CONFIRMED + source=WALK_IN), **refuse** (chỉ trong 5' sau tạo, CANCELLED_BY_OWNER + refund 100%), staff list/invite/update/remove, **acceptInvite**, reports (group by day/week/month + payment breakdown), payout summary + request (tạo Payout đè vào OwnerEarning pending)
- `owner.controller.ts` — `@Roles(OWNER, ADMIN, SUPER_ADMIN)` + `StaffInviteController` cho accept link
- `owner.module.ts` đăng ký vào `app.module.ts`

**Frontend** (`frontend/`):
- `lib/api/endpoints/owner.ts` — types đầy đủ + `ownerApi` (dashboard, bookings, walkIn, refuseBooking, listVenues, staff, inviteStaff, updateStaff, removeStaff, reports, payoutSummary, requestPayout, submitVenue)
- `lib/data/owner.ts` — wrapper mock/API cho mọi hàm, có in-memory state cho staff invite/remove khi mock
- `app/(owner)/owner/page.tsx` — dashboard với 4 KPI + revenue chart 7 ngày + top customers + recent bookings (server data, fallback mock)
- `app/(owner)/owner/venues/page.tsx` — list owned venues
- `app/(owner)/owner/bookings/page.tsx` — **danh sách booking theo ngày** (đơn giản hơn calendar grid để Phase 4.5 polish), filter venue, nút "Từ chối" inline (gọi `refuseBooking` — backend enforce 5' window)
- `app/(owner)/owner/walk-in/page.tsx` — form đầy đủ: chọn venue/court/date/slots/hourlyRate, hiển thị customer info optional, tự tính range startsAt/endsAt từ slots, gọi `createWalkIn`
- `app/(owner)/owner/reports/page.tsx` — chart series theo bucket + payment breakdown bar, switch groupBy (day/week/month)
- `app/(owner)/owner/payout/page.tsx` — pending balance card với gradient + bank account + history + nút "Yêu cầu chuyển ngay" gọi `requestPayout`
- `app/(owner)/owner/staff/page.tsx` — table staff với invite modal inline (email + role + venue), suspend/unsuspend toggle, remove confirm, search filter, status badge

### 🧪 Test Phase 4

```bash
# 1. Migrate schema:
cd backend
npx prisma migrate dev --name phase4_owner

# 2. Đăng nhập với role OWNER:
# Seed file đã có owner@sportsbooking.local / owner@1234
# Hoặc /admin/users → promote 1 user lên OWNER role

# 3. Vào /owner — verify dashboard load + KPI hiện tại
# 4. /owner/walk-in → tạo booking thử
# 5. /owner/staff → invite test@email.com role STAFF
```

### ✅ Phase 5 — Staff + Manager (đã xong)

**Backend module mới** (`src/modules/staff/`):
- `staff.service.ts` — auto-scope theo `VenueMember.userId + inviteStatus=ACTIVE`, không dùng `@Roles()` decorator. Manager-only endpoints có `assertManager` check `role=MANAGER` cho venueId cụ thể.
  - `memberships()`, `today()`, `schedule()`, `checkIn()`, `revenue()`, `team()`, `listOverrides()`, `createOverride()`, `deleteOverride()`, `acceptInvite()`
  - `revenue()`: aggregate doanh thu hôm nay + byHour (`EXTRACT(hour)`) + byCourt (GROUP BY)
  - `checkIn()`: chấp nhận cả `checkInToken` lẫn `code`, set `status=CHECKED_IN + checkedInAt + handledByUserId`
- `staff.controller.ts` — 9 routes:
  - `GET /staff/memberships`, `GET /staff/today`, `GET /staff/schedule`, `POST /staff/check-in`
  - Manager: `GET /staff/revenue`, `GET /staff/team`, `GET/POST/DELETE /staff/pricing/overrides`
- Registered trong `app.module.ts`

**Frontend**:
- `lib/api/endpoints/staff.ts` — types đầy đủ + `staffApi` (memberships, today, schedule, checkIn, revenue, team, listOverrides, createOverride, deleteOverride)
- `lib/data/staff.ts` — wrapper mock/API cho mọi hàm, in-memory state cho overrides + memberships khi mock
- `lib/use-staff-role.ts` — **refactor**: vẫn đọc `?role=manager` URL khi `USE_MOCK=true`, **fetch `getMyMemberships()` rồi check `MANAGER` role** khi `USE_MOCK=false`. `withRole()` chỉ no-op khi không mock.
- `app/(staff)/staff/page.tsx` — Today: fetch real bookings, **check-in trực tiếp** từ row (gọi `checkInBooking(token)`), revenue card chỉ Manager
- `app/(staff)/staff/schedule/page.tsx` — date picker + shift ±1 ngày, gọi `getStaffSchedule({ date, days: 1 })`
- `app/(staff)/staff/bookings/[id]/page.tsx` — fetch real booking via `bookingsApi.detail`, nút Check-in, **đã sửa luôn lỗi `Sticky` → `StickyNote`** (lucide-react)
- `app/(staff)/staff/revenue/page.tsx` — hourly bar chart từ `getRevenue().byHour`, court distribution từ `byCourt`
- `app/(staff)/staff/team/page.tsx` — fetch real team từ `getTeam()`, view-only (Owner mới CRUD)
- `app/(staff)/staff/pricing/page.tsx` — **list + create + delete overrides**: form 6 field (courtId/date/start/end/price/reason), call `createOverride()`, optimistic delete

### 🧪 Test Phase 5

```bash
# 1. Cần data: 1 user là VenueMember role MANAGER + 1 user role STAFF (Owner invite từ Phase 4 → user accept invite)
# 2. Đăng nhập user STAFF → vào /staff
# 3. Booking CONFIRMED → click "Check-in" → status đổi sang CHECKED_IN
# 4. Đăng nhập user MANAGER → /staff/revenue + /staff/team + /staff/pricing có data
# 5. STAFF (không phải MANAGER) → vào /staff/revenue → AccessDenied + 403 từ backend
```

> 📋 **Trước khi bắt đầu nối**:
> - Đọc [API_INTEGRATION.md](API_INTEGRATION.md) — mapping field-by-field UI ↔ DB + checklist
> - Đọc [API_INTEGRATION_PLAN.md](API_INTEGRATION_PLAN.md) — roadmap 8 phase, thứ tự role, backend gaps, timeline ~38 ngày

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
- Tablet layout
- A11y check

### ✅ Đã xong gần đây
- **RBAC permission enforce end-to-end** — trước đây UI cho admin tick/untick nhưng backend không check (decorative). Đã hoàn thiện:
  - **Backend cache**: `PermissionsService.hasPermission()` dùng `Map<Role, Set<string>>` in-memory, `loadCache()` lazy, `invalidateCache()` khi `updateRolePermissions` → O(1) không hit DB mỗi request.
  - **Endpoint `GET /me/permissions`** ([users.controller.ts](../backend/src/modules/users/users.controller.ts)) — user query keys của role mình. SUPER_ADMIN tự động trả toàn bộ.
  - **`PermissionsGuard` register global** trong [app.module.ts](../backend/src/app.module.ts) cùng cấp `JwtAuthGuard` + `RolesGuard` → mọi route có `@RequirePermission('key')` đều enforce tự động.
  - **Áp `@RequirePermission` vào endpoints**: AdminController (8 routes: venue list/approve/reject/suspend, user list/suspend, dispute, report, audit), VouchersController (create/update/delete).
  - **Frontend hook**: [`useMyPermissions()` + `useHasPermission(key)`](../frontend/src/lib/use-permissions.ts) — cache module-level (1 fetch/tab lifetime), mock-aware (khớp `MOCK_PERMISSIONS` map với seed backend), SUPER_ADMIN trả `Set(['*'])` match-all, `clearPermissionsCache()` auto khi logout.
  - **Sidebar admin filter theo permission**: NAV items có `permission?: string` optional, render `visibleNav` (filter `useMyPermissions`). Khi user bị thu hồi quyền → menu tương ứng tự ẩn (vd ADMIN không có `voucher.create` → menu "Voucher" biến mất).
- **Permissions page redesign** ([/admin/system/permissions](../frontend/src/app/(admin)/admin/system/permissions/page.tsx)) — bỏ matrix cũ 5 nút Lưu, thay bằng: 5 card overview với progress bar + toggle switches + category collapsible với nút bật/tắt cả group (tri-state ✓/~/○) + search bar + floating save bar (sticky bottom) lưu tất cả role dirty 1 click. SUPER_ADMIN locked icon rõ ràng.
- **DatePicker / DateRangePicker dùng chung** — [components/ui/date-picker.tsx](../frontend/src/components/ui/date-picker.tsx). Lịch tháng 7×6 grid, format VN `DD/MM/YYYY`, RangePicker có preset 7/30/90 ngày qua + click 2 lần để set from→to, highlight range. Thay native `<input type="date">` xấu.
- **Admin Reports wired API + UI** ([/admin/reports](../frontend/src/app/(admin)/admin/reports/page.tsx)) — backend rewrite raw SQL → Prisma client (typesafe, aggregate in-memory, dùng `createdAt` thay `startsAt`, group theo ngày VN UTC+7). Frontend fillMissingDays để chart 30 cột thay vì 1 cột. DateRangePicker filter dynamic.
- **Venue Detail page full wire** ([/venues/[id]](../frontend/src/app/(public)/venues/[id]/page.tsx)) — gallery dùng `venue.images[]` thật (fallback 5 ảnh Unsplash khi rỗng, badge "Ảnh minh hoạ"), reviews thật từ `GET /venues/:id/reviews` với sort `recent/rating` + distribution chart, hours render 7 ngày từ `GET /venues/:id/hours`, location tab dùng Leaflet marker thật, Favorite button wired `POST/DELETE /me/favorites/:id` với optimistic update + yêu cầu login, Share button dùng `navigator.share()`.
- **BookingMatrix wired availability API** — `GET /venues/:id/availability?date=YYYY-MM-DD` trả matrix `courts × slots` với price + status thật (available/booked/held/closed). Frontend tự fetch khi đổi ngày, cell hiện giá real từ PriceRule, support chọn slot rời rạc (non-consecutive). Mock mode gen pseudo-random deterministic status.
- **Booking review trang `/booking/new`** — liệt kê từng slot user chọn với giá riêng, sum tổng chính xác (trước tính sai bằng cách lấy range first→last × giá). CTA "Tiếp tục thanh toán" / "Thanh toán" giờ nằm trong sidebar Tóm tắt (desktop) thay vì cuối content.
- **Payment flow hoàn thiện**:
  - **MoMo** đổi `requestType` từ `captureWallet` (chỉ QR) → `payWithMethod` (AIO: chọn ví/ATM/Visa)
  - **Return handler** `/payments/return/momo` + `/payments/return/zalopay` giờ gọi `handleCallback()` để verify chữ ký + update `Payment.status=SUCCESS` + `Booking.status=CONFIRMED` + tạo `OwnerEarning` (trước chỉ redirect)
  - **MoMo/VNPay credentials missing** → throw `ServiceUnavailableException` (HTTP 503) với message tiếng Việt rõ ràng thay vì 500 mơ hồ
  - **ENV path fix**: `MOMO_RETURN_URL`, `VNPAY_RETURN_URL`, `ZALOPAY_REDIRECT_URL`, `GOOGLE_CALLBACK_URL` thêm prefix `/api/v1`
  - **FE bỏ truyền `returnUrl`** trong POST `/payments` → để backend dùng env config trỏ về backend handler (đảm bảo verify + update DB trước khi FE thấy result)
- **Auth-aware Header** ([components/shared/header.tsx](../frontend/src/components/shared/header.tsx)) — render khác nhau theo trạng thái login: chưa login hiện "Đăng nhập / Đăng ký", đã login hiện avatar + tên + nút LogOut + Heart + Bell. Hook `useCurrentUser()` ([lib/use-current-user.ts](../frontend/src/lib/use-current-user.ts)) listen `storage` event + custom `auth-changed` event để sync cross-tab + sau khi login/logout.
- **Quick-login chips ở `/login` work cho cả mock + API mode** — mock: setMockUser → localStorage, API: gọi `POST /auth/login`. Có badge ở góc phải chỉ rõ "mock — chuyển trang" hoặc "gọi API thật".
- **Cookie expired UX** — client.ts khi refresh fail → dispatch `auth-changed` → header tự update sang logged-out. Booking page catch 401 → toast "Phiên hết hạn" + redirect `/login?next=...` để sau login auto-back.
- **Custom Time Picker 24h** ([components/ui/time-picker.tsx](../frontend/src/components/ui/time-picker.tsx)) — popover 2 cột scroll (giờ 00–23 + phút step tuỳ chọn), click cell active highlight + scroll vào view, không phụ thuộc locale browser AM/PM.
- **Price Timeline visual** ([components/venues/price-timeline.tsx](../frontend/src/components/venues/price-timeline.tsx)) — 7 ngày × 24 giờ heat-map. Block giá lerp màu theo giá (xanh = rẻ, đỏ = đắt). Click ô trống → select range qua bottom bar → "Set giá cho khung này" mở dialog prefill day+time. Click block có sẵn → edit. Overlap check cả client + server (PG service).
- **VND input formatting** — input giá tự format `400.000` dấu chấm + suffix `₫`, parse lại số nguyên khi gửi server.
- **Upload ảnh + video tách section** — [images-editor.tsx](../frontend/src/components/venues/images-editor.tsx) refactor thành 3 khối: section "Ảnh" + section "Video" + grid "Đã tải lên". Mỗi section có staging area: chọn file → preview local (qua `URL.createObjectURL`) → click button **"Tải lên (n)"** mới gọi API. Validate type/size client-side trước khi gửi. Video render qua `<video controls>` cho phép play inline.
- **Auto-create Supabase bucket** — `UploadsService.ensureBucket()` chạy 1 lần ở lần upload đầu: gọi `getBucket()` check trước, nếu chưa tồn tại thì `createBucket({ public: true, fileSizeLimit: 50MB })`. Yêu cầu `service_role` key (anon không có quyền tạo bucket).
- **Xoá ảnh/video xoá luôn file trên Supabase** — Schema `VenueImage` thêm field `key String?` để track object path. Khi `deleteImage`: backend gọi `supabase.storage.remove([key])` trước, sau đó mới xoá DB row. Lỗi remove Supabase được catch để không kẹt nếu storage không reach được.
- **Court update không cho đổi sportId** — `UpdateCourtDto` backend không có sportId; frontend strip field này khi gửi `PATCH /owner/courts/:id` + dropdown môn thể thao bị disable khi edit (có note giải thích).
- **Logout button dùng chung** — [components/shared/logout-button.tsx](../frontend/src/components/shared/logout-button.tsx) tái sử dụng cho admin/owner/staff layout. Confirm dialog → call `POST /auth/logout` qua data layer → redirect /login. Fix backend `RefreshDto.refreshToken` thành optional để logout không lỗi 400 khi không gửi body.
- **Quick-login chips ở /login** — 5 chip role (Customer/Owner/Staff/Manager/Admin) click 1 phát login bằng credential seed. API mode call `POST /auth/login` thật; mock mode chỉ redirect. Badge ở góc phải báo mode hiện tại.
- **Venue Hours / Images / Price Rules — full CRUD** — `/owner/venues/[id]` 3 tab cuối giờ wire backend đầy đủ:
  - **Bảng giá**: chọn sân → list/add/edit/delete `PriceRule` qua dialog. Backend mới: `PATCH /owner/price-rules/:id`, `DELETE /owner/price-rules/:id`.
  - **Ảnh**: upload qua **Supabase Storage** với signed URL từ backend, preview grid + xoá. Backend mới: `GET/POST/DELETE /venues/:id/images` (link tới bảng `VenueImage`).
  - **Giờ mở cửa**: 7 ngày trong tuần với time inputs + checkbox "Đóng cửa" + nút "Áp dụng giờ T2 cho cả tuần". Backend mới: `GET /venues/:id/hours`, `PUT /venues/owner/:id/hours` (replace toàn bộ).
  - Refactor `UploadsService` từ AWS S3 SDK sang `@supabase/supabase-js` — dùng signed upload URL, FE upload thẳng lên Supabase Storage bucket `sports_booking`, backend chỉ ghi `MediaAsset` row + URL public.
  - 3 component dùng chung trong `components/venues/`: `hours-editor.tsx`, `images-editor.tsx`, `prices-editor.tsx`.
- **Owner Venue CRUD + Courts CRUD** — [/owner/venues](../frontend/src/app/(owner)/owner/venues/page.tsx) (list + pagination), [/owner/venues/new](../frontend/src/app/(owner)/owner/venues/new/page.tsx) (form full page với map picker + cascading dropdown địa chỉ), [/owner/venues/[id]](../frontend/src/app/(owner)/owner/venues/[id]/page.tsx) (tabs: Thông tin/Sân con + CRUD courts qua Dialog). Backend: `POST /venues/owner`, `PATCH /venues/owner/:id`, `GET /venues/:id/courts`, `POST/PATCH/DELETE /owner/courts/*` — đã có sẵn.
- **Cascading Address Selector** — [components/venues/address-selector.tsx](../frontend/src/components/venues/address-selector.tsx) dùng `provinces.open-api.vn` (cache localStorage 30 ngày). 2 mode: format cũ (Tỉnh → Quận/Huyện → Xã) và mới sau cải cách 7/2025 (Tỉnh → Xã, flatten qua huyện). Auto-convert old → new khi user chọn đủ.
- **Map Picker (OpenStreetMap)** — [components/venues/map-picker.tsx](../frontend/src/components/venues/map-picker.tsx) click để chọn lat/lng, kéo pin tinh chỉnh, nút "Vị trí của tôi" qua Geolocation API.
- **Schema địa chỉ mới** — Venue có thêm `newCity`, `newWard`, `provinceCode`, `wardCode` (cột rõ ràng thay vì JSON, index nhanh). Giữ `city/district/ward` legacy để search backward-compat.
- **Staff Portal sidebar layout** — [staff/layout.tsx](../frontend/src/app/(staff)/staff/layout.tsx) chuyển từ horizontal header sang sidebar trái giống admin: 256px (ẩn dưới `lg`), logo + role badge, link "Về trang chính", section venue đang trực, danh sách nav với icon, demo role switcher (STAFF/MANAGER) ở dưới. Active state tô màu theo role: tím cho MANAGER, cam cho STAFF. Manager-only menu (Doanh thu / Nhân viên / Giá tạm thời) ẩn tự động khi role = staff.
- **`useStaffRole` cache + loading state** — [lib/use-staff-role.ts](../frontend/src/lib/use-staff-role.ts) trả `StaffRole | undefined` (undefined = đang fetch). Module-level cache `cachedRole` + `inFlight` promise → chỉ 1 fetch `/staff/memberships` / tab lifetime (tránh polling khi nhiều page con cùng dùng hook). Auto clear khi logout qua `clearStaffRoleCache()`. Các page manager-only (`revenue/team/pricing`) check `role === undefined` → skeleton; chỉ render AccessDenied khi confirmed `role === 'staff'`.
- **Auth cache + race-free header** — [lib/data/auth.ts](../frontend/src/lib/data/auth.ts) thêm `cachedCurrentUser` set ngay khi login response trả về (qua `setCurrentUserCache`), nên Header không flash "Đăng nhập / Đăng ký" trong lúc chờ `/me`. `getCurrentUser` chỉ trả null khi 401 thật (sau refresh), lỗi network giữ user cũ. [`useCurrentUser`](../frontend/src/lib/use-current-user.ts) seed initial state từ cache để render đúng ngay frame đầu.
- **`useMyPermissions` track user identity** — [lib/use-permissions.ts](../frontend/src/lib/use-permissions.ts) thêm `cachedUserId` để invalidate cache khi đổi user (login lại as role khác → menu sidebar không bị stale). Distinguish `user === undefined` (loading) vs `null` (logged-out) → tránh ẩn hết menu admin khi đang load user.
- **Staff revenue: cast enum + show errors** — [staff.service.ts](../backend/src/modules/staff/staff.service.ts) raw SQL dùng `status::text = ANY(...)` để khớp với `BookingStatus[]` text params (trước báo `operator does not exist: "BookingStatus" = text`). Frontend [staff/revenue/page.tsx](../frontend/src/app/(staff)/staff/revenue/page.tsx) hiện rõ error message thay vì silent catch — 403 hiện "Bạn không có quyền MANAGER ở venue nào".
- **Admin venues suspend/restore UI** — [admin/venues/page.tsx](../frontend/src/app/(admin)/admin/venues/page.tsx) thêm nút theo tab: APPROVED → **Đình chỉ** (confirm), SUSPENDED → **Khôi phục hoạt động** (dùng lại endpoint `approve`). Backend `POST /admin/venues/:id/suspend` đã có sẵn (perm `venue.suspend`), chỉ thiếu UI.
- **Custom DatePicker / TimePicker / Confirm / Prompt thay native ở các form còn lại** — `/staff/schedule` dùng `<DatePicker>` thay `input type="date"`, `/staff/pricing` dùng `<TimePicker24>` thay `input type="time"` (tránh UI AM/PM khó dùng + locale browser khác nhau).
- **Confirm Dialog dùng chung** — [components/ui/confirm.tsx](../frontend/src/components/ui/confirm.tsx) với `useConfirm()` hook + provider ở root. 4 tone (default/destructive/warning/info), hỗ trợ `requireText` cho action nguy hiểm. Đã thay `window.confirm` toàn app: admin logout, court delete, `/admin/venues` (suspend/restore), `/admin/users` (đổi role + đình chỉ user — role ADMIN/SUPER_ADMIN yêu cầu gõ tên role để xác nhận).
- **Prompt Dialog dùng chung** — [components/ui/prompt.tsx](../frontend/src/components/ui/prompt.tsx) với `usePrompt()` hook + `<PromptProvider>` mount cùng cấp với ConfirmProvider. Hỗ trợ `multiline` (textarea), `required`, `maxLength` (đếm ký tự), `placeholder`, `defaultValue`, Enter để submit (1 dòng), Esc/click ngoài để huỷ. Trả `string | null`. Đã thay `window.prompt` tại `/admin/venues` (lý do từ chối) và `/admin/disputes` (ghi chú duyệt/từ chối refund — từ chối là bắt buộc nhập).
- **Disputes có lịch sử** — `/admin/disputes` thêm 3 tab **Đang chờ / Đã duyệt / Đã từ chối**, filter qua `GET /admin/disputes?status=PENDING|SUCCESS|FAILED`. Tab lịch sử ẩn nút thao tác, hiển thị badge trạng thái.
- **Seed disputes** — `prisma/seed.ts` thêm 3 dispute PENDING (VNPAY 700k / MOMO 350k / ZALOPAY 480k) với đầy đủ chuỗi Booking COMPLETED → Payment SUCCESS → Refund PENDING thuộc `customer@gmail.com`. Idempotent qua booking `code` unique.
- **Logout button** — Admin layout có nút Đăng xuất + confirm + call `POST /auth/logout` qua data layer [lib/data/auth.ts](../frontend/src/lib/data/auth.ts) (mock-aware).
- **Toast position** — đổi từ `top-center` → `top-right` ở root layout.
- **Backend scripts mở rộng** — thêm `dev`, `db:push`, `db:seed`, `typecheck`, `format:check`, `lint:check`, `test:cov` vào [backend/package.json](../backend/package.json).
- **Pagination dùng chung** — [components/ui/pagination.tsx](../frontend/src/components/ui/pagination.tsx). Hỗ trợ chọn page size (10/20/50/100), điều hướng trang với ellipsis, nút first/last, hiển thị "X – Y / Z bản ghi". Đã tích hợp client-side slice (mock + API đều OK) tại:
  - **Admin**: `/admin/users`, `/admin/audit`, `/admin/venues`, `/admin/vouchers`, `/admin/disputes`
  - **Owner**: `/owner/bookings`, `/owner/payout` (history), `/owner/staff`
  - **Staff (Manager)**: `/staff/team`
  - Khi backend hỗ trợ `?page=&pageSize=`, chỉ cần bỏ slice và truyền params — không phải đổi UI.
- **Venue Map (web)** — [/venues](../frontend/src/app/(public)/venues/page.tsx) tab "Bản đồ" dùng OpenStreetMap qua `react-leaflet@4` + `leaflet`. Marker emoji theo môn thể thao, popup card, side panel danh sách, auto fit bounds. Hoạt động với cả mock và real API (`UiVenue.lat/lng` được map từ `VenueDto`).
- **RBAC động** — bảng `Permission` + `RolePermission` + UI `/admin/system/permissions` (matrix tích chọn). Decorator `@RequirePermission` + `PermissionsGuard` cho các route khác dùng.
- **Frontend → `src/`** — chuyển `app/`, `components/`, `lib/`, `middleware.ts` vào `src/`. Cập nhật `tsconfig.paths` và `tailwind.config.content`.
- **Seed venue với lat/lng** — `prisma/seed.ts` tạo 7 venue HCM (Phú Mỹ Hưng, Bình Thạnh, Quận 10, Quận 1 Pickleball/Tao Đàn, Thủ Đức, demo cầu lông) để map có data thật ngay sau `npm run prisma:seed`.

## Test accounts (seed)

Chạy `npm run prisma:seed` để tạo/cập nhật toàn bộ. Mọi tài khoản `emailVerified: true`.

| Email | Password | `User.role` | Ghi chú |
|---|---|---|---|
| `super@sportsbooking.local` | `12345678` | `SUPER_ADMIN` | Toàn quyền hệ thống, dùng test `/admin/system/*` |
| `admin@sportsbooking.local` | `12345678` | `ADMIN` | Test các trang `/admin/*` (duyệt venue, voucher, dispute) — KHÔNG có `system/*` |
| `owner@sportsbooking.local` | `12345678` | `OWNER` | Sở hữu 7 venue demo. Test `/owner/*` |
| `manager@sportsbooking.local` | `manager@1234` | `STAFF` | `VenueMember.role = MANAGER` ở "Sân cầu lông Demo". Có quyền đặt giá + xem báo cáo venue |
| `staff@sportsbooking.local` | `staff@1234` | `STAFF` | `VenueMember.role = STAFF` ở "Sân cầu lông Demo". Chỉ check-in + xem lịch |
| `customer@sportsbooking.local` | `customer@1234` | `CUSTOMER` | User thường, test flow đặt sân |

**Phân biệt `User.role = STAFF` và `VenueMember.role`**:
- `User.role` là level toàn cục (5 giá trị).
- `VenueMember.role` là chức vụ tại **một venue cụ thể** (MANAGER/STAFF). Một user STAFF có thể là MANAGER ở venue A và STAFF ở venue B đồng thời.
- Manager/Staff đều phải có `User.role = STAFF` mới được Owner invite (frontend `useStaffRole()` đọc memberships để phân biệt).
