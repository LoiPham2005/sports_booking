import 'package:intl/date_symbol_data_local.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/config/ui/system_ui_manager.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';

// ⚠️ PHASE 1 — Sports Booking port:
// - Firebase / IAP / Ads / AppVersion init tạm thời TẮT (UI chạy mock data,
//   chưa có google-services.json + RevenueCat key + Ads unit).
// - Khi sẵn sàng API + Firebase config:
//     1. Bật lại import Firebase / IAP / Ads ở đây
//     2. Uncomment plugins `id("com.google.gms.google-services")` trong
//        android/app/build.gradle.kts
//     3. Đặt google-services.json vào android/app/src/{flavor}/
//     4. Đặt GoogleService-Info.plist vào ios/Runner/{flavor}/
//   Đọc skill: app-boot + firebase-flavors.
abstract class AppInitializer {
  static Future<void> initialize() async {
    Logger.info(
      '🚀 Initializing app (${FlavorConfig.current.flavor.name})...',
    );

    await initializeDateFormatting('vi_VN');
    await SystemUIManager.setup();
    await configureDependencies(environment: FlavorConfig.current.flavor.name);

    Logger.info('✅ App initialized (Phase 1 — no Firebase/IAP/Ads).');
  }
}
