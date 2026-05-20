import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdSizes {
  /// Adaptive banner bám theo chiều rộng màn hình — khuyến nghị dùng cho banner.
  static Future<AdSize> adaptiveBanner(BuildContext context) async {
    final width = MediaQuery.of(context).size.width.truncate();
    return await AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(width)
        ?? AdSize.banner;
  }

  /// Native ad height theo tỷ lệ màn hình.
  static double nativeHeight(BuildContext context, {double ratio = 0.7}) =>
      MediaQuery.of(context).size.width * ratio;

  // ── Fixed sizes ────────────────────────────────────────────────
  static const AdSize banner          = AdSize.banner;           // 320×50
  static const AdSize largeBanner     = AdSize.largeBanner;      // 320×100
  static const AdSize mediumRectangle = AdSize.mediumRectangle;  // 300×250
  static const AdSize fullBanner      = AdSize.fullBanner;       // 468×60
  static const AdSize leaderboard     = AdSize.leaderboard;      // 728×90
}
