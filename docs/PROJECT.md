# Sports Booking — Project Orientation

> 📍 **Đọc file này trước** nếu bạn là Claude (hoặc dev mới). Sau đó đọc tiếp [STATUS.md](STATUS.md) để biết hiện trạng + [GOTCHAS.md](GOTCHAS.md) để tránh các bug đã giải quyết.

## 1. Sản phẩm

**Sports Booking** — nền tảng đặt sân thể thao (bóng đá, cầu lông, tennis, pickleball, bóng rổ…). 3 client + 1 backend:

| Phần | Stack | Mục đích |
|---|---|---|
| **backend/** | NestJS 10 + Prisma + PostgreSQL 16 + Redis | API + thanh toán + webhook |
| **frontend/** | Next.js 14 App Router + Tailwind + Radix | Web cho mọi role |
| **mobile/** | Flutter 3.x + go_router | App iOS/Android (Customer chủ yếu, có Owner + Staff portal) |
| **docs/** | Markdown | Tài liệu thiết kế |

**5 role**: `CUSTOMER`, `OWNER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`. Backend còn có sub-role venue: `VenueMemberRole.MANAGER` / `STAFF` (gắn user vào venue cụ thể).

**3 cổng thanh toán**: VNPay, MoMo, ZaloPay. Backend đã code đầy đủ (HMAC verify + idempotency + reconcile cron).

## 2. Trạng thái hiện tại

- **Backend**: ✅ Hoàn chỉnh — schema Prisma, 11 modules NestJS, 3 payment providers, anti-double-booking 2 tầng. Chưa nối client thật.
- **Frontend (web)**: ✅ UI hoàn chỉnh trên mock data. RBAC: Customer/Owner/Staff/Manager/Admin/SuperAdmin đều có shell riêng. Demo login 5 chip.
- **Mobile**: ✅ UI hoàn chỉnh trên mock data. Customer + Owner + Staff portal đầy đủ. Manager là sub-role của Staff (có thêm tab Doanh thu + 2 page riêng).
- **Tích hợp client ↔ backend**: ❌ Chưa làm. Khi làm, swap layer mock bằng API client.

Chi tiết: xem [STATUS.md](STATUS.md).

## 3. Commands

### Backend
```bash
cd backend
cp .env.example .env
docker compose up -d                    # Postgres + Redis + MinIO + Mailhog
npm install
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/migrations/000_init_extensions.sql
npm run prisma:seed
npm run start:dev                       # http://localhost:3000 · Swagger /docs
```
- Tài khoản seed: `admin@sportsbooking.local / admin@1234`, `owner@sportsbooking.local / owner@1234`

### Frontend
```bash
cd frontend
npm install
npm run dev                             # http://localhost:3001
```
- Trang `/login` có 5 chip demo: Customer / Owner / Staff / Manager / Admin
- Manager dùng URL `?role=manager` để giả lập

### Mobile
```bash
cd mobile
flutter pub get
flutter run                             # iOS/Android emulator
```
- Trang Login có 5 chip demo tương tự (2 cho staff: Staff thường + Manager)
- Manager dùng `DemoState` singleton (`shared/mock/demo_state.dart`)

## 4. File map

```
sports_booking/
├── README.md                    Root readme (quick start)
├── docs/
│   ├── PROJECT.md               ← bạn đang đọc — orientation
│   ├── STATUS.md                Đã làm / chưa làm
│   ├── GOTCHAS.md               Bug đã gặp + cách fix (đọc kỹ trước khi sửa)
│   ├── FEATURES.md              Backend features (22 sections)
│   ├── DATABASE.md              Prisma schema + index + constraints
│   ├── FRONTEND.md              Web sitemap + RBAC matrix + components
│   ├── MOBILE.md                Mobile sitemap + customer/owner/staff portals
│   ├── API_INTEGRATION.md       🔌 Mapping UI mock ↔ DB schema (đọc trước khi nối API)
│   └── API_INTEGRATION_PLAN.md  📋 Roadmap 8 phase nối API web (Customer → Owner → ... → SuperAdmin)
│
├── backend/                     NestJS API
│   ├── prisma/schema.prisma     27 models (User, Venue, Court, Booking, Payment, ...)
│   ├── prisma/migrations/000_init_extensions.sql
│   │   └─ btree_gist + exclusion constraint chống trùng booking
│   ├── prisma/seed.ts
│   └── src/
│       ├── main.ts, app.module.ts
│       ├── config/configuration.ts          ENV loader
│       ├── prisma/prisma.service.ts
│       ├── common/                          Guards, filters, decorators, redis
│       └── modules/                         11 modules — xem FEATURES.md §22
│
├── frontend/                    Next.js
│   ├── app/
│   │   ├── page.tsx             Home
│   │   ├── (auth)/              login (5 demo chips), register, forgot
│   │   ├── (public)/venues/     search + detail (booking matrix court×hour)
│   │   ├── booking/             new (2-step) + result
│   │   ├── (account)/account/   bookings, favorites, profile, notifications, settings
│   │   ├── (owner)/owner/       dashboard, venues, bookings, reports, payout, staff, walk-in, settings
│   │   ├── (staff)/staff/       today, schedule, bookings/[id]  + (manager-only) revenue, team, pricing
│   │   └── (admin)/admin/       overview, venues, users, disputes, vouchers, reports, audit
│   │       └── system/          super-admin only: settings, roles, feature-flags
│   ├── components/
│   │   ├── ui/                  button, card, input, badge, avatar, tabs, dialog, skeleton
│   │   ├── shared/              header, footer, mobile-nav, venue-card
│   │   ├── booking/             slot-grid, booking-widget, booking-matrix, payment-method
│   │   └── owner/sidebar.tsx
│   └── lib/
│       ├── mock-data.ts         Hub mọi mock (sports, venues, courts, bookings, mockCellStatus)
│       ├── format.ts            formatVND, format date
│       ├── utils.ts             cn() — clsx + tailwind-merge
│       └── use-staff-role.ts    Hook đọc role từ ?role= URL param
│
└── mobile/                      Flutter
    └── lib/
        ├── main.dart            initializeDateFormatting('vi_VN') trước runApp
        ├── app.dart             MaterialApp.router
        ├── features/
        │   ├── splash/          splash + onboarding (chung)
        │   ├── auth/            login (5 demo chips), register, forgot (chung)
        │   ├── customer/        ← MỌI FLOW CUSTOMER gom vào đây sau refactor
        │   │   ├── main/        Shell bottom nav 4 tab
        │   │   ├── home/        Tab trang chủ
        │   │   ├── venues/      Tab khám phá + detail + BookingMatrix (court×hour)
        │   │   ├── bookings/    Booking flow + detail + result
        │   │   └── account/     Profile, favorites, notifications, settings
        │   ├── owner/           4 tabs + 7 sub-pages (incl. venue create, staff list/invite)
        │   └── staff/           3-4 tabs (Manager có thêm Revenue) + 2 manager-only pages
        └── shared/
            ├── theme/           AppColors (emerald primary, orange accent), AppTheme
            ├── routing/         AppRouter, RoutePaths, safe_pop.dart
            ├── mock/
            │   ├── mock_data.dart    Hub mọi mock + StaffRole + OwnerStaff
            │   └── demo_state.dart   Singleton ChangeNotifier (staffRole)
            ├── utils/format.dart     formatVND, formatDateLong (try/catch fallback)
            └── widgets/         VenueCard, SportChip, SlotGrid, PaymentMethodTile,
                                 KpiCard, RevenueSparkline, QrScannerPlaceholder, StatusBadge
```

## 5. Design system (đồng bộ web + mobile)

| Token | Value | Web | Mobile |
|---|---|---|---|
| Primary | emerald-500 `#10B981` | `--primary` | `AppColors.primary` |
| Accent | orange-500 `#F97316` | `--accent` | `AppColors.accent` |
| VNPay | `#1E40AF` | hardcode | `AppColors.vnpay` |
| MoMo | `#D82D8B` | hardcode | `AppColors.momo` |
| ZaloPay | `#0EA5E9` | hardcode | `AppColors.zalopay` |
| Manager | violet `#8B5CF6` | inline class | inline Color |
| Font | Inter (Google Fonts) | `next/font/google` | `google_fonts` package |

## 6. Demo flow (UI thử nhanh)

**Web** (`localhost:3001/login`):
- 👤 Customer → `/`
- 🏟️ Owner → `/owner`
- 🔧 Staff → `/staff`
- 👑 Manager → `/staff?role=manager` (cùng portal, nhiều quyền hơn)
- ⚡ Admin → `/admin`

**Mobile** (`localhost`): tương tự, 5 chip dưới form login. Mobile dùng `DemoState.instance.setStaffRole(...)` thay vì URL param.

## 7. Khi nối backend (Phase 2)

### Web
1. Tạo `lib/api.ts` với axios/fetch wrapper tới `NEXT_PUBLIC_API_URL`.
2. Convert pages dùng `MockData.x` → `await getX()` (server components) hoặc TanStack Query (client).
3. Thêm `middleware.ts` đọc role từ JWT cookie, redirect theo role.
4. Bỏ 5 demo chip login, `lib/use-staff-role.ts` đổi sang đọc từ cookie.

### Mobile
1. `flutter pub add dio retrofit flutter_secure_storage`
2. Tạo `lib/data/repositories/*` gọi backend.
3. Thay `MockData.venues` (static) → `await venuesRepo.list()` + FutureBuilder/Riverpod.
4. Bỏ `DemoState`, đọc role từ JWT lưu trong secure storage.
5. `safePop(context)` giữ nguyên — đã handle "nothing to pop" khi vào trang qua deep link.

## 8. Quy ước code

- **Backend Prisma**: snake_case ở DB, camelCase ở model. Money lưu `Decimal(12, 2)`, đơn vị VND.
- **Web**: server components mặc định, `'use client'` khi cần state/event. Imports relative path `@/components/...`.
- **Mobile**: tất cả file dart import relative `../../shared/...`. Không dùng codegen (đã strip từ flutter_base ban đầu — xem [GOTCHAS.md](GOTCHAS.md) §1).

## 9. Đọc tiếp

- [STATUS.md](STATUS.md) — chi tiết đã làm gì, chưa làm gì
- [GOTCHAS.md](GOTCHAS.md) — danh sách bug đã gặp + fix (đọc trước khi gặp lỗi tương tự!)
- [FEATURES.md](FEATURES.md) — đặc tả backend đầy đủ
- [DATABASE.md](DATABASE.md) — schema Prisma chi tiết
- [FRONTEND.md](FRONTEND.md) — sitemap web + RBAC + components
- [MOBILE.md](MOBILE.md) — sitemap mobile + customer/owner/staff
- [API_INTEGRATION.md](API_INTEGRATION.md) — **đọc trước khi nối API**: field-by-field UI ↔ DB + checklist
