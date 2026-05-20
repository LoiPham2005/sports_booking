import 'package:flutter/foundation.dart';

enum AppFlavor { dev, stg, prod }

/// Singleton holder cho cấu hình theo flavor (dev / stg / prod).
///
/// Cách dùng:
/// ```dart
/// FlavorConfig.setFlavor(AppFlavor.dev);      // gọi 1 lần trong mainCommon
/// FlavorConfig.current.apiBaseUrl;            // truy cập
/// ```
@immutable
class FlavorConfig {
  const FlavorConfig._({
    required this.flavor,
    required this.apiBaseUrl,
    required this.appName,
    required this.enableLogging,
    required this.enableCrashlytics,
    required this.enableAnalytics,
  });

  final AppFlavor flavor;
  final String apiBaseUrl;
  final String appName;
  final bool enableLogging;
  final bool enableCrashlytics;
  final bool enableAnalytics;

  static FlavorConfig? _instance;

  /// Đã được setFlavor() chưa.
  static bool get isInitialized => _instance != null;

  /// Truy cập snapshot config hiện tại. Nếu chưa setFlavor → throw.
  static FlavorConfig get current {
    final i = _instance;
    if (i == null) {
      throw StateError(
        'FlavorConfig has not been initialized. '
        'Call FlavorConfig.setFlavor() in main_<flavor>.dart first.',
      );
    }
    return i;
  }

  /// Alias cũ — giữ để backwards-compat, prefer `current`.
  static FlavorConfig get instance => current;

  static bool get isDev => current.flavor == AppFlavor.dev;
  static bool get isStg => current.flavor == AppFlavor.stg;
  static bool get isProd => current.flavor == AppFlavor.prod;

  static void setFlavor(AppFlavor flavor) {
    // Override qua `--dart-define=API_BASE=http://192.168.x.x:3000` khi cần
    // (vd: test trên device thật cùng wifi). Default theo flavor.
    const overrideApiBase = String.fromEnvironment('API_BASE');

    _instance = switch (flavor) {
      AppFlavor.dev => FlavorConfig._(
          flavor: AppFlavor.dev,
          // Android emulator: 10.0.2.2 = host machine localhost.
          // iOS simulator / macOS: dùng 127.0.0.1.
          // Override: --dart-define=API_BASE=http://192.168.1.10:3000
          apiBaseUrl: overrideApiBase.isNotEmpty
              ? '$overrideApiBase/api/v1'
              : 'http://10.0.2.2:3000/api/v1',
          appName: 'Sports Booking Dev',
          enableLogging: true,
          enableCrashlytics: false,
          enableAnalytics: false,
        ),
      AppFlavor.stg => FlavorConfig._(
          flavor: AppFlavor.stg,
          apiBaseUrl: overrideApiBase.isNotEmpty
              ? '$overrideApiBase/api/v1'
              : 'https://api-stg.sportsbooking.example.com/api/v1',
          appName: 'Sports Booking Stg',
          enableLogging: true,
          enableCrashlytics: true,
          enableAnalytics: true,
        ),
      AppFlavor.prod => FlavorConfig._(
          flavor: AppFlavor.prod,
          apiBaseUrl: overrideApiBase.isNotEmpty
              ? '$overrideApiBase/api/v1'
              : 'https://api.sportsbooking.example.com/api/v1',
          appName: 'Sports Booking',
          enableLogging: false,
          enableCrashlytics: true,
          enableAnalytics: true,
        ),
    };
  }
}
