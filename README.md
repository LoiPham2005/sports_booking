# Sports Booking App

Ứng dụng đặt sân thể thao (bóng đá, cầu lông, tennis, pickleball, bóng rổ...). Hỗ trợ người chơi tìm và đặt sân, chủ sân quản lý lịch và doanh thu, admin vận hành nền tảng.

## Stack

- **Backend**: NestJS 10 + Prisma + PostgreSQL 16 + Redis
- **Frontend**: Next.js 14 + Tailwind CSS + Radix UI (UI hoàn chỉnh trên mock data)
- **Mobile**: Flutter 3.22 + Material 3 + go_router (UI hoàn chỉnh trên mock data)
- **Payments**: VNPay, MoMo, ZaloPay
- **Storage**: S3-compatible (MinIO local / AWS S3 prod)

## Cấu trúc thư mục

```
sports_booking/
├── backend/        NestJS API server
├── frontend/       Next.js 14 web app
├── mobile/         Flutter mobile app
├── docs/
│   ├── FEATURES.md     Chức năng backend
│   ├── DATABASE.md     Thiết kế DB chi tiết
│   ├── FRONTEND.md     Sitemap & design system web
│   └── MOBILE.md       Sitemap & design system mobile
└── README.md
```

## Quick start

### Backend
```bash
cd backend
cp .env.example .env
docker compose up -d           # Postgres + Redis + MinIO
npm install
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/migrations/000_init_extensions.sql
npm run prisma:seed
npm run start:dev              # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # http://localhost:3001
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

API ở `:3000`, Swagger ở `/docs`. Web ở `:3001`. Mobile build qua Flutter trên iOS/Android emulator.
