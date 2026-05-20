import 'dart:async';
import 'dart:ui';

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sports_booking_mobile/app.dart';
import 'package:sports_booking_mobile/config/app/app_initializer.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/config/observers/app_riverpod_observer.dart';
import 'package:sports_booking_mobile/core/base/di/global_providers.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';

// ⚠️ PHASE 1 — Sports Booking port chỉ chạy mock UI:
// - Firebase imports tắt vì chưa có google-services.json / GoogleService-Info.plist
// - FlutterError.onError / PlatformDispatcher chỉ log local
// - Bật lại Crashlytics khi sẵn sàng (đọc skill: app-boot)
Future<void> mainCommon(AppFlavor flavor) async {
  await runZonedGuarded<Future<void>>(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      FlavorConfig.setFlavor(flavor);

      globalContainer = ProviderContainer(
        observers: [const AppRiverpodObserver()],
      );

      await AppInitializer.initialize();

      FlutterError.onError = (FlutterErrorDetails details) {
        FlutterError.presentError(details);
        Logger.error(
          'Flutter error',
          error: details.exception,
          stackTrace: details.stack,
        );
      };

      PlatformDispatcher.instance.onError = (error, stack) {
        Logger.error('Platform error', error: error, stackTrace: stack);
        return true;
      };

      runApp(const App());
    },
    (error, stack) {
      Logger.error('Zoned error', error: error, stackTrace: stack);
    },
  );
}
