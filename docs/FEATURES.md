# Backend Features — Sports Booking App

Tài liệu liệt kê đầy đủ chức năng của backend (NestJS). Mỗi mục bao gồm: mô tả ngắn, endpoint chính, ràng buộc/luật nghiệp vụ, và phụ thuộc.

## 0. Kiến trúc & nền tảng

- **Framework**: NestJS 10 (modular, DI)
- **ORM**: Prisma + PostgreSQL 16
- **Cache & Queue**: Redis (ioredis) + BullMQ
- **Auth**: JWT (access + refresh) + Passport + Argon2 hash
- **Validation**: class-validator + class-transformer + ZodPipe (cho payload phức tạp)
- **API docs**: Swagger (`/docs`) — chỉ bật ở dev/staging
- **Logging**: pino (JSON, request-id trong mọi log)
- **Rate limit**: `@nestjs/throttler` + Redis store
- **Health**: `@nestjs/terminus` (`/health`, `/health/db`, `/health/redis`)
- **Error format**: chuẩn RFC 7807 `{ code, message, details? }`
- **i18n**: VI/EN cho thông báo lỗi và email/SMS template
- **Audit log**: bảng `AuditLog` ghi mọi thay đổi nhạy cảm (booking, payment, role)

## 1. Authentication & Account

### 1.1. Đăng ký
- `POST /auth/register` — email + password (hoặc số điện thoại).
- Yêu cầu xác thực OTP qua SMS (Twilio/SpeedSMS) hoặc email link.
- Mặc định role = `CUSTOMER`.

### 1.2. Đăng nhập
- `POST /auth/login` — trả về access token (15') + refresh token (30 ngày, HttpOnly cookie hoặc body cho mobile).
- Chống brute-force: lock 15' sau 5 lần sai (theo IP + tài khoản).

### 1.3. Refresh & Logout
- `POST /auth/refresh` — quay vòng refresh token (rotation), revoke token cũ.
- `POST /auth/logout` — revoke tất cả refresh token của session hiện tại.
- `POST /auth/logout-all` — revoke tất cả thiết bị.

### 1.4. Social login
- `GET /auth/google` & `GET /auth/google/callback` (Passport Google OAuth20).
- Có thể bật thêm Facebook/Apple cho mobile.

### 1.5. Quên & đổi mật khẩu
- `POST /auth/forgot-password` — gửi link reset (token 1 lần dùng, hết hạn 30').
- `POST /auth/reset-password`
- `POST /auth/change-password` (đã đăng nhập).

### 1.6. Xác thực OTP
- `POST /auth/otp/send` — gửi OTP cho số điện thoại (rate-limit 1 lần/60s).
- `POST /auth/otp/verify` — verify OTP, đánh dấu `phoneVerified = true`.

### 1.7. Phiên & thiết bị
- `GET /me/sessions` — liệt kê thiết bị đang đăng nhập.
- `DELETE /me/sessions/:id` — đăng xuất 1 thiết bị.

## 2. User & Profile

- `GET /me` — thông tin cá nhân.
- `PATCH /me` — họ tên, avatar, ngày sinh, giới tính.
- `POST /me/avatar` — upload avatar (signed S3 URL).
- `GET /me/bookings` — lịch sử đặt sân (filter theo trạng thái).
- `GET /me/favorites` — danh sách sân yêu thích.
- `POST /me/favorites/:venueId` / `DELETE /me/favorites/:venueId`.
- `GET /me/wallet` — credit/refund balance (nếu có voucher/đền bù).
- `PATCH /me/locale` — đổi ngôn ngữ VI/EN.

## 3. Roles & Permissions

- Roles: `CUSTOMER`, `OWNER` (chủ sân), `STAFF` (nhân viên), `ADMIN`, `SUPER_ADMIN`.
- RBAC role-based bằng `@Roles()` + `RolesGuard` (vào theo role).
- **Permission-based (động)**: bảng `Permission` + `RolePermission` cho phép SUPER_ADMIN bật/tắt quyền chi tiết cho từng role qua UI mà không cần deploy lại.
  - Guard: `@RequirePermission('key')` + `PermissionsGuard`.
  - SUPER_ADMIN luôn pass mọi permission check; không cho phép sửa permission của SUPER_ADMIN từ UI để tránh tự khóa.
  - 23 permission mặc định seed lần đầu (Venue/Booking/User/Voucher/Payout/Dispute/Report/Audit/System).
- OWNER chỉ thao tác được trên Venue mà họ sở hữu (scope guard).
- STAFF được OWNER cấp quyền theo từng venue (`VenueMember` table).

### Endpoint
- `POST /owner/apply` — user gửi đơn xin lên OWNER (kèm giấy tờ).
- `POST /admin/owners/:id/approve` & `/reject` — admin duyệt.
- `GET /system/permissions` — list toàn bộ permission (auto-seed lần đầu).
- `GET /system/permissions/matrix` — trả về `{ roles, permissions, grants }` để render bảng tích chọn.
- `PUT /system/permissions/:role` — body `{ keys: string[] }`, replace toàn bộ permission của role. Ghi `AuditLog` với action `ROLE_PERMISSIONS_UPDATE`. **SUPER_ADMIN only**.

## 4. Sports & Categories

- `GET /sports` — danh sách môn thể thao (football_5, football_7, badminton, tennis, pickleball, basketball, volleyball, table_tennis...).
- `GET /sports/:slug` — chi tiết môn (mô tả, icon, luật khung giờ mặc định).
- `POST/PUT/DELETE /admin/sports` — admin quản lý danh mục.

## 5. Venues (Cụm sân)

Một **Venue** là 1 địa điểm vật lý (ví dụ "Sân bóng A Phú Mỹ Hưng"). Một venue có nhiều **Court** (sân con).

### Customer
- `GET /venues` — tìm kiếm:
  - filter: sport, city, district, ngày + khung giờ rảnh, giá, tiện ích, rating
  - sort: distance (theo lat/lng), price, rating
  - phân trang cursor-based
- `GET /venues/:id` — chi tiết: ảnh, mô tả, địa chỉ, sân, tiện ích, đánh giá, FAQ.
- `GET /venues/:id/availability?date=YYYY-MM-DD&sportId=...` — lịch trống theo ngày.
- `GET /venues/nearby?lat=..&lng=..&radiusKm=5`.

### Owner
- `POST /owner/venues` — tạo venue (cần duyệt admin trước khi public).
- `PATCH /owner/venues/:id` — cập nhật.
- `POST /owner/venues/:id/images` — upload nhiều ảnh.
- `POST /owner/venues/:id/amenities` — gắn tiện ích (wifi, đèn LED, phòng thay đồ...).
- `POST /owner/venues/:id/hours` — giờ mở cửa theo thứ trong tuần + ngày lễ.

### Admin
- `GET /admin/venues?status=PENDING` — duyệt venue mới.
- `POST /admin/venues/:id/approve` / `/reject` / `/suspend`.

## 6. Courts (Sân con)

- Mỗi Court thuộc 1 Venue, có 1 Sport, có cấu hình riêng (số người, loại mặt sân: cỏ tự nhiên / cỏ nhân tạo / gỗ / sơn epoxy, có mái che).

### Owner
- `POST /owner/venues/:venueId/courts` — tạo sân con.
- `PATCH /owner/courts/:id` — sửa.
- `POST /owner/courts/:id/closures` — đóng sân tạm thời (bảo trì, mưa).
- `DELETE /owner/courts/:id` — xoá (soft delete nếu đã có booking).

### Customer
- `GET /courts/:id` — chi tiết sân + bảng giá.

## 7. Pricing (Bảng giá)

Giá tính theo **slot** thời gian, biến đổi theo:
- ngày trong tuần (weekday vs weekend)
- khung giờ (sáng/trưa/tối)
- ngày lễ
- combo (đặt theo tháng, theo gói)

### Models
- `PriceRule`: court_id, day_of_week (0–6), start_time, end_time, price_per_slot, slot_duration_minutes (mặc định 60).
- `PriceOverride`: court_id, date, start_time, end_time, price (cho lễ/khuyến mãi).

### Endpoint
- `GET /courts/:id/price?date=...&start=...&end=...` — báo giá trước khi đặt.
- `POST /owner/courts/:id/price-rules` / PATCH / DELETE.
- `POST /owner/courts/:id/price-overrides`.

## 8. Bookings (Đặt sân) — module trọng tâm

### Luồng đặt sân
1. Customer gọi `POST /bookings/quote` với `courtId`, `startsAt`, `endsAt` → server trả giá + giữ slot 10 phút (`HoldToken` lưu Redis).
2. Customer gọi `POST /bookings` với `holdToken` → tạo booking `PENDING_PAYMENT`.
3. Server tạo payment intent (VNPay/MoMo/ZaloPay) → trả URL/QR redirect.
4. Sau khi gateway callback → booking chuyển `CONFIRMED`. Nếu không trả tiền trong 15' → tự huỷ qua BullMQ delayed job.

### Trạng thái booking
`PENDING_PAYMENT` → `CONFIRMED` → `CHECKED_IN` → `COMPLETED`
- Nhánh huỷ: `CANCELLED_BY_USER`, `CANCELLED_BY_OWNER`, `CANCELLED_TIMEOUT`, `REFUNDED`.

### Chống trùng giờ (anti-double-booking)
**Tầng DB**: Postgres exclusion constraint dùng `tstzrange` + `EXCLUDE USING gist`:
```sql
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('PENDING_PAYMENT','CONFIRMED','CHECKED_IN'));
```

**Tầng app**: serializable transaction + advisory lock theo court_id khi tạo booking.

### Endpoint
- `POST /bookings/quote` — báo giá + giữ slot.
- `POST /bookings` — tạo booking.
- `GET /bookings/:id` — chi tiết.
- `POST /bookings/:id/cancel` — huỷ (chính sách hoàn tiền theo thời điểm).
- `POST /bookings/:id/check-in` — chủ sân/staff scan QR check-in (1-time token gắn booking).
- `POST /bookings/:id/no-show` — chủ sân đánh dấu không tới (sau 15' từ start_time).
- `POST /bookings/:id/reschedule` — đổi giờ (cùng court, tuỳ chính sách).

### Recurring bookings (đặt định kỳ)
- `POST /bookings/recurring` — đặt theo tuần/tháng (vd: thứ 2 + thứ 4 hàng tuần, 8 tuần).
- Server tạo nhiều booking con, kiểm tra conflict từng slot.

### Booking cho khách (offline)
- OWNER có thể nhập booking thủ công cho khách không qua app (`source = WALK_IN`).

### Chính sách huỷ
- ≥24h trước giờ chơi: hoàn 100%
- 12–24h: hoàn 50%
- <12h: không hoàn
- Cấu hình được override theo venue trong bảng `VenueCancelPolicy`.

## 9. Payments

### Providers
- **VNPay** — redirect tới `vnpayment.vn`, callback qua IPN URL + Return URL. Verify `vnp_SecureHash` (HMAC-SHA512).
- **MoMo** — One-time payment (AIO v2), callback IPN. Verify chữ ký HMAC-SHA256.
- **ZaloPay** — Order create, callback verify `mac` HMAC-SHA256.
- Có thể thêm: **Stripe** (thẻ quốc tế), **Bank transfer** (manual).

### Kiến trúc
- Một interface chung `PaymentProvider`:
  ```ts
  interface PaymentProvider {
    createPayment(input: CreatePaymentInput): Promise<{ redirectUrl?: string; qrData?: string; providerRef: string }>;
    verifyCallback(payload: unknown, headers: Record<string,string>): Promise<VerifiedCallback>;
    queryStatus(providerRef: string): Promise<PaymentStatus>;
    refund(input: RefundInput): Promise<RefundResult>;
  }
  ```
- Mỗi provider implement riêng. Factory chọn theo `provider` field của Payment.

### Endpoint
- `POST /payments` — tạo payment cho booking (`{ bookingId, provider }`).
- `GET /payments/:id` — trạng thái.
- `POST /payments/webhooks/vnpay` (IPN — server-to-server)
- `GET /payments/return/vnpay` (Return URL — user về app)
- `POST /payments/webhooks/momo`
- `POST /payments/webhooks/zalopay`
- `POST /payments/:id/refund` — owner/admin chủ động hoàn tiền (hoặc auto theo cancel policy).
- `GET /me/payments` — lịch sử thanh toán của user.

### Bảo mật webhook
- Verify signature/HMAC bắt buộc.
- Idempotency: bảng `PaymentEvent` lưu mọi callback (raw payload, headers, kết quả). Dùng `providerRef + eventId` làm unique key.
- Retry-safe: webhook trả 200 sau khi đã xử lý hoặc đã ghi nhận (kể cả lần trùng).
- IP allowlist cho IPN nếu provider cung cấp.

### Reconciliation
- Cron job 30' chạy `queryStatus` cho payment `PENDING` quá 10' để bù trường hợp mất webhook.
- Báo cáo đối soát hàng ngày: export CSV giao dịch của owner theo ngày.

### Hoàn tiền
- Trigger:
  - User huỷ theo cancel policy.
  - Owner huỷ booking đã CONFIRMED → hoàn 100% + voucher xin lỗi (tuỳ chính sách).
  - Admin xử lý dispute.
- Nếu provider không hỗ trợ API refund (vd thẻ ATM nội địa qua VNPay) → flag `MANUAL_REFUND_REQUIRED` để vận hành xử lý.

## 10. Vouchers & Promotions

- `Voucher`: code, type (PERCENT/FIXED), value, max_discount, min_order, valid_from/to, usage_limit, per_user_limit, scope (toàn hệ thống / theo venue / theo sport).
- `POST /vouchers/apply` — validate khi quote booking.
- `POST /admin/vouchers` — admin tạo.
- `POST /owner/venues/:id/vouchers` — owner tạo voucher cho venue của mình.
- Chống lạm dụng: rate-limit + atomic decrement counter trong Redis.

## 11. Reviews & Rating

- `POST /venues/:id/reviews` — chỉ user đã `COMPLETED` ít nhất 1 booking ở venue được review.
- `GET /venues/:id/reviews?sort=recent|rating`.
- `POST /owner/reviews/:id/reply` — owner phản hồi.
- `POST /admin/reviews/:id/hide` — admin ẩn review vi phạm.
- Tự động tính `Venue.ratingAvg` và `ratingCount` qua trigger hoặc job.

## 12. Notifications

- Channels: Push (FCM), Email (Nodemailer + Mailgun/SES), SMS (Twilio/SpeedSMS), In-app.
- Sự kiện: booking_created, payment_success, payment_failed, booking_reminder (T-2h), booking_cancelled, new_review, owner_payout, promo.
- Cấu hình per-user: `NotificationPreference` bật/tắt từng kênh × loại.
- BullMQ queue `notifications` với retry exponential backoff.

### Endpoint
- `POST /devices` — đăng ký FCM token (mobile).
- `DELETE /devices/:id`.
- `GET /me/notifications` — feed in-app.
- `POST /me/notifications/:id/read`.

## 13. Uploads

- Tất cả upload qua **signed URL** (S3/MinIO) — backend ký URL, client PUT trực tiếp.
- `POST /uploads/sign` — `{ kind: 'avatar'|'venue'|'court'|'review', contentType, sizeBytes }` → trả `{ uploadUrl, fileKey, expiresIn }`.
- Sau khi client upload xong → `POST /uploads/commit` để backend xác nhận file tồn tại + tạo record `MediaAsset`.
- Limit: avatar ≤ 5MB, ảnh khác ≤ 10MB, chỉ chấp nhận image/jpeg, image/png, image/webp.

## 14. Search & Discovery

- Full-text search venue (name, description, address) dùng Postgres `tsvector` + GIN index.
- Trigger cập nhật cột `searchVector` khi insert/update.
- Recommendation đơn giản: "Sân gần bạn", "Sân phổ biến tuần này" (đếm booking 7 ngày gần nhất).

## 15. Reports & Analytics (cho Owner & Admin)

### Owner dashboard
- `GET /owner/reports/revenue?from=&to=&groupBy=day|week|month`
- `GET /owner/reports/occupancy?venueId=&from=&to=` — tỉ lệ lấp đầy theo court & khung giờ.
- `GET /owner/reports/top-customers`
- `GET /owner/reports/payments?status=...`

### Admin dashboard
- Tổng GMV, số booking, số user mới, top venue, churn.
- Export CSV/XLSX.

## 16. Admin module

- Quản lý user (khoá/mở, xoá).
- Quản lý venue (duyệt, suspend).
- Quản lý dispute/refund.
- Quản lý voucher toàn cục, sport, amenity.
- Cấu hình hệ thống (commission %, cancel policy mặc định, payout schedule).
- Audit log viewer.

## 17. Payout (Trả tiền cho chủ sân)

- Sau khi booking COMPLETED → tách thành `OwnerEarning` (booking_amount - commission - payment_fee).
- Cron job hàng tuần/tháng tổng hợp → tạo `Payout` (chuyển khoản ngân hàng).
- Owner cấu hình tài khoản ngân hàng trong `BankAccount`.
- Webhook bank (nếu có) hoặc admin xác nhận manual.

## 18. Cron jobs / Scheduled tasks

| Job | Lịch | Mô tả |
|---|---|---|
| `cancelExpiredBookings` | mỗi phút | huỷ booking PENDING_PAYMENT quá 15' |
| `releaseHolds` | mỗi phút | xoá hold slot Redis hết hạn |
| `reconcilePayments` | mỗi 30' | query lại payment PENDING |
| `sendBookingReminders` | mỗi 10' | push thông báo T-2h |
| `markNoShow` | mỗi 5' | đánh dấu CHECKED_IN không tới |
| `aggregateRatings` | mỗi giờ | tính lại ratingAvg |
| `generatePayouts` | thứ 2 hàng tuần 02:00 | tạo payout |
| `dailyReport` | 06:00 mỗi ngày | email báo cáo cho owner |

## 19. Realtime (WebSocket)

- Namespace `/venues/:id` — broadcast khi có booking mới → frontend owner cập nhật lịch ngay.
- Namespace `/me` — booking status, payment status update cho user.
- Auth qua JWT trong handshake.

## 20. Security checklist

- HTTPS bắt buộc (HSTS).
- Helmet headers.
- CORS allowlist (web + mobile origin).
- Rate limit per-IP và per-user.
- Validate mọi input (class-validator / Zod).
- Mã hoá field nhạy cảm (CMND nếu có) bằng AES-GCM.
- Backup DB hàng ngày, retention 30 ngày.
- Secrets qua env, không commit.
- Sentry cho error tracking.

## 21. Testing strategy

- Unit test: services có business logic phức tạp (pricing, booking conflict, payment signature).
- Integration test: dùng `testcontainers` chạy Postgres thật cho mỗi suite.
- Contract test: payment provider mock server (replay fixtures).
- E2E test: Playwright/Newman cho luồng đặt-thanh-toán hoàn chỉnh (sandbox).

## 22. Tóm tắt module structure

```
src/modules/
├── auth/           Login, register, OTP, refresh, social
├── users/          Profile, sessions, devices, preferences
├── sports/         Catalog of sports
├── venues/         CRUD venue, search, approval
├── courts/         CRUD court, closures
├── pricing/        Price rules, overrides, quote engine
├── bookings/       Quote, create, cancel, reschedule, check-in
├── payments/       Providers (VNPay, MoMo, ZaloPay), webhooks, refunds
│   └── providers/
├── vouchers/       Promo codes
├── reviews/        Ratings, replies, moderation
├── notifications/  Push, email, SMS, in-app
├── uploads/        Signed URLs, MediaAsset
├── reports/        Owner & admin analytics
├── admin/          Platform admin
└── payout/         Owner payout & bank accounts
```
