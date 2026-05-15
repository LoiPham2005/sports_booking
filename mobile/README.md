# Sports Booking — Mobile (Flutter)

UI hoàn chỉnh trên mock data. Khi backend stable, swap layer mock bằng API calls.

## Stack

- Flutter 3.22+ Material 3
- go_router, google_fonts (Inter), cached_network_image, qr_flutter, intl

## Chạy thử

```bash
cd mobile
flutter pub get
flutter run                  # mặc định mở thiết bị đang kết nối
```

## Cấu trúc

```
lib/
├── main.dart
├── app.dart
├── features/
│   ├── splash/      Splash + Onboarding
│   ├── auth/        Login / Register / Forgot
│   ├── main/        BottomNavigation shell
│   ├── home/        Tab Trang chủ
│   ├── venues/      Tab Khám phá + Detail + Booking sheet
│   ├── bookings/    Tab Booking + New + Result + Detail
│   └── account/     Tab Tài khoản + Profile + Favorites + Notifications + Settings
└── shared/
    ├── theme/       AppColors / AppTheme
    ├── routing/     AppRouter + RoutePaths
    ├── mock/        Mock data
    ├── utils/       format.dart
    └── widgets/     VenueCard / SportChip / SlotGrid / PaymentMethodTile / StatusBadge
```

## Tour màn hình

1. **Splash** (1.5s gradient) → **Onboarding** (3 slide)
2. **Login** / **Register** / **Forgot password** (OTP 6 ô)
3. **Main shell** — 4 tab + FAB tìm sân
4. **Home tab** — hero search, sport chips ngang, promo banner gradient, sân gần bạn carousel, booking sắp tới, sân nổi bật
5. **Venues tab** — search bar + filter chip + bottom-sheet bộ lọc đầy đủ (giá range, tiện ích, rating)
6. **Venue detail** — SliverAppBar collapse, 4 tab (Tổng quan / Sân & Giá / Đánh giá / Vị trí), bottom CTA mở booking sheet
7. **Booking sheet** — chọn sân, ngày (carousel 14 ngày), grid khung giờ, voucher, summary
8. **Booking new** — 2 step (Xem lại → Thanh toán) với 3 cổng VNPay/MoMo/ZaloPay
9. **Booking result** — success/fail với mã QR code
10. **My Bookings** — 3 tab Sắp tới / Hoàn thành / Đã huỷ
11. **Booking detail** — header gradient, QR check-in, timeline trạng thái
12. **Account tab** — header user + level, KPI strip, sections
13. **Profile / Favorites / Notifications / Settings** (đầy đủ)

## Design tokens

| Token | Value |
|---|---|
| Primary | `#10B981` emerald-500 |
| Accent | `#F97316` orange-500 |
| VNPay | `#1E40AF` |
| MoMo | `#D82D8B` |
| ZaloPay | `#0EA5E9` |
| Radius | 12 / 16 / 24 |
| Font | Inter (Google Fonts) |

Light mode mặc định. Dark mode đã chuẩn bị trong `AppTheme.dark()` — bật bằng cách đổi `themeMode: ThemeMode.dark` trong `app.dart`.

## Chuyển từ mock sang API (sau)

1. `flutter pub add dio` (hoặc dùng `http`)
2. Tạo `lib/data/repositories/venues_repository.dart`
3. Thay `MockData.venues` (static) → `await venuesRepo.list()`
4. Cân nhắc thêm Riverpod nếu cần caching/state phức tạp

UI không phải sửa.
