# Web API Integration Plan

> Kế hoạch nối **Next.js web** với **NestJS backend** — chia phase theo role, có roadmap chi tiết, backend gap, frontend tasks, acceptance criteria. Mobile làm sau theo plan tương tự.
>
> **Đọc kèm**: [API_INTEGRATION.md](API_INTEGRATION.md) (field mapping UI ↔ DB), [STATUS.md](STATUS.md) (hiện trạng), [FEATURES.md](FEATURES.md) (backend features).

---

## 0. Tổng quan

### Mục tiêu
- Frontend Next.js từ **100% mock → 100% real API**
- Backend hiện đã có **11/12 modules**, còn thiếu: `admin`, `reports`, `vouchers`, `recurring bookings`
- Giữ mock data sống song song qua **feature flag** `NEXT_PUBLIC_USE_MOCK` để rollback nhanh khi sự cố
- **Zero breaking change** trên UI hiện tại — chỉ swap layer fetch

### Nguyên tắc
1. **Vertical slice** — làm từng phase xong end-to-end rồi mới sang phase sau, không làm horizontal (kiểu "tất cả GET trước, tất cả POST sau")
2. **Backend trước, frontend sau** trong mỗi phase: 1 endpoint mới phải có Swagger doc + e2e test trước khi UI nối
3. **Adapter layer bắt buộc** — UI không gọi thẳng API DTO, luôn qua `toUi*()` để cô lập drift
4. **Feature flag per page** — không "big bang" toàn site

### Thứ tự phase

```
Phase 0 — Foundation         (3 days)  ← Pre-work, không phụ thuộc role
Phase 1 — Auth + Customer Read (5 days)  ← Login → browse venues
Phase 2 — Booking + Payment   (7 days)  ← HIGH RISK: VNPay/MoMo/ZaloPay
Phase 3 — Customer Account    (2 days)  ← My bookings + favorites + profile
Phase 4 — Owner               (7 days)  ← Cần data từ Phase 2 (bookings)
Phase 5 — Staff + Manager     (4 days)  ← Cần Owner invite (Phase 4)
Phase 6 — Admin               (4 days)  ← Build admin module mới
Phase 7 — Super Admin         (2 days)  ← System settings + roles

Buffer + polish              (4 days)
─────────────────────────────────────
Tổng:                       ~38 days  (1 dev)
                             ~25 days  (2 dev)
```

### Tại sao thứ tự này?

| Role | Tại sao chọn vị trí này |
|---|---|
| **Customer** | Surface lớn nhất → validate kiến trúc sớm. Dữ liệu đơn giản (1 user → bookings của user đó). Phải sống được trước để Owner có data test |
| **Owner** | Cần `bookings` thật từ Customer để dashboard/calendar/reports có nội dung. Nếu làm Owner trước → toàn data rỗng, khó test |
| **Staff** | Cần Owner invite flow chạy được → tạo `VenueMember` thật |
| **Admin** | Module backend CHƯA CÓ, phải build từ đầu. Để cuối vì không block ai |
| **SuperAdmin** | Nhỏ nhất, ít rủi ro nhất → để cuối |

---

## Phase 0 — Foundation (3 days)

> Bắt buộc xong trước khi nối bất kỳ role nào. Không có phần này thì các phase sau sẽ phải refactor.

### Backend (1.5 days)

- [ ] **Decimal serializer**: tạo `PrismaDecimalInterceptor` trong `common/interceptors/` để convert `Decimal` (Prisma) → `number` trong mọi response. Test: GET /venues trả `priceFrom: 350000` chứ không phải `"350000.00"`
- [ ] **Cookie-based JWT**: bổ sung option `AUTH_MODE=cookie` trong `auth.service.ts`. Khi cookie mode, login set 2 httpOnly cookies (`access_token`, `refresh_token`) đồng thời với JSON response. Để Next.js middleware đọc được
- [ ] **CORS config**: `main.ts` thêm `app.enableCors({ origin: env.WEB_ORIGIN, credentials: true })`. ENV mới: `WEB_ORIGIN=http://localhost:3001`
- [ ] **GET /me endpoint**: kiểm tra đã có chưa, nếu chưa thì add ở `users.controller.ts` — trả `User` + `role` + array `ownedVenues` + array `memberships` để frontend route theo role
- [ ] **POST /auth/refresh**: verify đã có refresh rotation (nhìn auth.service)
- [ ] **Swagger spec export**: chạy `npm run build && npm run swagger:json` lưu `openapi.json` để frontend generate types
- [ ] **Sentry / error tracking**: skip nếu chưa cần production, ghi note vào TODO

### Frontend (1.5 days)

```
frontend/lib/api/
├── client.ts              # fetch wrapper + 401 retry
├── config.ts              # USE_MOCK flag, API_BASE
├── errors.ts              # ApiError class
├── types.ts               # re-export Prisma types
├── adapters/
│   ├── booking.ts
│   ├── venue.ts
│   ├── user.ts
│   └── status.ts
└── endpoints/
    ├── auth.ts
    ├── venues.ts
    ├── bookings.ts
    ├── payments.ts
    ├── users.ts
    ├── owner.ts
    ├── staff.ts
    └── admin.ts
```

- [ ] **`lib/api/config.ts`**:
  ```ts
  export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
  export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  ```
- [ ] **`lib/api/client.ts`**: fetch wrapper với:
  - Auto-attach `Authorization: Bearer` từ cookie (nếu có)
  - 401 → call /auth/refresh → retry 1 lần
  - Throw `ApiError` với `{ status, code, message, details }`
  - Timeout 15s
- [ ] **`.env.local.example`**:
  ```
  NEXT_PUBLIC_API_BASE=http://localhost:3000
  NEXT_PUBLIC_USE_MOCK=true
  ```
- [ ] **`middleware.ts`** (Next.js root): đọc cookie `access_token`, decode JWT (jose lib), redirect theo role:
  - `/admin/*` cần `ADMIN | SUPER_ADMIN`
  - `/owner/*` cần `OWNER`
  - `/staff/*` cần `STAFF` hoặc `MANAGER` (VenueMember)
  - `/account/*` cần login
- [ ] **Generate Prisma types**: copy `backend/node_modules/.prisma/client/index.d.ts` types hoặc dùng `npx prisma generate --schema ../backend/prisma/schema.prisma --generator client-web`. Mình chọn copy minimal types vào `lib/api/types.ts` để frontend không depend backend folder
- [ ] **Bỏ 5 demo chip ở /login** — chuẩn bị cho real auth
- [ ] **Toast/error UI**: tạo `lib/use-toast.ts` (đã có sonner hoặc tự build) cho global error display

### Acceptance Phase 0
- [ ] `curl POST /auth/login` trả Decimal đúng kiểu number (`"total": 350000` không phải `"350000.00"`)
- [ ] Browser request từ `localhost:3001` không bị CORS error
- [ ] Cookie `access_token` set httpOnly sau login
- [ ] `middleware.ts` redirect `/owner` về `/login` khi không có cookie
- [ ] Feature flag `USE_MOCK=true` → mọi page vẫn chạy mock như cũ
- [ ] Feature flag `USE_MOCK=false` → 1 endpoint test (vd: `/sports`) gọi real API

---

## Phase 1 — Auth + Customer Read (5 days)

> Login + browse venues. Đây là smoke test cho toàn bộ kiến trúc.

### Backend gaps (1 day)

- [ ] **`GET /venues` enhancements**:
  - Query params: `?sport=football_5&city=HCM&q=phú+mỹ&sortBy=distance&page=1&limit=20`
  - Response include: `sports[]` (denormalize từ courts.sport), `priceFrom` (MIN price rule), `images[]` (denormalize VenueImage), `distance` (nếu query có `?lat=&lng=`)
  - Đã có gì: query DB cơ bản (xem `venues.service.ts`). Cần thêm: aggregate sports, MIN price, Haversine distance
- [ ] **`GET /venues/:slug` hoặc `/venues/:id`** — venue detail với nested:
  - `images[]`, `amenities[]`, `courts[]` (với `sport`, `priceRules[]`)
  - `reviews[]` (top 5 + total count)
  - `hours[]` (operating hours)
- [ ] **`GET /sports`** — đã có rồi, kiểm tra response có `count` (số venue có sport này) không. Nếu chưa: aggregate `COUNT(DISTINCT venue_id) FROM courts WHERE sport_id = X`
- [ ] **`GET /amenities`** — verify đã có

### Frontend tasks (3 days)

| Page | API endpoint | Adapter | LOC est. |
|---|---|---|---|
| `/login` | `POST /auth/login` | — | ~80 |
| `/register` | `POST /auth/register` + `POST /auth/otp/send` + `POST /auth/otp/verify` | — | ~150 |
| `/forgot-password` | `POST /auth/forgot` + reset flow | — | ~100 |
| `/` (home) | `GET /venues?limit=8&sortBy=rating` + `GET /sports` | `toUiVenue` | ~50 |
| `/venues` | `GET /venues` + query state | `toUiVenue` | ~150 |
| `/venues/[id]` | `GET /venues/:id` | `toUiVenue` + `toUiCourt` | ~100 |

**Code pattern**:
```ts
// app/venues/page.tsx
'use client';
import { venuesApi } from '@/lib/api/endpoints/venues';
import { VENUES } from '@/lib/mock-data';
import { USE_MOCK } from '@/lib/api/config';

const useVenues = (params) => {
  if (USE_MOCK) return { data: VENUES, loading: false };
  return useSWR(['venues', params], () => venuesApi.list(params));
};
```

### Acceptance Phase 1
- [ ] User login → cookie set → redirect `/` theo role Customer
- [ ] Refresh trang giữ session
- [ ] `/venues?sport=tennis` filter đúng, sort đúng
- [ ] `/venues/[id]` hiện đủ ảnh gallery, court list, review
- [ ] Logout xoá cookie + redirect /login
- [ ] Test cả 2 mode: `USE_MOCK=true` (mock cũ) + `USE_MOCK=false` (API thật), không broken

---

## Phase 2 — Booking + Payment (7 days, **HIGH RISK**)

> Đây là phần phức tạp nhất. Anti-double-booking + 3 cổng thanh toán + webhook + idempotency.

### Backend gaps (2 days)

- [ ] **`POST /pricing/quote`** — verify response:
  ```json
  {
    "subtotal": 700000,
    "discount": 0,
    "total": 700000,
    "breakdown": [
      { "slot": "2026-05-20T17:00:00Z", "price": 350000 },
      { "slot": "2026-05-20T18:00:00Z", "price": 350000 }
    ],
    "holdToken": "abc123",
    "holdExpiresAt": "2026-05-20T16:10:00Z"
  }
  ```
- [ ] **`POST /bookings`** body: `{ courtId, startsAt, endsAt, holdToken, paymentMethod: 'VNPAY' | 'MOMO' | 'ZALOPAY', voucherCode? }`. Response: `{ booking, payment: { id, redirectUrl OR qrData, providerOrderId } }`
- [ ] **`GET /payments/:id`** — poll status. Trả `{ status, paidAt }`
- [ ] **Sandbox webhook URLs**: dev mode cần ngrok / cloudflared. Document trong `backend/README.md`
- [ ] **`PATCH /bookings/:id/cancel`** — Customer huỷ. Set status `CANCELLED_BY_USER` + tự tính `refundAmount` theo `cancelPolicyJson` của venue
- [ ] **Idempotency**: verify `Idempotency-Key` header được respect ở POST /bookings

### Frontend tasks (4 days)

| Page/Flow | Steps | Risk |
|---|---|---|
| `/booking/new` step 1 | Chọn court + time → `POST /pricing/quote` → hiện hold timer 10' | Hold expire UX |
| `/booking/new` step 2 | Chọn payment method → `POST /bookings` | — |
| Redirect handling | VNPay/MoMo: `window.location = redirectUrl`. ZaloPay: render QR | — |
| `/booking/result?id=...` | Poll `GET /payments/:id` mỗi 3s, max 60s, fallback button "Refresh" | Race với webhook |
| Cancel from detail | `PATCH /bookings/:id/cancel` với confirm dialog | Refund preview |

**Pattern Hold timer**:
```ts
const [secondsLeft, setSecondsLeft] = useState(600);
useEffect(() => {
  if (secondsLeft <= 0) router.replace('/venues/[id]');
  const t = setInterval(() => setSecondsLeft(s => s - 1), 1000);
  return () => clearInterval(t);
}, [secondsLeft]);
```

### Risk matrix
| Risk | Severity | Mitigation |
|---|---|---|
| Webhook không tới được localhost dev | High | ngrok tunnel + document trong README |
| Webhook order: success trước SUCCESS, callback trước user về `/result` | Medium | Backend xử lý idempotent — frontend chỉ cần poll |
| User đóng browser sau khi thanh toán, không về result | Medium | Push notification + email confirmation từ backend |
| Hold expire ngay khi user gõ thẻ → double-charge | High | Backend reject với hold đã hết. UI báo "Phiên hết hạn, quay lại chọn lại" |
| BookingStatus mapping `CANCELLED_*` → `CANCELLED` | Low | Adapter `toUiStatus()` đã có (xem [API_INTEGRATION.md § 6](API_INTEGRATION.md#6-bookingstatus-enum)) |

### Acceptance Phase 2
- [ ] Test 3 cổng thanh toán sandbox end-to-end: success / fail / timeout
- [ ] Idempotency: gọi POST /bookings 2 lần cùng key → chỉ tạo 1 booking
- [ ] Anti-double: 2 user đặt cùng slot → user thứ 2 nhận 409 Conflict
- [ ] Cancel booking trong vòng 24h → hoàn 100%, ngoài 24h → hoàn 0%
- [ ] Console không leak access token

---

## Phase 3 — Customer Account (2 days)

> Phần đơn giản nhất, chỉ là CRUD trên user data đã có.

### Backend gaps
- [ ] **`GET /me/bookings?status=&page=`** — list bookings của user hiện tại
- [ ] **`GET /me/bookings/:id`** — detail, include payment + court + venue
- [ ] **`POST /me/favorites/:venueId` / `DELETE`** — toggle
- [ ] **`GET /me/favorites`** — list
- [ ] **`PATCH /me`** — update profile (fullName, avatarUrl, dob, gender)
- [ ] **`GET /me/notifications?unreadOnly=`**
- [ ] **`POST /me/notifications/:id/read`**
- [ ] **`PATCH /me/notification-preferences`**

### Frontend tasks
- [ ] `/account/bookings` — 3 tab (Sắp tới / Hoàn thành / Đã huỷ)
- [ ] `/account/bookings/[id]` — QR (dùng `booking.checkInToken` thay `code` — xem [API_INTEGRATION.md § 5](API_INTEGRATION.md#5-booking))
- [ ] `/account/favorites` — list + bỏ tim
- [ ] `/account/profile` — form patch
- [ ] `/account/notifications` — list, mark all read, group theo ngày
- [ ] `/account/settings` — chủ yếu local, một số call PATCH /me/notification-preferences

### Acceptance Phase 3
- [ ] Tim/bỏ tim venue persist sau reload
- [ ] Mark notification read → counter giảm
- [ ] Update profile → reflect ngay không reload
- [ ] QR scan từ Owner app → check-in thành công

---

## Phase 4 — Owner (7 days)

> Cần ít nhất 1 venue + vài booking từ Phase 2 để test thật.

### Backend gaps (3 days)

| Endpoint | Status | Notes |
|---|---|---|
| `GET /owner/dashboard?date=` | ❌ NEW | Aggregate KPI: revenueToday, bookingsToday, occupancy, revenueMonth + delta |
| `GET /owner/venues` | ⚠️ partial | List owned, có thể đã có ở `venues.service.findByOwner` |
| `POST /owner/venues` | ✅ | Tạo với status=DRAFT, submit để PENDING |
| `PATCH /owner/venues/:id` | ✅ | Update info + images + amenities + hours |
| `POST /owner/venues/:id/submit` | ❌ NEW | Chuyển DRAFT → PENDING để Admin duyệt |
| `GET /owner/courts` + CRUD | ✅ | Đã có ở `courts.module` |
| `GET /owner/pricing/rules` + CRUD | ✅ | Đã có ở `pricing.module` |
| `GET /owner/bookings?date=&status=&venueId=` | ⚠️ partial | Cần filter theo `bookings.handledByUserId` cho audit |
| `POST /owner/bookings/walk-in` | ❌ NEW | Tạo booking với `source=WALK_IN`, skip payment, ghi nhận tiền mặt |
| `PATCH /owner/bookings/:id/refuse` | ❌ NEW | Trong 5 phút sau tạo, owner reject → full refund |
| `GET /owner/reports?from=&to=&groupBy=` | ❌ NEW | Cần build **reports module** mới — revenue chart, top customers, sport breakdown |
| `GET /owner/payout` | ⚠️ partial | `OwnerEarning` đã có, cần endpoint aggregate + payout history |
| `POST /owner/payout/request` | ❌ NEW | Tạo Payout với status=PENDING |
| `GET /owner/bank-accounts` + CRUD | ⚠️ partial | Model `BankAccount` đã có, cần endpoint |
| `GET /owner/staff` | ❌ NEW | List VenueMember + nested user info. **Cần thêm field `inviteStatus`, `joinedAt` vào schema** (xem [API_INTEGRATION.md § 8](API_INTEGRATION.md#8-venuemember-owner-staff)) |
| `POST /owner/staff/invite` | ❌ NEW | Tạo VenueMember status=PENDING + gửi email mời. Token expire 7 days |
| `PATCH /owner/staff/:id/suspend` / `/remove` | ❌ NEW | Update status |

**Schema changes cần migration**:
```prisma
model VenueMember {
  // ... existing
  inviteStatus  MemberInviteStatus @default(ACTIVE)
  createdAt     DateTime           @default(now())
  acceptedAt    DateTime?
  inviteToken   String?            @unique
  inviteExpiresAt DateTime?
}

enum MemberInviteStatus { PENDING ACTIVE SUSPENDED }

model Booking {
  // ... existing
  handledByUserId String?  // staff/manager check-in
  refusedAt       DateTime?
  refuseReason    String?
}
```

### Frontend tasks (4 days)

- [ ] `/owner` dashboard — 4 KPI card + revenue chart 7-day + top customers + recent bookings
- [ ] `/owner/venues` — list owned venues với status badge
- [ ] `/owner/venues/[id]` — 5 tab: Tổng quan, Sân, Bảng giá, Ảnh & tiện ích, Giờ mở cửa
- [ ] `/owner/bookings` — week calendar grid + filter
- [ ] `/owner/walk-in` — form tạo nhanh, chọn court + time + customer info
- [ ] `/owner/reports` — chart revenue, group by day/week/month, export CSV
- [ ] `/owner/payout` — list earnings + payout history + request payout button
- [ ] `/owner/staff` — table + invite modal + suspend/remove actions
- [ ] `/owner/settings` — chính sách huỷ, giờ giữ chỗ, etc.

### Acceptance Phase 4
- [ ] Owner tạo venue → submit → Admin duyệt → status=APPROVED → hiện trên public list
- [ ] Mời nhân viên → email nhận link → click → Staff role activated
- [ ] Walk-in booking không thu phí 8% (verify ở payout)
- [ ] Refuse booking trong 5' → customer nhận refund 100%
- [ ] Dashboard KPI match SQL query bằng tay

---

## Phase 5 — Staff + Manager (4 days)

### Backend gaps (1.5 days)

- [ ] **`GET /staff/today`** — bookings hôm nay ở venue mà user là VenueMember
- [ ] **`GET /staff/schedule?date=&days=7`** — week view
- [ ] **`POST /staff/check-in`** body `{ token: 'check-in-token-from-qr' }` — validate token, set `booking.checkedInAt` + `handledByUserId`
- [ ] **`POST /staff/invites/:token/accept`** — Staff click email link → activate VenueMember
- [ ] **Manager-only** (cần guard role + VenueMemberRole):
  - `GET /staff/revenue?date=` — daily revenue (chỉ cho Manager)
  - `POST /staff/pricing/overrides` + GET/DELETE — CRUD PriceOverride
  - `GET /staff/team` — fellow VenueMembers cùng venue

### Frontend tasks (2.5 days)

- [ ] `/staff` today — list bookings + filter status + quick check-in
- [ ] `/staff/schedule` — week grid
- [ ] `/staff/bookings/[id]` — detail + check-in button
- [ ] `/staff/qr-scan` (nếu web — chắc skip, để mobile)
- [ ] **Manager-only**: `/staff/revenue`, `/staff/pricing`, `/staff/team`
- [ ] Update `useStaffRole()` hook: đọc role từ JWT thay vì URL param

### Acceptance Phase 5
- [ ] Staff scan QR (từ mobile của customer) → check-in success
- [ ] Manager tạo override giá → reflect ngay khi customer query pricing
- [ ] Staff (không phải Manager) navigate `/staff/revenue` → 403

---

## Phase 6 — Admin (4 days)

> Module backend chưa có. Phải build từ đầu.

### Backend tasks (2.5 days) — build module `admin/`

```
backend/src/modules/admin/
├── admin.module.ts
├── admin.controller.ts
├── admin.service.ts
└── dto/
```

Endpoints (tất cả guard `@Roles(ADMIN, SUPER_ADMIN)`):

- [ ] `GET /admin/venues?status=PENDING` — venues chờ duyệt
- [ ] `POST /admin/venues/:id/approve`
- [ ] `POST /admin/venues/:id/reject` body `{ reason }`
- [ ] `GET /admin/users?role=&status=&q=` — list users
- [ ] `PATCH /admin/users/:id` — suspend/unsuspend, change role
- [ ] `GET /admin/disputes` — refund requests pending
- [ ] `POST /admin/disputes/:id/resolve` body `{ approveRefund, amount?, note }`
- [ ] `GET /admin/vouchers` + POST/PATCH/DELETE — CRUD (cần build **vouchers module**)
- [ ] `GET /admin/reports` — platform-wide: total revenue, total bookings, MAU, sport popularity
- [ ] `GET /admin/audit?from=&to=&actorId=&action=` — query AuditLog
- [ ] **AuditLog auto-write**: middleware ghi log mỗi action admin

### Frontend tasks (1.5 days)
- [ ] `/admin` overview — 8 KPI + chart
- [ ] `/admin/venues` — pending table với approve/reject inline
- [ ] `/admin/users` — search + filter + actions
- [ ] `/admin/disputes`
- [ ] `/admin/vouchers` — CRUD table + create modal
- [ ] `/admin/reports`
- [ ] `/admin/audit` — query log với filter

### Acceptance Phase 6
- [ ] Approve venue → owner nhận push + email
- [ ] Suspend user → user không login được nữa
- [ ] Tạo voucher → customer apply ở checkout → discount đúng
- [ ] Mọi action admin có entry trong AuditLog

---

## Phase 7 — Super Admin (2 days)

### Backend gaps
- [ ] `GET /system/settings` — `{ commissionPercent, defaultCancelPolicy, holdMinutes, ... }`
- [ ] `PATCH /system/settings` — update
- [ ] `GET /system/admins` — list users role ADMIN
- [ ] `PATCH /users/:id/role` — promote/demote (SUPER_ADMIN only)
- [ ] `GET /system/feature-flags` — read JSON env-based flags
- [ ] `PATCH /system/feature-flags/:key`

### Frontend tasks
- [ ] `/admin/system/settings` — form chỉnh % commission, policy
- [ ] `/admin/system/roles` — list admin + promote button
- [ ] `/admin/system/feature-flags` — toggle per env

### Acceptance Phase 7
- [ ] Đổi commission 8% → 10% → owner earning record mới reflect 10%
- [ ] Promote Customer → Admin → user nhận push, role JWT update sau logout

---

## Migration approach

### Feature flag chiến lược

Mỗi page có pattern:
```ts
const data = USE_MOCK
  ? MOCK_DATA
  : await api.venues.list();
```

**Workflow per phase**:
1. Code page với cả 2 path
2. Test với `USE_MOCK=true` (giữ behavior cũ) → đảm bảo không broken
3. Test với `USE_MOCK=false` → smoke test
4. Khi phase ổn định, **xoá nhánh mock** ở page đó (clean up)
5. Cuối project, xoá `lib/mock-data.ts` + flag

### Branch strategy

- `main` — production-stable
- `api-integration` — long-running branch, merge từ main weekly
- `api-integration/phase-N` — feature branch per phase, PR → `api-integration`

### Database seed

Chạy 1 lệnh đã có sẵn:
```bash
cd backend
npm run prisma:seed
```

Seed tạo:
- 6 sport + 7 amenity + 23 permission (RBAC động)
- 6 user — 1 cho mỗi role (xem [STATUS.md § Test accounts](STATUS.md#test-accounts-seed))
- 7 venue HCM có `lat/lng` thật (cho map view) + 1 venue cầu lông demo (có giá theo PriceRule)
- `VenueMember` ACTIVE cho manager/staff demo trên venue cầu lông

⚠️ TODO: chưa generate booking giả + payment để test Phase 4 (Owner reports cần data). Mở rộng `prisma/seed.ts` khi bắt đầu phase đó.

---

## Risk register

| # | Risk | Phase | Severity | Mitigation |
|---|---|---|---|---|
| 1 | Payment webhook không tới localhost | 2 | High | ngrok tunnel + document setup trong README |
| 2 | CORS preflight fail với cookie | 0 | High | `credentials: 'include'` + same-site=lax |
| 3 | Decimal precision khi convert | 0 | Medium | Test edge case 999_999.99 |
| 4 | Race khi 2 user đặt 1 slot | 2 | Low | Backend handle (btree_gist + Redis hold) |
| 5 | BookingStatus 9→5 mapping sai | 2,3,4 | Medium | Test cancel cả 3 variant trong dev |
| 6 | VenueMember invite token expire khi user delay accept | 4 | Low | UX hiện rõ "Hết hạn, mời lại" |
| 7 | AuditLog blow up storage | 6 | Medium | Archive log > 1 năm |
| 8 | Migration phá data dev | 0,4 | High | Dùng `prisma migrate dev` không phải `migrate deploy` ở local |

---

## Daily checkpoint

Mỗi sáng start day:
1. Pull `api-integration` branch
2. Backend running? (`docker compose up`)
3. Today's task list (3-5 items max, theo phase đang làm)
4. Update [STATUS.md](STATUS.md) cuối ngày

---

## Khi bắt đầu

**Yêu cầu xác nhận trước khi vào code**:

1. ✅ Plan này OK chưa? Có muốn đổi thứ tự role nào không? (Vd: làm Admin trước nếu cần demo cho stakeholder)
2. ✅ Solo dev hay 2 dev? (Ảnh hưởng timeline)
3. ✅ Có deadline cứng không? (Ảnh hưởng buffer + cut scope)
4. ✅ Bắt đầu Phase 0 luôn? Hay muốn review setup backend trước?

**Đề xuất**: Bắt đầu **Phase 0 — Backend portion** (Decimal interceptor + Cookie auth + CORS) hôm nay. Mình estimate ~3-4h work cho backend phần này. Frontend phần Phase 0 (api/client.ts + adapters + middleware) làm ngày mai sau khi backend ready.

---

## Tham khảo nhanh

- [API_INTEGRATION.md](API_INTEGRATION.md) — field mapping UI ↔ DB chi tiết
- [STATUS.md](STATUS.md) — đã làm/chưa làm
- [FEATURES.md](FEATURES.md) — backend features (22 sections)
- [DATABASE.md](DATABASE.md) — schema Prisma
- [GOTCHAS.md](GOTCHAS.md) — bug đã gặp
