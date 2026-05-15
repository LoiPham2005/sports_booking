# Mobile Design — Sports Booking (Flutter)

UI-only Flutter app, mock data, chưa nối API. Khi backend sẵn sàng chỉ cần thay layer `mock/` bằng repository gọi REST.

## Tech stack

- **Flutter 3.x** (Material 3)
- **Dart ^3.4**
- **Routing**: `go_router` (plain `GoRoute`, không codegen)
- **Icons**: built-in Material + `cupertino_icons`
- **Images**: `cached_network_image`
- **Fonts**: `google_fonts` (Inter, fallback hệ thống)
- **State**: `ValueNotifier`/`setState` cho UI demo (sau này swap Riverpod/Bloc)

## Design system

### Tokens
| Token | Value | Note |
|---|---|---|
| `primary` | `#10B981` (emerald-500) | Brand chính, đồng bộ với web |
| `accent` | `#F97316` (orange-500) | CTA, badge |
| `success` | `#22C55E` | |
| `warning` | `#F59E0B` | |
| `danger` | `#EF4444` | |
| Radius | 12 / 16 / 24 | sm/md/lg |
| Spacing | 4/8/12/16/20/24/32 | scale 4px |

### Typography
Inter (Google Fonts):
- Display 28/700 — titles
- Title 20/700 — section headers
- Body 14/400 — text
- Caption 12/500 — metadata
- Mono 14 (JetBrains Mono) cho mã booking

### Light/Dark
- ThemeMode `system` mặc định, người dùng có thể đổi trong Cài đặt.

## Cấu trúc thư mục

```
lib/
├── main.dart                    Entry point
├── app.dart                     MaterialApp.router root
├── features/
│   ├── splash/                  Splash 1.5s → main (chung mọi role)
│   ├── auth/                    Login (3 mode demo), Register, Forgot, OTP (chung)
│   ├── customer/                Mọi flow của người chơi
│   │   ├── main/                Shell có bottom navigation
│   │   ├── home/                Tab Trang chủ
│   │   ├── venues/              Tab Khám phá + chi tiết sân
│   │   ├── bookings/            Booking flow + detail + QR
│   │   └── account/             Profile + favorites + notifications + settings
│   ├── owner/                   Dashboard mini cho chủ sân
│   └── staff/                   App siêu gọn để check-in tại sân
└── shared/
    ├── theme/                   AppTheme, AppColors, AppTextStyles
    ├── routing/                 AppRouter, RoutePaths
    ├── mock/                    Mock data + types
    └── widgets/                 Reusable: VenueCard, SportChip, SlotGrid, etc.
```

## Sitemap

```
/splash
/onboarding                Chỉ hiện lần đầu (cờ trong SharedPreferences sau)
/login                     Email/phone + password + Google
/register                  Tạo tài khoản
/forgot-password           Gửi OTP
/main                      Shell có BottomNavigationBar
  └─ tab 0: /home
     tab 1: /venues
     tab 2: /bookings
     tab 3: /account
/venues/:id                Chi tiết venue (modal sheet booking widget)
/booking/new               Booking flow (3 step modal)
/booking/result            Thanh toán xong
/bookings/:id              Chi tiết booking + QR
/account/profile
/account/favorites
/account/notifications
/account/settings
```

## Các màn hình

### 1. Splash
Logo + gradient nền emerald → orange, animation fade-in, sau 1.5s push tới `/main` (hoặc `/login` nếu chưa đăng nhập).

### 2. Onboarding (3 slide)
1. "Đặt sân chỉ 30s"
2. "Đa dạng môn — Bóng đá, cầu lông, tennis, pickleball..."
3. "Thanh toán an toàn qua VNPay, MoMo, ZaloPay"
PageIndicator + nút "Bỏ qua" / "Tiếp tục".

### 3. Auth
- **Login**: TextField identifier + password, "Đăng nhập với Google", quên mật khẩu, link register.
- **Register**: Họ tên + email + phone + password + checkbox điều khoản.
- **Forgot password**: Step 1 nhập email/phone → Step 2 nhập OTP 6 số + new password.
- **OTP input**: 6 ô vuông, auto focus next.

### 4. Main shell (BottomNavigationBar)
4 tab: Trang chủ · Khám phá · Booking · Tài khoản.
- FloatingActionButton ở giữa (Quick book → trang search).
- Curved Bottom Nav (custom paint hoặc default Material).

### 5. Home tab
- AppBar có greeting "Chào Minh 👋" + avatar + chuông thông báo (badge số).
- Search bar (giả lập, tap → push search page).
- Hero card "Khuyến mãi 20% sân cầu lông cuối tuần" (gradient).
- **Sport chip row** (horizontal scroll, 8 icon).
- **Sân gần bạn**: horizontal carousel VenueCard.
- **Đặt lại** (nếu có lịch sử): card mini của booking gần nhất.
- **Sân nổi bật** (vertical list 3-4 venue).

### 6. Venues search
- AppBar: ô search dài, filter button bên phải.
- Sliver list venue card đầy đủ thông tin.
- BottomSheet "Bộ lọc": môn / quận / khoảng giá (slider) / tiện ích / rating.
- Toggle map view (placeholder).
- Empty state khi không có kết quả.

### 7. Venue detail
- SliverAppBar collapse (hero image full-width).
- Title + rating + địa chỉ + chip môn.
- Tabs: Tổng quan / Sân & Giá / Đánh giá / Vị trí.
- **Sticky bottom**: nút "Đặt sân — từ 150.000₫/h" → mở BookingSheet.

### 8. BookingSheet (DraggableScrollableSheet)
- Chọn sân (chip), DatePicker (horizontal week), grid khung giờ.
- Voucher input.
- Tổng tiền real-time.
- Button "Tiếp tục thanh toán" → push `/booking/new`.

### 9. Booking flow `/booking/new`
3 bước (PageView ngang):
1. **Xem lại**: card venue + thông tin chi tiết + textarea ghi chú.
2. **Chính sách huỷ**: callout primary.
3. **Phương thức thanh toán**: 3 card VNPay / MoMo / ZaloPay, radio.
Bottom bar luôn hiện tổng tiền + countdown 10' giữ chỗ + nút primary.

### 10. Booking result `/booking/result?status=success`
- Lottie/icon to (success ✓ tròn xanh hoặc fail ✗ đỏ).
- Mã booking đậm.
- Nút "Xem booking" + "Về trang chủ".

### 11. My Bookings
- TabBar: Sắp tới · Hoàn thành · Đã huỷ.
- BookingCard có badge status, thumbnail venue, time, action (Thanh toán tiếp / QR / Đánh giá / Huỷ).
- Pull to refresh, infinite scroll.

### 12. Booking detail
- Header gradient với mã booking lớn + status badge.
- QR code lớn (placeholder `qr_flutter`) nếu CONFIRMED.
- Thông tin sân + giờ + giá + thanh toán.
- Timeline trạng thái (4 mốc).
- Bottom action: Đánh giá / Huỷ / Tải hoá đơn.

### 13. Account tab
- Header có avatar tròn + tên + email + level/loyalty badge.
- Card "Booking sắp tới" (mini, nếu có).
- ListTile sections:
  - Sân yêu thích
  - Phương thức thanh toán đã lưu
  - Voucher của tôi
  - Thông báo
  - Cài đặt (ngôn ngữ, dark mode, password)
  - Trợ giúp
  - Đăng xuất (đỏ)

### 14. Favorites
- Grid 2 cột venue đã yêu thích, swipe để xoá.

### 15. Notifications
- List grouped theo ngày (Hôm nay / Hôm qua / Tuần này).
- Tile có icon theo loại (booking confirmed / payment / promo).
- Tap → mark read + navigate.

### 16. Settings
- Ngôn ngữ (VI/EN), Theme (System/Light/Dark), Đổi mật khẩu, Xác thực 2 lớp.

## Reusable widgets (`shared/widgets/`)

| Widget | Mục đích |
|---|---|
| `VenueCard` | Card sân: ảnh, tên, rating, giá, distance |
| `VenueCardCompact` | Dùng trong horizontal list ở Home |
| `SportChip` | Icon + tên môn, kèm count |
| `SlotGrid` | Grid khung giờ với 3 trạng thái (available/held/booked) |
| `PaymentMethodTile` | Tile chọn cổng thanh toán có brand gradient |
| `RatingStars` | Hiển thị sao + rating |
| `PriceTag` | Format VND |
| `EmptyState` | Empty placeholder với illustration |
| `LoadingShimmer` | Skeleton loading |
| `AppButton` | Primary/Outline/Ghost variants |
| `AppTextField` | Wrap TextField với label + helper + error |
| `StatusBadge` | Badge trạng thái booking |

## Trạng thái cần xử lý

- Loading: shimmer skeleton.
- Empty: illustration + CTA.
- Error: card + retry.
- Pull to refresh: tất cả list.

## i18n

- VI / EN. Hiện chỉ VI cứng trong UI demo. Sau này swap bằng `intl` ARB files.

## Mock data hook-point

Tất cả mock ở `lib/shared/mock/mock_data.dart`. Khi backend xong:
- Tạo `lib/data/repositories/*` gọi API.
- Replace `MockData.venues` → `ref.watch(venuesProvider)` (nếu Riverpod) hoặc `BlocBuilder<VenueListBloc>` (nếu Bloc).

---

# Phần II — OWNER & STAFF (Mobile)

> Tự động chuyển shell theo role sau khi đăng nhập:
> `CUSTOMER → /main`, `OWNER → /owner`, `STAFF → /staff`.
> Để demo UI mà không cần backend, trang Login có 3 nút **"Demo login as Customer / Owner / Staff"**.

## 17. OWNER — App chủ sân (mini dashboard)

Mục tiêu: chủ sân theo dõi nhanh trên điện thoại — không thay thế web admin nhưng đủ dùng khi di chuyển.

### Shell — BottomNavigationBar 4 tab
1. **Tổng quan** — KPI hôm nay + biểu đồ doanh thu + booking gần nhất + nút "Quét QR check-in" lớn.
2. **Lịch** — Grid tuần × giờ, có filter theo venue/sân, tap vào ô để xem chi tiết.
3. **Booking** — List với status chips (Sắp tới · Chờ TT · Hoàn thành · Đã huỷ), search box, pull-to-refresh.
4. **Tài khoản** — Profile, sân của tôi, tài khoản nhận tiền, cài đặt.

### Sub-pages
- `/owner/venues/:id/edit` — chỉnh sửa venue (info, sân con, bảng giá, giờ mở cửa, ảnh, đóng cửa tạm thời).
- `/owner/bookings/:id` — chi tiết booking với action: Xác nhận / Huỷ / Đánh dấu no-show / Quét QR check-in.
- `/owner/qr-scan` — toàn màn camera scanner (placeholder camera frame).
- `/owner/reports` — biểu đồ doanh thu 7/30 ngày, top khách, lấp đầy theo giờ.
- `/owner/payout` — thông tin ngân hàng + lịch sử chuyển khoản.
- `/owner/walk-in` — form tạo booking thủ công cho khách đến trực tiếp.

### KPI hôm nay (tab Tổng quan)
- 💰 Doanh thu hôm nay
- 📅 Số booking hôm nay
- 📊 Tỉ lệ lấp đầy
- ⭐ Rating TB tuần này

### Quick actions trên Dashboard
- Nút "Quét QR" lớn nổi bật → camera scanner
- Nút "Tạo booking thủ công" → walk-in form
- Card "Booking sắp tới" tiếp theo (nhắc đến giờ)

## 18. STAFF — App nhân viên trực sân

Mục tiêu: cực gọn — chỉ làm 2 việc: **check-in booking** và **xem lịch sân hôm nay**.

### Shell — BottomNavigationBar 3 tab
1. **Hôm nay** — Danh sách booking hôm nay tại venue được giao, kèm nút **QR scan lớn ở header**.
2. **Lịch** — Lịch sân ngày/tuần, switch ngày.
3. **Tài khoản** — Tên + venue đang trực, đăng xuất.

### Sub-pages
- `/staff/qr-scan` — camera scanner, sau khi quét hiện confirmation dialog rồi quay về tab Hôm nay.
- `/staff/bookings/:id` — read-only chi tiết booking + nút "Xác nhận check-in".

### Khác CUSTOMER thế nào
- Không có tab Khám phá / Tìm sân / Yêu thích.
- Không có chức năng đặt sân (vì staff làm việc tại sân).
- AppBar có badge tên venue đang trực để tránh nhầm.

## Demo login flow

`LoginPage` cuối trang có 3 chip:
- 👤 **Customer** → `/main`
- 🏟️ **Owner** → `/owner`
- 🔧 **Staff** → `/staff`

Khi gắn backend thật, mảng này bỏ đi — chỉ giữ form đăng nhập + dùng role trong JWT để redirect.

## Cấu trúc thư mục bổ sung

```
lib/features/
├── owner/
│   ├── owner_shell.dart                     Bottom nav 4 tab
│   ├── owner_overview_tab.dart              KPI + chart + recent bookings
│   ├── owner_calendar_tab.dart              Weekly grid view
│   ├── owner_bookings_tab.dart              List + filter chips
│   ├── owner_account_tab.dart               Profile + payout + venues
│   ├── owner_booking_detail_page.dart       Detail + actions
│   ├── owner_venue_edit_page.dart           Edit venue tabs
│   ├── owner_qr_scan_page.dart              Camera placeholder
│   ├── owner_walk_in_page.dart              Manual booking form
│   ├── owner_payout_page.dart               Bank + history
│   └── owner_reports_page.dart              Charts
└── staff/
    ├── staff_shell.dart                     Bottom nav 3 tab
    ├── staff_today_tab.dart                 List + scan button
    ├── staff_schedule_tab.dart              Day picker + slot grid
    ├── staff_account_tab.dart               Profile + venue assignment
    ├── staff_qr_scan_page.dart              Scanner
    └── staff_booking_detail_page.dart       Read-only + check-in
```

## Reusable widgets bổ sung

| Widget | Mục đích |
|---|---|
| `KpiCard` | Card KPI với icon, value, label, trend |
| `RevenueSparkline` | Mini bar chart SVG đơn giản |
| `WeekCalendarGrid` | Grid 7 ngày × N giờ |
| `BookingTile` | Tile booking dùng chung cho Owner/Staff |
| `QrScannerPlaceholder` | Camera frame với corner brackets + scan line animation |
| `RoleBadge` | Badge nhỏ hiển thị role hiện tại |
