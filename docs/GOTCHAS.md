# Gotchas & Solved Issues

> Danh sách các bug đã gặp + cách giải quyết. **Đọc trước khi sửa lỗi tương tự** để khỏi mất thời gian debug lại.

## 0. Mobile: copy flutter_base → strip xuống minimal

Lúc đầu copy template `flutter_base` rồi xoá `features/`. Nhưng template còn lệ thuộc rất nặng vào `core/` (injectable DI, codegen) → sửa hoài không hết lỗi.

**Giải pháp đã làm**: **Strip toàn bộ** `lib/core/`, `lib/modules/`, `lib/config/`, `lib/routes/`, `lib/design/`, `lib/gen/`, `firebase_options.dart` + tất cả flavor files. Chỉ giữ Flutter scaffolding (android/ios/web/macos). Pubspec tinh gọn — chỉ `go_router`, `google_fonts`, `cached_network_image`, `qr_flutter`, `intl`. **Không dùng codegen, không Riverpod, không Bloc** (cho UI demo).

→ Nếu cần thêm pattern state phức tạp sau này, add Riverpod riêng. Đừng resurrect flutter_base infrastructure.

## 1. Mobile Android: lỗi build resource flutter_base

Khi mới copy template, build Android báo:
```
error: resource drawable/bg_ad_cta_button not found
error: resource attr/colorControlNormal not found
```

**Lý do**: `android/app/src/main/res/` còn các drawable shortcut + ad layouts của template.

**Fix** (đã làm — không cần làm lại):
- Xoá `res/layout/native_ad_*.xml`
- Xoá `res/drawable/ic_shortcut_*.xml` + `bg_ad_cta_button.xml`
- Cleanup `res/values/styles.xml` chỉ giữ LaunchTheme + NormalTheme
- Xoá `res/values/colors.xml` + `dimens.xml`
- Xoá folder `src/dev/`, `src/stg/`, `src/prod/`
- Xoá `app/flavorizr.gradle.kts`, `rename-outputs.gradle.kts`, `open-folder.gradle.kts`
- Xoá `google-services.json`
- `settings.gradle.kts`: bỏ `google-services` + `firebase-crashlytics` plugins
- `app/build.gradle.kts`: chỉ giữ android + kotlin + flutter-gradle-plugin

## 2. Mobile: `Size.fromHeight(52)` cho minimumSize gây crash

Đặt `minimumSize: Size.fromHeight(52)` trong `FilledButton`/`OutlinedButton` theme. Khi button đặt **trực tiếp trong `Row` không qua `Expanded`** → crash `BoxConstraints forces an infinite width`.

**Lý do**: `Size.fromHeight(h) == Size(double.infinity, h)`. Khi parent (Row không-Expanded child) cho maxWidth=∞ → minWidth=∞ > maxWidth → invalid.

**Quy tắc khi dùng `Size.fromHeight(h)` trong theme**:
- ✅ Button trong Column / ListView / Padding / Center → OK (parent có bounded width)
- ✅ Button trong `Expanded(child: Button)` của Row → OK
- ✅ Button trong `bottomNavigationBar` / `appBar.actions` → OK
- ❌ Button trực tiếp trong Row (không Expanded/SizedBox wrap) → **CRASH**

**Khi gặp lỗi này** → wrap button trong `Expanded` hoặc `SizedBox(width: ...)`. Ví dụ:
```dart
// bookings_tab.dart line 249 — nút "Huỷ" cạnh nút khác
btns.add(SizedBox(
  width: 88,
  child: OutlinedButton(onPressed: () {}, child: Text('Huỷ')),
));
```

## 3. Mobile: `Border(left:)` + `borderRadius` → silent crash

```dart
decoration: BoxDecoration(
  borderRadius: BorderRadius.circular(12),
  border: Border(left: BorderSide(...)),  // ❌ non-uniform border
)
```

**Lý do**: Non-uniform Border không tương thích với borderRadius. Flutter assert silent → page render trắng tinh.

**Fix**: dùng `IntrinsicHeight` + `Row` với `Container` thanh dọc 4px + Expanded content có `borderRadius.only(topRight, bottomRight)`:
```dart
IntrinsicHeight(
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Container(width: 4, color: AppColors.primary),
      Expanded(child: Container(
        decoration: BoxDecoration(borderRadius: BorderRadius.only(topRight: Radius.circular(12), bottomRight: Radius.circular(12)))
      )),
    ],
  ),
)
```

## 4. Mobile: `Row(children: ...)` trong `Positioned` thiếu mainAxisSize.min

Khi `Positioned(top:8, right:8, child: Row(...))` mà Row không có `mainAxisSize: MainAxisSize.min` → crash `BoxConstraints has NaN or Infinity values`.

**Lý do**: Positioned không tight width/height → Row mặc định `MainAxisSize.max` đòi parent có bounded mainAxis.

**Quy tắc**: mọi Row/Column nằm trong `Positioned` (chỉ set top/right/left/bottom, không set width/height) → **bắt buộc** thêm `mainAxisSize: MainAxisSize.min`.

## 5. Mobile: `DateFormat('...', 'vi_VN')` crash nếu chưa init locale

Stack:
```
LocaleDataException: Locale data has not been initialized, call initializeDateFormatting(<locale>).
```

**Fix** (đã làm — main.dart):
```dart
import 'package:intl/date_symbol_data_local.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi_VN');  // ← bắt buộc
  ...
  runApp(const SportsBookingApp());
}
```

Và trong `shared/utils/format.dart` có try/catch fallback cho `formatDateLong` để an toàn khi hot reload.

## 6. Mobile: `context.pop()` crash "There is nothing to pop"

User vào page qua `context.go(...)` (replace stack) → khi nhấn back trong AppBar gọi `context.pop()` → crash + thoát app.

**Fix** (đã làm): tạo `lib/shared/routing/safe_pop.dart`:
```dart
void safePop(BuildContext context, {String fallback = RoutePaths.main}) {
  if (context.canPop()) context.pop();
  else context.go(fallback);
}
```

**Quy tắc**: nút Back trong AppBar dùng `safePop(context)`, không dùng `context.pop()` trực tiếp.
- Đã apply cho 16 file. Khi tạo page mới nhớ import + dùng.

## 7. Mobile: hot reload không apply route mới

Khi thêm route mới vào `app_router.dart`, hot reload `r` không nạp được vì `appRouter` là biến `final` top-level chỉ init 1 lần.

**Cách dùng**: bấm `R` (hot **restart**, viết hoa), không phải `r`. Hoặc `q` rồi `flutter run`.

## 8. Mobile: digit separators `1_000_000` cần Dart ≥ 3.6

```dart
const price = 500_000;  // ❌ lỗi nếu Dart SDK < 3.6
```

**Fix**: dùng `500000` không gạch dưới. Pubspec hiện tại set `sdk: ^3.4.0` để tương thích Flutter 3.22.

## 9. Web: server component không truyền event handler

```tsx
// Home page (server component)
<VenueCard onClick={...}>  // ❌ error: Event handlers cannot be passed to Client Component props
```

**Fix**: file component có event handler **phải** có `'use client'` ở dòng đầu. Đã apply cho `venue-card.tsx`. Khi build component mới có onClick → nhớ thêm directive.

## 10. Web: `useSearchParams` trong layout cần Suspense

`useStaffRole()` dùng `useSearchParams()` trong staff layout. Nếu không wrap Suspense → build prod fail.

**Fix** (đã làm trong `staff/layout.tsx`):
```tsx
export default function StaffLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <StaffLayoutInner>{children}</StaffLayoutInner>
    </Suspense>
  );
}
```

## 11. Web: `Border` không có variant `primary` trong Badge

`Badge` chỉ có variants: `default | secondary | outline | success | warning | destructive | accent | muted`. Khi mock data dùng `tone: 'primary'` → TypeScript silent (cast as never) → render xám.

**Fix**: dùng `default` (đã là primary-tinted) hoặc thêm variant mới vào `components/ui/badge.tsx`.

## 12. Mobile: overflow trên home tab + sport chip + kpi card

3 overflow đã fix (sport_chip giảm icon 48→40, kpi childAspectRatio 1.45→1.15, home_tab "Booking sắp tới" wrap Flexible).

**Quy tắc**: khi gặp `A RenderFlex overflowed by X pixels`:
- Overflow phải (Row): bọc Text/widget trong `Flexible` + `overflow: ellipsis`
- Overflow dưới (Column): tăng `childAspectRatio` của GridView, hoặc dùng `mainAxisSize.min`

## 13. Mobile: regroup customer features

Đã refactor: `features/{home,venues,bookings,account,main}/` → `features/customer/{home,venues,bookings,account,main}/` để đối xứng với `features/owner/` và `features/staff/`.

**Hệ quả**: imports `../../shared/...` → `../../../shared/...` (sâu thêm 1 cấp). Đã sed bulk cho 20+ files.

## 14. Mobile: matrix booking cell phải đồng nhất 2 hướng

`BookingMatrix` có nút đảo trục `Giờ↓·Sân→` ↔ `Sân↓·Giờ→`. Trước đây ô compact mode chỉ hiện icon ✓ → không đồng nhất với mode normal.

**Fix**: bỏ tham số `compact`. Cell luôn dùng cùng style (`px-2 py-2.5 text-xs`), cùng hiện giá. Cột giờ width = 110px để fit "300.000 ₫".

## 15. Mobile: chart bars 0px khi dùng flex column items-end

```dart
Row(children: [...].map((v) => Column(
  children: [Text(value), Container(height: pct * 100, ...), Text(month)],
)))
```

Bars không hiện vì Column con không có chiều cao tham chiếu cho `%`.

**Fix**: dùng `justify-end` + `height: 100%` cho inner column, hoặc tách thành 2 Row (1 cho bars, 1 cho labels).

```dart
Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
  ...HOURLY.map((v) => Expanded(
    child: Container(
      height: barHeight * pct,  // bar lấy height từ outer Row có h-64
      ...
    ),
  )),
])
```

## 16. RBAC permission boundaries

Cẩn thận khi code:
- **OWNER** chỉ thấy venue **mình sở hữu** — endpoint phải scope theo `ownerId`
- **STAFF** chỉ thấy venue **được gán** (`VenueMember` table) — endpoint scope theo `userId IN VenueMember`
- **MANAGER** là sub-role của STAFF trong scope venue đó → có thêm quyền sửa giá tạm thời, xem doanh thu, manage staff cùng venue (chỉ xem, không mời/xoá — đó là Owner)
- **ADMIN** thấy tất cả nhưng không config hệ thống
- **SUPER_ADMIN** mọi quyền + `/admin/system/*`

## Lưu ý chung khi code

- **Không thêm dependency mới** trừ khi thực sự cần. Web hiện 9 deps, mobile 6 deps — giữ tinh gọn.
- **Không generate code mới** (codegen) — đã chọn không dùng từ đầu để dev mới đọc code dễ.
- **Mock data tập trung** một file (`lib/mock-data.ts` web, `lib/shared/mock/mock_data.dart` mobile). Khi nối API: chỉ swap file đó.
- **Đồng bộ design system web/mobile**: 2 ngôn ngữ token cùng giá trị. Khi đổi màu primary, đổi cả 2 chỗ.
- **Mọi page mobile dùng `safePop(context)` cho back button**, không `context.pop()`.
- **Mọi modal/dialog vẫn dùng `Navigator.pop(context)` hoặc `context.pop()`** — đó là pop modal, không phải route nav (khác scope).
