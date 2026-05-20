abstract class AppConstants {
  static const String appName = 'flutter_base2';
  static const String defaultLocale = 'vi';
  static const String defaultCountry = 'VN';

  static const int defaultPageSize = 20;
  static const int searchDebounceMs = 350;

  static const Duration shortCacheTtl = Duration(minutes: 5);
  static const Duration mediumCacheTtl = Duration(hours: 1);
  static const Duration longCacheTtl = Duration(days: 1);

  static const double designWidth = 375;
  static const double designHeight = 812;

  // ─── RevenueCat (In-App Purchase) ────────────────────────────────
  // Lấy API key tại: https://app.revenuecat.com/projects → API keys
  // Để dùng IapServiceMock trong môi trường dev, không cần thay placeholder.
  static const String revenueCatGoogleKey = 'goog_placeholder';
  static const String revenueCatAppleKey = 'appl_placeholder';
  static const String premiumEntitlement = 'premium';

  // ─── Ads (AdMob) ─────────────────────────────────────────────────
  // App ID đặt trong AndroidManifest.xml & Info.plist, không cần ở đây.
  // Ad unit IDs nên load từ Firebase Remote Config (xem AdConfigService).
}
