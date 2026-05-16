# Database Design — Sports Booking

## Tổng quan

- **DBMS**: PostgreSQL 16
- **Naming**: snake_case ở DB, camelCase trong Prisma models.
- **Soft delete**: cột `deletedAt` cho các bảng cần (Venue, Court). Cho `Booking` không soft delete — giữ history.
- **Audit**: bảng `AuditLog` riêng.
- **Tiền**: lưu bằng `Decimal(12, 2)`. Đơn vị VND (không có cent).
- **Time**: tất cả `timestamptz`. Múi giờ ứng dụng `Asia/Ho_Chi_Minh`.
- **ID**: `cuid()` cho hầu hết entity. `Booking` có thêm `code` ngắn (8 chữ số) cho user.

## Sơ đồ quan hệ (ERD tóm tắt)

```
User ─┬─< Session
      ├─< Device
      ├─< RefreshToken
      ├─< Booking >─── Court >── Venue ─┬─< VenueImage
      ├─< Payment ──┘                   ├─< VenueAmenity >── Amenity
      ├─< Review >── Venue              ├─< VenueHour
      ├─< Favorite >── Venue            └─< VenueMember
      └─< OwnerEarning >── Payout

Sport ──< Court
Court ──< PriceRule
Court ──< PriceOverride
Court ──< CourtClosure

Booking ──< Payment ──< PaymentEvent
Booking ──< BookingItem (cho recurring/multi-slot)
Voucher ──< VoucherRedemption >── Booking
```

## Models chi tiết

### User
| Field | Type | Notes |
|---|---|---|
| id | cuid | PK |
| email | string? | unique, nullable nếu đăng ký bằng phone |
| phone | string? | unique, E.164 |
| passwordHash | string? | argon2, nullable nếu social-only |
| fullName | string | |
| avatarUrl | string? | |
| dob | date? | |
| gender | enum | MALE/FEMALE/OTHER |
| locale | string | default 'vi' |
| role | enum | CUSTOMER/OWNER/STAFF/ADMIN/SUPER_ADMIN |
| emailVerified | bool | |
| phoneVerified | bool | |
| status | enum | ACTIVE/SUSPENDED/DELETED |
| createdAt, updatedAt | timestamptz | |

Index: (email), (phone), (role).

### Session / RefreshToken
- `RefreshToken { id, userId, tokenHash, deviceId?, ip, userAgent, expiresAt, revokedAt? }`
- Index: (userId, revokedAt), (tokenHash unique).

### Device
- `Device { id, userId, platform: IOS/ANDROID/WEB, fcmToken?, lastSeenAt }`
- Cho push notification.

### Sport
- `Sport { id, slug unique, nameVi, nameEn, icon, defaultSlotMinutes }`

### Venue
| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| ownerId | fk User | |
| name | string | |
| slug | string unique | |
| description | text | |
| addressLine | string | |
| ward, district, city, country | string | Legacy địa chỉ (trước reform 7/2025), giữ để backward-compat |
| newCity, newWard | string? | Địa chỉ sau cải cách hành chính 7/2025 — luôn populate khi tạo qua dropdown. Dùng làm cột chính cho search |
| provinceCode, wardCode | string? | Mã hành chính chính thức (theo openapi.vn / chinhphu.vn) |
| lat, lng | decimal | có index GiST cho geo |
| phone | string? | |
| status | enum | DRAFT/PENDING/APPROVED/SUSPENDED |
| ratingAvg | decimal(2,1) | denormalized |
| ratingCount | int | |
| searchVector | tsvector | trigger update |
| cancelPolicyJson | jsonb | override default policy |
| createdAt, updatedAt, deletedAt | | |

Index:
- GiST (lat, lng) for nearby search (hoặc dùng `earthdistance` extension).
- GIN (searchVector) cho FTS.

### VenueImage
- `{ id, venueId, url, key?, sort, isPrimary }`
- `key` là object path trong Supabase Storage (vd `venue/2026/uuid.jpg`). Null cho URL ngoài. Backend dùng để xoá file thật khi `DELETE /venues/owner/:id/images/:imageId`.
- Khi `isPrimary=true` qua API → các ảnh khác cùng venue tự bị `isPrimary=false`. Ảnh đầu tiên thêm vào sẽ auto-primary.
- URL public: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}` (bucket public, không cần signed read).
- VenueImage cũng dùng để lưu **video** (URL có đuôi `.mp4`/`.mov` → frontend render `<video>` thay vì `<img>`).

### Amenity / VenueAmenity
- `Amenity { id, slug, nameVi, nameEn, icon }` — danh mục.
- `VenueAmenity { venueId, amenityId }` — m–n.

### VenueHour
- `{ id, venueId, dayOfWeek(0–6), openTime, closeTime }`
- Nhiều record/ngày để hỗ trợ nghỉ trưa.

### VenueMember
- Cho phép owner cấp staff: `{ venueId, userId, role: MANAGER/STAFF }`.

### Court
| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| venueId | fk | |
| sportId | fk | |
| name | string | "Sân 1", "Sân A"... |
| surface | enum | NATURAL_GRASS/ARTIFICIAL_GRASS/WOOD/EPOXY/CLAY |
| indoor | bool | |
| capacity | int | số người tối đa |
| slotDurationMinutes | int | mặc định kế thừa từ Sport |
| isActive | bool | |
| createdAt, updatedAt, deletedAt | | |

### CourtClosure
- `{ id, courtId, startsAt, endsAt, reason }` — đóng tạm thời.

### PriceRule
| Field | Type |
|---|---|
| id | cuid |
| courtId | fk |
| dayOfWeek | int 0–6 |
| startTime | time |
| endTime | time |
| pricePerSlot | decimal(12,2) |

Ràng buộc: nhiều rule cho 1 court, không overlap (kiểm tra ở app + DB check).

### PriceOverride
- `{ id, courtId, date, startTime, endTime, price, reason }` — lễ, khuyến mãi.

### Booking — bảng trọng tâm
| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| code | string(8) unique | mã ngắn |
| userId | fk | |
| courtId | fk | |
| venueId | fk | denormalized cho query |
| startsAt | timestamptz | |
| endsAt | timestamptz | |
| status | enum | PENDING_PAYMENT/CONFIRMED/CHECKED_IN/COMPLETED/CANCELLED_BY_USER/CANCELLED_BY_OWNER/CANCELLED_TIMEOUT/NO_SHOW/REFUNDED |
| source | enum | ONLINE/WALK_IN |
| subtotal | decimal(12,2) | |
| discount | decimal(12,2) | |
| total | decimal(12,2) | |
| voucherId | fk? | |
| notes | text? | |
| checkInToken | string? | 1-time |
| checkedInAt | timestamptz? | |
| cancelledAt | timestamptz? | |
| cancelReason | text? | |
| refundAmount | decimal(12,2)? | |
| recurringGroupId | string? | nhóm các booking của 1 recurring series |
| createdAt, updatedAt | | |

**Exclusion constraint** (migration SQL):
```sql
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "courtId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE (status IN ('PENDING_PAYMENT','CONFIRMED','CHECKED_IN'));
```

Index:
- (userId, createdAt desc)
- (courtId, startsAt)
- (venueId, startsAt)
- (status) partial

### Payment
| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| bookingId | fk | nullable cho payment ngoài luồng (vd top-up tương lai) |
| userId | fk | |
| provider | enum | VNPAY/MOMO/ZALOPAY/STRIPE/BANK_TRANSFER |
| amount | decimal(12,2) | |
| currency | string(3) | mặc định VND |
| status | enum | PENDING/SUCCESS/FAILED/CANCELLED/EXPIRED/REFUND_PENDING/REFUNDED/PARTIALLY_REFUNDED |
| providerRef | string? | mã giao dịch bên provider |
| providerOrderId | string unique | mã đơn ta gửi sang provider |
| redirectUrl | text? | |
| qrData | text? | |
| paidAt | timestamptz? | |
| failedReason | string? | |
| metadata | jsonb | params hỗn hợp |
| createdAt, updatedAt | | |

Index: (bookingId), (providerOrderId unique), (status).

### PaymentEvent (idempotency cho webhook)
| Field | Type |
|---|---|
| id | cuid |
| paymentId | fk? |
| provider | enum |
| eventType | string |
| externalEventId | string |
| rawPayload | jsonb |
| signatureValid | bool |
| processedAt | timestamptz? |
| createdAt | timestamptz |

Unique: (provider, externalEventId).

### Refund
| Field | Type |
|---|---|
| id | cuid |
| paymentId | fk |
| amount | decimal(12,2) |
| reason | string |
| status | PENDING/SUCCESS/FAILED |
| providerRefundRef | string? |
| requestedById | fk User |
| createdAt, updatedAt | |

### Voucher / VoucherRedemption
- `Voucher { id, code unique, type(PERCENT/FIXED), value, maxDiscount?, minOrder?, validFrom, validTo, usageLimit, perUserLimit, scope(GLOBAL/VENUE/SPORT), scopeRefId?, isActive }`
- `VoucherRedemption { id, voucherId, userId, bookingId, amount, createdAt }`

### Review
- `{ id, userId, venueId, bookingId, rating(1-5), content, ownerReply?, ownerRepliedAt?, status(VISIBLE/HIDDEN), createdAt }`
- Unique (userId, bookingId).

### Favorite
- `{ userId, venueId }` composite PK.

### Notification / NotificationPreference
- `Notification { id, userId, type, title, body, dataJson, readAt?, createdAt }`
- `NotificationPreference { userId, type, channel(PUSH/EMAIL/SMS/IN_APP), enabled }`

### MediaAsset
- `{ id, ownerType(VENUE/COURT/USER/REVIEW), ownerId, key(S3 key), url, mimeType, sizeBytes, width?, height?, createdAt }`

### BankAccount / OwnerEarning / Payout
- `BankAccount { id, userId, bankCode, accountNumber, accountHolder, isDefault }`
- `OwnerEarning { id, ownerId, bookingId, paymentId, gross, commission, netAmount, status(PENDING/PAID), payoutId?, createdAt }`
- `Payout { id, ownerId, periodFrom, periodTo, amount, status(PENDING/PROCESSING/PAID/FAILED), bankAccountId, reference?, createdAt, paidAt? }`

### AuditLog
- `{ id, actorId, actorRole, action, resourceType, resourceId, beforeJson?, afterJson?, ip, userAgent, createdAt }`

### Permission / RolePermission (RBAC động)
- `Permission { id, key (unique, vd: "venue.approve"), category, description, createdAt }`
- `RolePermission { role, permissionId, grantedBy?, createdAt }` — composite PK `(role, permissionId)`.
- Seed 23 permission mặc định lần đầu khi gọi `GET /system/permissions`. SUPER_ADMIN tự động có toàn bộ; ADMIN có 18 quyền vận hành mặc định.
- Guard `PermissionsGuard` + decorator `@RequirePermission('key')` để check runtime. SUPER_ADMIN bypass.

## Quy ước index quan trọng

- Mọi FK → index.
- Composite index cho query thường dùng: `(courtId, startsAt)` trên Booking, `(venueId, status)` trên Court.
- Partial index cho status active: `WHERE status NOT IN ('DELETED','CANCELLED_*')`.

## Extensions cần bật
```sql
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- cho exclusion constraint
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- cho similarity search
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;  -- nếu dùng geo đơn giản
```

## Migration strategy

- Prisma migrate cho schema.
- Mọi constraint/extension Postgres-only → đặt trong migration SQL thủ công (`prisma migrate dev --create-only` rồi sửa).
