# Sports Booking — Backend

NestJS 10 + Prisma + PostgreSQL 16 + Redis. Tích hợp thanh toán **VNPay, MoMo, ZaloPay**.

## Tính năng nổi bật

- Quản lý user/venue/court/sport với role-based access (CUSTOMER/OWNER/STAFF/ADMIN).
- Đặt sân với **chống trùng giờ 2 tầng**:
  1. Redis hold slot 10 phút khi quote.
  2. Postgres exclusion constraint (`EXCLUDE USING gist`) — không thể tạo 2 booking active overlap dù race condition.
- Định giá theo bảng giá (rule theo dayOfWeek/khung giờ + override theo ngày).
- Thanh toán qua **VNPay / MoMo / ZaloPay** với:
  - Verify chữ ký HMAC bắt buộc.
  - Idempotency qua bảng `PaymentEvent` (unique provider+externalEventId).
  - Cron reconcile pending payments mỗi 30' (bù trường hợp mất webhook).
  - Refund API thống nhất.
- Auto huỷ booking PENDING_PAYMENT quá 15' qua cron.
- Tách commission cho platform → tạo `OwnerEarning`.
- Reviews, favorites, notifications, signed upload URL, audit log.

## Chạy thử

```bash
# 1. Khởi động phụ thuộc
docker compose up -d

# 2. Cài deps
pnpm install        # hoặc npm install / yarn

# 3. Tạo .env
cp .env.example .env
# (Tuỳ chọn) điền VNPAY/MOMO/ZALOPAY sandbox keys

# 4. Migrate + seed
pnpm prisma:migrate
psql "$DATABASE_URL" -f prisma/migrations/000_init_extensions.sql   # bật extension + exclusion constraint
pnpm prisma:seed

# 5. Run
pnpm start:dev
```

Mặc định:
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/health
- MinIO console: http://localhost:9001 (minioadmin/minioadmin)
- Mailhog: http://localhost:8025

Tài khoản seed:
- Admin: `admin@sportsbooking.local` / `admin@1234`
- Owner: `owner@sportsbooking.local` / `owner@1234`

## Sandbox keys cho payment

### VNPay
1. Đăng ký tại https://sandbox.vnpayment.vn
2. Lấy `vnp_TmnCode` và `vnp_HashSecret`, điền vào `.env`.

### MoMo
1. Đăng ký test merchant tại https://developers.momo.vn
2. Lấy partnerCode, accessKey, secretKey.
3. Sandbox endpoint đã có sẵn trong `.env.example`.

### ZaloPay
Sandbox dùng chung key dành cho mọi developer:
```
APP_ID = 2554
KEY1   = sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn
KEY2   = trMrHtvjo6myautxDUiAcYsVtaeQ8nhf
```
Đã preset trong `.env.example`.

## Webhook URL cho từng provider (config trong merchant portal)

| Provider | URL |
|---|---|
| VNPay IPN | `https://<your-domain>/api/v1/payments/webhooks/vnpay` |
| VNPay Return | `https://<your-domain>/api/v1/payments/return/vnpay` |
| MoMo IPN | `https://<your-domain>/api/v1/payments/webhooks/momo` |
| MoMo Redirect | `https://<your-domain>/api/v1/payments/return/momo` |
| ZaloPay Callback | `https://<your-domain>/api/v1/payments/webhooks/zalopay` |
| ZaloPay Redirect | `https://<your-domain>/api/v1/payments/return/zalopay` |

Localhost test → dùng `ngrok` hoặc `cloudflared tunnel`.

## Cấu trúc thư mục

```
src/
├── main.ts
├── app.module.ts
├── config/
├── prisma/
├── common/         (filters, guards, decorators, redis, utils)
└── modules/
    ├── health/
    ├── auth/
    ├── users/
    ├── sports/
    ├── venues/
    ├── courts/
    ├── pricing/
    ├── bookings/
    ├── payments/
    │   ├── providers/   ← vnpay, momo, zalopay
    │   ├── dto/
    │   └── interfaces/
    ├── reviews/
    ├── notifications/
    └── uploads/
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    └── 000_init_extensions.sql   ← btree_gist + exclusion constraint
```

## Luồng đặt sân

```
1. POST /bookings/quote      → trả giá + holdToken (giữ slot 10')
2. POST /bookings            → tạo Booking PENDING_PAYMENT
3. POST /payments            → tạo Payment, trả redirectUrl / qrData
4. Người dùng thanh toán trên VNPay/MoMo/ZaloPay
5. Provider gọi webhook IPN  → verify signature → Booking CONFIRMED
6. Tới giờ → owner check-in → COMPLETED → owner_earnings được tạo
```

## Kiểm thử nhanh (cURL)

```bash
# Login
curl -X POST localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"admin@sportsbooking.local","password":"admin@1234"}'

# Search venues
curl 'localhost:3000/api/v1/venues?city=H%E1%BB%93%20Ch%C3%AD%20Minh'
```

## Bảo mật

- HTTPS bắt buộc trên prod (HSTS).
- Mọi webhook đều verify HMAC, lưu `PaymentEvent` để idempotent.
- Refresh token rotation, lưu `hash` (sha256), không lưu plain.
- Argon2 cho password.
- Rate limit qua Throttler (global) — nâng cao có thể bật per-endpoint.
