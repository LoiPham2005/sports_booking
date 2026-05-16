# API Integration — UI ↔ DB Mapping

> Mapping field-by-field giữa **mock UI** (web `lib/mock-data.ts`, mobile `lib/shared/mock/mock_data.dart`) và **Prisma schema** (`backend/prisma/schema.prisma`). Đọc trước khi bắt đầu nối API để biết chỗ nào cần adapter, chỗ nào cần bổ sung field, chỗ nào logic UI phải đổi hoàn toàn.
>
> **Quy ước**:
> - ✅ Khớp: UI dùng đúng tên + đúng kiểu DB
> - 🔄 Cần map nhẹ: rename field hoặc convert kiểu (Decimal→number, ISO→DateTime)
> - ⚠️ Cần adapter: UI đơn giản hơn DB, cần hàm chuyển đổi hoặc join
> - ❌ Drift logic: UI nhồi field không có trong DB hoặc bỏ qua model phụ — phải thay đổi UI khi nối API
> - 🆕 UI có, DB chưa có: cần thêm vào schema

## Mục lục

1. [Sport](#1-sport)
2. [Amenity](#2-amenity)
3. [Venue](#3-venue)
4. [Court](#4-court) ⚠️ DRIFT LỚN — pricing
5. [Booking](#5-booking)
6. [BookingStatus enum](#6-bookingstatus-enum)
7. [Payment](#7-payment)
8. [VenueMember (Owner Staff)](#8-venuemember-owner-staff) 🆕 cần thêm field
9. [Review / Favorite / Notification](#9-review--favorite--notification)
10. [Voucher](#10-voucher)
11. [Pricing model](#11-pricing-model) ❌ drift lớn
12. [Decimal & DateTime conventions](#12-decimal--datetime-conventions)
13. [Adapter layer khuyến nghị](#13-adapter-layer-khuyến-nghị)
14. [Checklist khi nối API](#14-checklist-khi-nối-api)

---

## 1. Sport

| UI field | UI kiểu | DB field | DB kiểu | Status | Ghi chú |
|---|---|---|---|---|---|
| `slug` | string | `slug` | `String @unique` | ✅ | Slug khớp: `football_5`, `badminton`, `tennis`, `pickleball`, `basketball`, `volleyball`, `table_tennis` |
| `name` | string | `nameVi` | `String` | 🔄 | UI chỉ dùng `name` — map về `nameVi` (locale `vi`), tương lai dùng `nameEn` cho i18n |
| `icon` | string (emoji) | `icon` | `String?` | ✅ | DB cho phép null, UI hardcode emoji |
| `count` | int | — | — | ❌ | Field `count` (số venue có sport) **không có trong DB**, phải aggregate runtime: `prisma.venue.count({ where: { courts: { some: { sportId } } } })` |

**DB-only (UI bỏ qua)**: `id`, `defaultSlotMinutes`, `isActive`

---

## 2. Amenity

| UI field | UI kiểu | DB field | DB kiểu | Status |
|---|---|---|---|---|
| key (`wifi`, `parking`...) | string | `slug` | `String @unique` | ✅ |
| `.name` / web `.name` | string | `nameVi` | `String` | 🔄 map locale |
| `.icon` | string (emoji) | `icon` | `String?` | ✅ |

**DB-only**: `id`, `nameEn`

**Lưu ý**: Web file `mock-data.ts` ghi `shower: 'Vòi sen'` còn mobile ghi `'Phòng tắm'` — chọn 1 chuẩn khi seed DB.

---

## 3. Venue

| UI field (web + mobile) | UI kiểu | DB field | DB kiểu | Status | Ghi chú |
|---|---|---|---|---|---|
| `id` | string `v1` | `id` | `String @id @default(cuid())` | 🔄 | Seed dùng cuid thực, UI demo dùng `v1..v6` |
| `name` | string | `name` | `String` | ✅ | |
| `slug` (web only) | string | `slug` | `String @unique` | ⚠️ | Mobile mock **thiếu `slug`** → mobile phải lấy từ API |
| `address` | string | `addressLine` | `String` | 🔄 | Rename `address` → `addressLine` |
| — | — | `ward` | `String?` | 🆕 UI | UI chưa hiển thị phường |
| `district` | string | `district` | `String?` | ✅ | |
| `city` | string | `city` | `String` | ✅ | |
| — | — | `country` | `String @default("VN")` | — | UI không cần |
| — | — | `lat`, `lng` | `Decimal?` | ✅ | Map view dùng — `VenueDto.lat/lng` (number\|null) → `UiVenue.lat/lng` qua `toUiVenue`. Mock data đã có toạ độ HCM thật. Seed backend tạo 7 venue có lat/lng. |
| — | — | `newCity`, `newWard`, `provinceCode`, `wardCode` | `String?` | 🆕 | Địa chỉ sau cải cách 7/2025. Frontend gửi qua `CreateVenueDto` khi tạo venue qua `<AddressSelector>` cascading dropdown. Backend lưu thẳng các cột này (không JSON). |

## Storage (Supabase)

Backend dùng `@supabase/supabase-js` thay AWS S3 SDK cho upload media. ENV:
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon-key>
SUPABASE_BUCKET=sports_booking
```
Bucket cần được tạo trong Supabase Dashboard (public read) và RLS cho phép insert. Flow upload signed URL: backend gọi `storage.from(bucket).createSignedUploadUrl(path)` → FE PUT file lên URL đó.

`UploadsService.publicUrl(key)` trả về `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}` — URL public không cần signed read.
| — | — | `phone` | `String?` | 🆕 UI | UI venue detail chưa hiện số ĐT venue |
| — | — | `status` | `VenueStatus` (DRAFT/PENDING/APPROVED/SUSPENDED) | ⚠️ | UI customer mặc định coi như APPROVED. Owner UI cần hiện badge status, Admin UI đã có flow approve |
| `rating` | double | `ratingAvg` | `Decimal(2,1)` | 🔄 | Rename + Decimal→number |
| `reviewCount` | int | `ratingCount` | `Int` | 🔄 | Rename |
| `image` | string (single URL) | — | — | ❌ | DB tách thành bảng `VenueImage[]` — xem dưới |
| `amenities` | string[] (slug) | qua `VenueAmenity[]` | M-N | ⚠️ | API nên trả `amenities: { slug, nameVi }[]` để UI render trực tiếp, đỡ phải fetch riêng |
| `sports` | string[] (sport slug) | qua `Court[].sport` | — | ⚠️ | Không có field trực tiếp — phải `DISTINCT(court.sport.slug)`. API nên trả `sports: Sport[]` đã denormalize |
| `priceFrom` | int VND | — | — | ❌ | DB không lưu — phải tính `MIN(priceRule.pricePerSlot)` cho courts của venue. Khuyến nghị: tính sẵn ở backend trả về response |
| `distance` | double km | — | — | ❌ | Tính ở backend từ user location vs `lat/lng` venue (Haversine hoặc PostGIS) |
| `description` (mobile only) | string | `description` | `String? @db.Text` | ✅ | Web mock **thiếu `description`** — sẽ có khi nối API |
| — | — | `cancelPolicyJson` | `Json?` | 🆕 UI | UI chưa hiện chính sách huỷ chi tiết |

### 3.1. VenueImage

UI hiện chỉ giữ 1 string `image`. DB có bảng riêng:

```prisma
model VenueImage { id, venueId, url, sort, isPrimary }
```

**Action khi nối API**:
- API trả về `venue.images: VenueImage[]`
- UI: lấy `images.find(i => i.isPrimary)?.url ?? images[0]?.url` làm thumbnail (replace mock `image`)
- Venue detail page: hiển thị **gallery** thay vì 1 ảnh — hiện đang là 1 ảnh trên cả web lẫn mobile, cần upgrade

---

## 4. Court

| UI field | UI kiểu | DB field | DB kiểu | Status | Ghi chú |
|---|---|---|---|---|---|
| `id` | string | `id` | `String @id` | ✅ | |
| `name` | string | `name` | `String` | ✅ | |
| `surface` | string | `surface` | `Surface` enum | 🔄 | Web mock dùng đúng enum string (`'ARTIFICIAL_GRASS'`) + map qua `SURFACES` dict. Mobile mock dùng label tiếng Việt trực tiếp (`'Cỏ nhân tạo'`) — **cần đổi sang enum + thêm map giống web** |
| `indoor` | bool | `indoor` | `Boolean` | ✅ | |
| `capacity` | int | `capacity` | `Int` | ✅ | |
| `pricePerHour` | int VND | — | — | ❌❌❌ | **DRIFT LỚN NHẤT** — xem [§ 11 Pricing model](#11-pricing-model) |
| — | — | `slotDurationMinutes` | `Int @default(60)` | 🆕 UI | UI giả định 60' mọi sân |
| — | — | `venueId`, `sportId` | FK | ⚠️ | API trả về phải include `venueId` + `sportId` để biết court thuộc venue/sport nào |
| — | — | `isActive` | `Boolean` | 🆕 UI | Owner cần toggle bật/tắt sân, UI owner edit đã có nhưng chưa map field này |

---

## 5. Booking

| UI field | UI kiểu | DB field | DB kiểu | Status | Ghi chú |
|---|---|---|---|---|---|
| `id` | string | `id` | `String @id` | ✅ | |
| `code` | string | `code` | `String @unique` | ✅ | UI đã dùng mã 8 ký số `20250547` — backend chỉ cần sinh format tương tự |
| `venue` (object) | `Venue` nested | `venueId` + relation | FK | 🔄 | API trả nested `venue: { id, name, address... }` |
| `courtName` | string | — | — | ❌ | UI chỉ lưu `courtName` (string), DB lưu `courtId` + relation. **Phải đổi**: API trả `court: { id, name }` → UI đọc `booking.court.name` thay vì `booking.courtName` |
| — | — | `courtId` | FK | ⚠️ | Bắt buộc khi tạo booking |
| `startsAt` | mobile `DateTime` / web ISO string | `startsAt` | `DateTime` | 🔄 | Web mock dùng `'2026-05-20T18:00:00'` (không có Z timezone) — backend sẽ trả ISO UTC `Z`, UI cần parse cẩn thận về local |
| `endsAt` | same | `endsAt` | `DateTime` | 🔄 | |
| `total` | int VND | `total` | `Decimal(12,2)` | 🔄 | Decimal→number |
| `status` | enum (5 giá trị) | `status` | `BookingStatus` (9 giá trị) | ⚠️ | Xem [§ 6](#6-bookingstatus-enum) |
| — | — | `subtotal` | `Decimal` | 🆕 UI | UI chỉ hiện `total`, không break down subtotal vs discount. Detail page có thể bổ sung |
| — | — | `discount` | `Decimal @default(0)` | 🆕 UI | |
| — | — | `voucherId` | `String?` | 🆕 UI | Customer apply voucher chưa có flow |
| — | — | `source` | `BookingSource` (ONLINE/WALK_IN) | ⚠️ | UI owner walk-in chưa truyền source — cần truyền `WALK_IN` khi tạo qua /owner/walk-in |
| — | — | `notes` | `String?` | 🆕 UI | Khách hàng có thể thêm ghi chú khi đặt — UI chưa có ô nhập |
| — | — | `checkInToken` | `String? @unique` | 🆕 UI | UI hiện QR code = booking.code, **nên dùng `checkInToken` riêng** để chống share code. Mobile + web đều cần đổi |
| — | — | `checkedInAt` | `DateTime?` | ⚠️ | UI staff scan QR → set field này. Hiện chưa có |
| — | — | `cancelledAt`, `cancelReason` | | 🆕 UI | UI bookings/[id] cancelled chưa hiện lý do |
| — | — | `refundAmount` | `Decimal?` | 🆕 UI | Hiển thị ở detail nếu có refund |
| — | — | `recurringGroupId` | `String?` | 🆕 UI | Recurring chưa có UI (đã note trong STATUS) |
| — | — | `userId` | FK | — | API tự inject từ JWT |

---

## 6. BookingStatus enum

UI (cả web + mobile) gom 9 status DB thành 5:

| UI status | DB status | Adapter |
|---|---|---|
| `PENDING_PAYMENT` | `PENDING_PAYMENT` | ✅ |
| `CONFIRMED` | `CONFIRMED` | ✅ |
| `CHECKED_IN` | `CHECKED_IN` | ✅ |
| `COMPLETED` | `COMPLETED` | ✅ |
| `CANCELLED` | `CANCELLED_BY_USER` \| `CANCELLED_BY_OWNER` \| `CANCELLED_TIMEOUT` | 🔄 gộp 3 → 1 |
| 🆕 (chưa có) | `NO_SHOW` | ⚠️ thêm UI label "Không đến" (tone destructive) |
| 🆕 (chưa có) | `REFUNDED` | ⚠️ thêm UI label "Đã hoàn tiền" (tone muted) |

**Hàm map khuyến nghị** (TypeScript):
```ts
export function toUiStatus(s: Prisma.BookingStatus): UiStatus {
  if (s.startsWith('CANCELLED_')) return 'CANCELLED';
  return s as UiStatus; // 5 giá trị còn lại trùng tên
}
```

**Lưu ý ngược chiều**: khi user cancel, UI gọi `POST /bookings/:id/cancel` → backend tự set `CANCELLED_BY_USER`. Owner cancel → `CANCELLED_BY_OWNER`. Cron timeout → `CANCELLED_TIMEOUT`. UI không cần tự chọn variant.

---

## 7. Payment

UI hiện **không có model Payment** — chỉ có:
- Booking flow page chọn method (3 chip VNPay/MoMo/ZaloPay)
- Result page show success/fail
- Owner reports page show payment counts

DB có model đầy đủ. Khi nối API cần:

| Field | DB | UI sẽ dùng |
|---|---|---|
| `id`, `bookingId`, `userId` | | UI: `paymentId` để query status |
| `provider` | `PaymentProvider` | UI chip đã có (VNPAY/MOMO/ZALOPAY) — đã trùng enum |
| `amount`, `currency` | `Decimal`, `String "VND"` | |
| `status` | `PaymentStatus` (8 giá trị) | UI hiện chỉ có success/fail — cần thêm `PENDING`, `EXPIRED`, `REFUNDED` |
| `redirectUrl`, `qrData` | `String? @db.Text` | Booking flow dùng để redirect/show QR |
| `providerOrderId` | `String @unique` | Idempotency key |
| `paidAt`, `failedReason` | | Result page show |

**Flow nối API**:
1. UI gọi `POST /bookings` → trả `booking.id` + `payment.id` + `redirectUrl`/`qrData`
2. UI redirect tới `redirectUrl` (VNPay/MoMo) hoặc render QR (`qrData` ZaloPay)
3. Sau khi user thanh toán xong → callback về `/booking/result?id=...`
4. UI poll `GET /payments/:id` cho tới khi `status === 'SUCCESS'` hoặc timeout

---

## 8. VenueMember (Owner Staff)

DB model **rất tối giản**, UI mobile/web có nhiều field hơn → cần bổ sung schema HOẶC derive runtime:

| UI field (mobile `OwnerStaff` + web staff table) | DB | Action |
|---|---|---|
| `id` | `VenueMember.id` | ✅ |
| `name`, `email`, `phone` | qua `user` relation | 🔄 API trả nested `user: { fullName, email, phone }` |
| `role` (manager/staff) | `VenueMemberRole` | ✅ |
| `venueId`, `venueName` | qua `venue` relation | 🔄 |
| `status` (active/pending/suspended) | ❌ chưa có | **Cần thêm field**: `inviteStatus: PENDING/ACTIVE/SUSPENDED` trên `VenueMember`. Hoặc tạo model `VenueMemberInvite` riêng cho luồng invite chờ accept |
| `joinedAt` | ❌ | Thêm `createdAt`, `acceptedAt` |
| `bookingsHandled` | ❌ | Derive: `prisma.booking.count({ where: { venueId, handledByUserId: userId } })`. Nhưng `Booking` hiện chưa có field `handledByUserId` → cần thêm để track ai xử lý booking nào (walk-in / check-in) |

**Tóm tắt cần thêm vào schema khi nối API**:
```prisma
model VenueMember {
  // ... existing
  inviteStatus  MemberInviteStatus @default(ACTIVE)
  createdAt     DateTime           @default(now())
  acceptedAt    DateTime?
}

enum MemberInviteStatus { PENDING ACTIVE SUSPENDED }

model Booking {
  // ... existing
  handledByUserId String?  // staff/manager đã xử lý
}
```

---

## 9. Review / Favorite / Notification

### Review
DB model đầy đủ (rating, content, ownerReply, status). UI hiện hiển thị review trên venue detail nhưng **chưa có form viết review** sau booking COMPLETED. Cần thêm:
- UI customer: `/account/bookings/[id]` thêm nút "Viết đánh giá" nếu `status === 'COMPLETED'` và chưa có review
- UI owner: `/owner/venues/[id]/reviews` tab → reply review

### Favorite
DB key `(userId, venueId)` đơn giản. UI đã có heart icon trên venue card + `/account/favorites` page. Khi nối API:
- `POST /favorites { venueId }` → toggle
- `GET /me/favorites` → list

### Notification
| UI `NotificationItem` (mobile) | DB `Notification` | Action |
|---|---|---|
| `id` | `id` | ✅ |
| `type` | `type` (string) | ✅ — UI dùng `payment_success`, `promo`, `reminder`, `review` — backend tự định nghĩa enum hoặc string convention |
| `title` | `title` | ✅ |
| `body` | `body` | ✅ |
| `time` | `createdAt` | 🔄 rename |
| `read` (bool) | `readAt` (DateTime?) | 🔄 `read = readAt !== null` |
| — | `dataJson` (Json?) | 🆕 UI | Payload deep-link (ví dụ `{ bookingId: 'b1' }` để tap notification → mở booking) |

---

## 10. Voucher

UI **chưa có** flow customer apply voucher. Admin UI có page `/admin/vouchers` (web) nhưng là mock list — chưa map field. Khi build:

- Field DB: `code`, `type` (PERCENT/FIXED), `value`, `maxDiscount`, `minOrder`, `validFrom/To`, `usageLimit`, `perUserLimit`, `scope` (GLOBAL/VENUE/SPORT), `scopeRefId`
- UI Customer cần: ô nhập mã ở booking flow → preview discount → confirm
- UI Admin cần: form CRUD voucher với 3 scope option

---

## 11. Pricing model

❌ **Đây là drift logic lớn nhất.**

### UI hiện tại
- `Court.pricePerHour: int` — 1 giá cố định mọi giờ mọi ngày
- BookingMatrix render giá cố định khi user chọn cell
- Booking total = `pricePerHour * (hours)`

### DB thực tế
- `PriceRule(courtId, dayOfWeek, startTime, endTime, pricePerSlot)` — giá theo khung giờ + ngày trong tuần
- `PriceOverride(courtId, date, startTime, endTime, price, reason)` — giá đè cho ngày cụ thể (Lễ Tết, sự kiện)
- Backend module `pricing` đã có **quote engine** compute giá thực

### Khi nối API

1. **Bỏ field `pricePerHour` khỏi Court UI** — không còn ý nghĩa
2. **Gọi pricing API** thay vì tính client-side:
   ```
   POST /pricing/quote
   { courtId, startsAt, endsAt }
   → { subtotal, breakdown: [{ slot, price }] }
   ```
3. **BookingMatrix cell**: vẫn render giá, nhưng giá đến từ `GET /courts/:id/prices?from=...&to=...` (trả array slots) — owner pricing page (`/staff/pricing`, mobile `staff_pricing_page`) đã có UI để CRUD `PriceOverride`, chỉ cần nối backend
4. **`priceFrom` venue card**: backend tính sẵn `MIN(priceRule.pricePerSlot)` và trả về

### Files UI sẽ chịu thay đổi
- Web: `booking-matrix.tsx`, `lib/mock-data.ts` (xoá `pricePerHour`), booking flow `/booking/new/page.tsx`
- Mobile: `booking_matrix_widget.dart`, `mock_data.dart` (xoá `pricePerHour` khỏi `Court`), `booking_new_page.dart`

---

## 12. Decimal & DateTime conventions

### Decimal
- Prisma `Decimal(12, 2)` trả về JSON dưới dạng **string** mặc định (vd `"350000.00"`)
- UI dùng `number` / Dart `int`
- **Cấu hình backend**: thêm transformer trong NestJS (`ClassSerializerInterceptor` + `@Transform`) để convert `Decimal → number` trước khi serialize, **hoặc** UI parse `Number(x)` ở adapter layer
- **Khuyến nghị**: parse tại API layer, không để UI biết tới string

### DateTime
- DB: `DateTime` Prisma → JSON ISO `"2026-05-20T11:00:00.000Z"` (UTC, có `Z`)
- Web mock đang dùng `"2026-05-20T18:00:00"` (không Z) → khi parse `new Date(str)` sẽ coi là local — **không đồng nhất với API**
- Mobile mock dùng `DateTime.now().add(...)` — local time
- **Khi nối API**: dùng `dayjs` (web) hoặc `intl` + `DateTime.parse` UTC + `.toLocal()` (mobile). Mọi giờ hiển thị **phải convert sang giờ Việt Nam UTC+7** trước khi render

---

## 13. Adapter layer khuyến nghị

### Web (`frontend/lib/api/`)

```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts           # fetch wrapper + auth header
│   │   ├── types.ts            # re-export từ '@prisma/client' + UI types
│   │   ├── adapters/
│   │   │   ├── booking.ts      # toUiBooking(dto): UiBooking
│   │   │   ├── venue.ts        # toUiVenue(dto) — gộp images, tính priceFrom
│   │   │   └── status.ts       # toUiStatus(BookingStatus): UiBookingStatus
│   │   └── endpoints/
│   │       ├── venues.ts
│   │       ├── bookings.ts
│   │       └── payments.ts
│   └── mock-data.ts            # giữ lại để fallback / Storybook
```

**Pattern**:
```ts
// adapters/booking.ts
import type { Booking as DbBooking, Court, Venue } from '@prisma/client';

export type UiBooking = {
  id: string;
  code: string;
  venue: UiVenue;
  courtName: string;       // = court.name
  startsAt: string;
  endsAt: string;
  total: number;            // = Number(total)
  status: UiBookingStatus; // gộp CANCELLED_*
};

export function toUiBooking(dto: DbBooking & { court: Court; venue: Venue }): UiBooking {
  return {
    id: dto.id,
    code: dto.code,
    venue: toUiVenue(dto.venue),
    courtName: dto.court.name,
    startsAt: dto.startsAt.toISOString(),
    endsAt: dto.endsAt.toISOString(),
    total: Number(dto.total),
    status: toUiStatus(dto.status),
  };
}
```

### Mobile (`mobile/lib/data/`)

```
mobile/lib/
├── data/
│   ├── api_client.dart           # dio + interceptor JWT
│   ├── dto/
│   │   ├── venue_dto.dart        # @JsonSerializable
│   │   ├── court_dto.dart
│   │   └── booking_dto.dart
│   ├── adapters/
│   │   ├── booking_adapter.dart  # BookingDto → Booking (UI model)
│   │   └── status_adapter.dart
│   └── repos/
│       ├── venues_repo.dart
│       └── bookings_repo.dart
└── shared/mock/mock_data.dart    # giữ lại — sau switch flag
```

**Pattern**: thay `MockData.venues` bằng `await venuesRepo.list()` ở widget; giữ class `Venue` UI hiện tại, chỉ thêm adapter `Venue.fromDto(VenueDto)`.

**Switch flag** (giảm rủi ro):
```dart
// shared/config.dart
const useMockData = bool.fromEnvironment('USE_MOCK', defaultValue: false);
// repos/venues_repo.dart
Future<List<Venue>> list() async {
  if (useMockData) return MockData.venues;
  final dto = await api.get('/venues');
  return dto.map(Venue.fromDto).toList();
}
```

---

## 14. Checklist khi nối API

### Backend bổ sung schema (trước khi nối)

- [ ] Thêm `VenueMember.inviteStatus` + `createdAt` + `acceptedAt` (hoặc tạo `VenueMemberInvite` model)
- [ ] Thêm `Booking.handledByUserId` (staff/manager xử lý)
- [ ] Endpoint trả `Venue` đã denormalize: `sports[]`, `priceFrom`, `distance`, `images[]`
- [ ] Endpoint `/sports` trả thêm `count` aggregate
- [ ] Verify backend trả Decimal → number (NestJS transformer)

### Web

- [ ] Tạo `frontend/lib/api/` structure
- [ ] Generate types: `prisma generate` → import `@prisma/client` ở web (cần tách Prisma client ra package chung, hoặc copy types thủ công)
- [ ] Viết adapters: `toUiBooking`, `toUiVenue`, `toUiStatus`
- [ ] Replace import: `import { VENUES } from '@/lib/mock-data'` → `await venuesApi.list()`
- [ ] Middleware đọc JWT cookie, redirect role
- [ ] Bỏ 5 demo chip ở `/login`
- [ ] Wrap pricing UI: gọi `/pricing/quote` thay vì `court.pricePerHour * hours`
- [ ] Booking detail dùng `booking.checkInToken` cho QR thay vì `booking.code`
- [ ] Thêm UI 2 status mới: `NO_SHOW`, `REFUNDED`
- [ ] Venue detail upgrade thành gallery (multiple images)

### Mobile

- [ ] `flutter pub add dio retrofit json_annotation freezed_annotation flutter_secure_storage`
- [ ] Dev: `flutter pub add --dev build_runner json_serializable freezed retrofit_generator`
- [ ] Tạo `lib/data/` structure
- [ ] Generate DTO + adapter
- [ ] Đổi `Court.surface` mobile từ tiếng Việt (`'Cỏ nhân tạo'`) sang enum string (`'ARTIFICIAL_GRASS'`) + map
- [ ] Mobile `Venue` mock thiếu `slug` — thêm để khớp API
- [ ] Mobile `Court` mock có `pricePerHour` — bỏ + gọi pricing API
- [ ] Switch `DemoState.instance.role` từ mock → đọc JWT claim
- [ ] Bỏ 5 demo chip ở Login
- [ ] Update notification: `read: bool` → `readAt: DateTime?` (UI tính `read = readAt != null`)

### Khi đã xong

- [ ] Test E2E luồng đặt-thanh-toán-checkin với sandbox VNPay/MoMo/ZaloPay
- [ ] Verify status mapping 2 chiều (UI cancel → backend `CANCELLED_BY_USER`)
- [ ] Verify timezone hiển thị đúng UTC+7
- [ ] Verify `priceFrom` venue card khớp với MIN price rule
- [ ] Verify owner staff invite flow end-to-end

---

## Tham khảo nhanh

- Mock data web: [frontend/lib/mock-data.ts](../frontend/lib/mock-data.ts)
- Mock data mobile: [mobile/lib/shared/mock/mock_data.dart](../mobile/lib/shared/mock/mock_data.dart)
- Schema DB: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)
- DB design notes: [DATABASE.md](DATABASE.md)
- Backend features: [FEATURES.md](FEATURES.md)
