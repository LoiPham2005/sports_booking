// ════════════════════════════════════════════════════════════════
// 📁 lib/modules/app_config/utils/app_config_defaults.dart
// ════════════════════════════════════════════════════════════════
//
// Toggle + fallback config khi:
//   - `kUseAppRemoteConfig = false` (skip Firebase hoàn toàn — dev mode)
//   - Firebase init fail / fetch fail (lazy fallback)

import 'package:sports_booking_mobile/modules/app_config/models/app_config_snapshot.dart';

/// 🔌 BẬT / TẮT Firebase Remote Config cho AppConfig.
///
/// - `true` (mặc định): Production — fetch config từ Firebase, có realtime update.
/// - `false`: Dev — dùng `kAppConfigDev` hardcoded. Không cần Firebase setup,
///   không tốn quota. Phù hợp dev offline / E2E test.
///
/// 💡 Có thể đổi thành flavor-aware:
/// ```dart
/// bool get kUseAppRemoteConfig => !FlavorConfig.isDev;
/// ```
const bool kUseAppRemoteConfig = true;

/// 🧪 Dev snapshot — hiển thị khi `kUseAppRemoteConfig = false`.
/// Sửa giá trị trong này khi cần test feature locally
/// (vd. bật `isMaintenance` để test maintenance screen mà không động Firebase).
const AppConfigSnapshot kAppConfigDev = AppConfigSnapshot(
  isMaintenance: false,
  maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
  noticeEnabled: false,
  noticeTitle: '🎉 Khuyến mãi cuối tuần',
  noticeBody: 'Giảm 50% cho đơn hàng đầu tiên trong app.',
  noticeUrl: 'https://example.com/promo',
  policyUrl: 'https://example.com/privacy',
  termsUrl: 'https://example.com/terms',
);

/// 🚫 Disabled snapshot — fallback an toàn khi Firebase parse fail.
/// Tất cả flag = false, không hiển thị banner / maintenance.
const AppConfigSnapshot kAppConfigDisabled = AppConfigSnapshot.empty;
