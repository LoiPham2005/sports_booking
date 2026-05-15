# Mobile Design — Sports Booking (Flutter)

> 📍 Đọc [PROJECT.md](PROJECT.md) trước. [STATUS.md](STATUS.md) cho hiện trạng + [GOTCHAS.md](GOTCHAS.md) cho các bug đã giải quyết.

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
- Toolbar có **nút "Bản đồ"** mở Map view (xem § 6.5).
- Empty state khi không có kết quả.

### 6.5. Venues map view (`/venues/map`)

Full-screen OpenStreetMap (`flutter_map` 7.0.2 + `latlong2` 0.9.1, tile từ `tile.openstreetmap.org`). Vào từ nút "Bản đồ" trên toolbar `/venues`.

**Tính năng**:
- **Custom pin marker** vẽ bằng `CustomPainter` (hình giọt nước có icon môn ở giữa) — màu theo môn primary của venue (football=green, badminton=blue, tennis=warning, pickleball=accent, basketball=danger, volleyball=violet, table_tennis=cyan).
- **Marker được chọn** scale 1.15× + viền trắng + label giá `350k` phía trên.
- **My location dot** chấm xanh có halo, đặt tại Q.1 (`MockData.mapCenter`).
- **Header floating** (gradient fade): nút back tròn, ô search (filter theo `name/district/address`), nút filter có badge khi đang lọc, dải sport chip cuộn ngang.
- **Pill "Tìm sân trong khu vực này"** xuất hiện khi user pan map > 1km từ initial center (đo bằng `Distance().distance()`).
- **Filter sheet**: RangeSlider giá 0-600k chia 12 step, switch indoor-only, wrap FilterChip cho amenities. Footer 2 nút "Đặt lại / Xem N sân".
- **3 FAB tròn** bên phải (top): my location (recenter), layers (style switcher), list_alt (back to list view).
- **DraggableScrollableSheet** snap 3 mức (16% / 50% / 88%): handle bar, "N sân — Đang lọc", "Xoá lọc" pill, list tile mỗi venue (image + name + rating + district + giá + arrow detail). Tap tile → focus marker.
- **Selected venue card** (overlay bottom 110): image 70×70 + name + rating + district + km + giá, nút close, 2 nút "Chỉ đường / Xem chi tiết". Tap card → đi tới venue detail.
- **OSM attribution** "© OpenStreetMap" bottom-left góc.

**Mock data**: tọa độ 6 venue ở `MockData.venueLocations` (Map<id, (lat, lng)>) — TP.HCM Q1/Q7/Q10/Bình Thạnh/Thủ Đức. Khi nối API, đọc từ `venue.lat/lng` trên Prisma schema (đã có sẵn — xem [API_INTEGRATION.md § 3](API_INTEGRATION.md#3-venue)).

**Lưu ý kỹ thuật**:
- `dart:ui as ui` để tránh conflict với `Path<LatLng>` của flutter_map khi vẽ pin (xem GOTCHAS.md §17).
- Const tuple destructuring `MockData.mapCenter.$1` không hoạt động trong const expression — phải dùng `LatLng(...)` non-const.
- Tile cache mặc định in-memory của flutter_map. Nếu cần persistent, thêm `flutter_map_tile_caching`.

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

---

# Phần III — STAFF vs MANAGER + Demo state

## 19. DemoState singleton

File: `lib/shared/mock/demo_state.dart`

```dart
class DemoState extends ChangeNotifier {
  static final instance = DemoState._();
  StaffPortalRole _staffRole = StaffPortalRole.staff;
  StaffPortalRole get staffRole => _staffRole;
  bool get isManager => _staffRole == StaffPortalRole.manager;
  void setStaffRole(StaffPortalRole role) { /* notify */ }
}
```

Login set role rồi navigate `/staff`. Staff shell listen → rebuild khi role đổi.

→ Khi nối API thật: thay bằng `AuthService` đọc role từ JWT, bỏ DemoState.

## 20. STAFF vs MANAGER differentiation

Staff shell có 3 tab (STAFF) hoặc 4 tab (MANAGER):
- STAFF: Hôm nay / Lịch sân / Tài khoản
- MANAGER: Hôm nay / Lịch sân / **Doanh thu** / Tài khoản

**Today tab** đọc `DemoState.instance.isManager`, render thêm:
- Card gradient tím "Doanh thu hôm nay" + delta
- 2 nút outlined "Sửa giá" + "Đội ngũ"

**Header avatar / badge** đổi màu + icon theo role:
- STAFF: cam, icon shield
- MANAGER: tím (`#8B5CF6`), icon workspace_premium

### Sub-pages MANAGER-only
- `/staff/pricing` — list + tạo override giá tạm thời (bottom sheet form)
- `/staff/team` — view-only đội ngũ tại venue (mời/xoá là Owner)
- Tab `Revenue` trong shell — total card gradient tím + 3 KPI + bar chart 16 giờ + sparkline 7 ngày + phân bố sân

### Quyền cụ thể
| Action | STAFF | MANAGER |
|---|:-:|:-:|
| QR check-in | ✓ | ✓ |
| Tạo walk-in (chưa làm — placeholder) | ✓ | ✓ |
| Xem doanh thu venue | — | ✓ |
| Sửa giá tạm thời | — | ✓ |
| Xem đội ngũ | — | ✓ |
| Mời/xoá staff khác | — | Owner |

## 21. Refactor customer/

Đã refactor: `features/{home,venues,bookings,account,main}/` → `features/customer/{home,venues,bookings,account,main}/` để đối xứng với owner/staff. Imports `../../shared/...` → `../../../shared/...`.

→ Khi tạo file customer mới: đặt trong `features/customer/<area>/<file>.dart` + import `../../../shared/...`.

## 22. safePop pattern

File: `lib/shared/routing/safe_pop.dart`

```dart
void safePop(BuildContext context, {String fallback = RoutePaths.main}) {
  if (context.canPop()) context.pop();
  else context.go(fallback);
}
```

**Mọi nút Back trong AppBar dùng `safePop(context)`**, không `context.pop()` (vì user có thể vào page qua `context.go()` — không có gì để pop).

Modal/sheet close vẫn dùng `Navigator.pop(context)` (đó là pop modal, khác scope).

## 23. BookingMatrix mobile

File: `lib/features/customer/venues/booking_matrix.dart`

Bảng `court × hour` với:
- **Toggle đảo trục**: nút header `Giờ↓·Sân→` ↔ `Sân↓·Giờ→`
- 4 trạng thái ô: available (hiện giá `300k`) / selected (✓ Chọn) / held (vàng nhạt) / booked (gạch ngang)
- Date picker prev/next + `showDatePicker`
- Selected chips dưới matrix (tap để bỏ)
- Voucher input + summary + CTA

Mở qua DraggableScrollableSheet 95% trên venue detail.

## 24. Demo login chips (5 chips)

`features/auth/login_page.dart` cuối form có 5 chip:
1. 👤 Customer → `/main`
2. 🏟️ Owner → `/owner`
3. 🔧 Staff → `setStaffRole(staff)` + `/staff`
4. 👑 Manager → `setStaffRole(manager)` + `/staff`
5. ⚡ Admin → chưa có route (web có, mobile chưa làm `/admin`)

→ Khi nối API: bỏ 5 chip, đổi sang form login thật + đọc role từ JWT.

## 25. Cấu trúc thư mục cập nhật

```
lib/features/
├── splash/                         splash + onboarding (chung)
├── auth/                           login (5 chip), register, forgot (chung)
├── customer/                       ← MỌI flow customer gom đây
│   ├── main/                       Shell bottom nav
│   ├── home/                       Tab trang chủ
│   ├── venues/                     Tab khám phá + detail + booking_matrix
│   ├── bookings/                   Booking new/detail/result
│   └── account/                    Profile, favorites, notifications, settings
├── owner/                          Owner portal (4 tab + 8 sub-pages)
│   ├── owner_shell.dart, owner_*_tab.dart, owner_*_page.dart
│   ├── owner_venue_create_page.dart    ← MỚI
│   ├── owner_staff_page.dart           ← MỚI
│   └── owner_staff_invite_page.dart    ← MỚI
└── staff/                          Staff portal (3-4 tab dynamic)
    ├── staff_shell.dart            Listen DemoState, render tabs theo role
    ├── staff_today_tab.dart        Hiện thêm card doanh thu nếu manager
    ├── staff_schedule_tab.dart
    ├── staff_revenue_tab.dart      ← MANAGER-only tab
    ├── staff_pricing_page.dart     ← MANAGER-only page
    ├── staff_team_page.dart        ← MANAGER-only page
    ├── staff_account_tab.dart      Hiện section "Quản lý" nếu manager
    ├── staff_qr_scan_page.dart
    └── staff_booking_detail_page.dart
```
