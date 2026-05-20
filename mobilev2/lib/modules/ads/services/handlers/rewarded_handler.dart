import 'dart:async';

import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_cache_service.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_stats_service.dart';
import 'package:sports_booking_mobile/modules/ads/services/handlers/full_screen_ad_handler.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:injectable/injectable.dart';

@lazySingleton
class RewardedHandler extends FullScreenAdHandler<RewardedAd> {
  RewardedHandler(AdCacheService cache, AdAnalyticsService analytics)
      : super(cache: cache, analytics: analytics);

  /// ⚡ Lưu reward callback theo placement. `showAd()` đọc từ đây và truyền vào
  /// `ad.show(onUserEarnedReward: ...)` MỘT LẦN DUY NHẤT.
  /// Tránh bug v1: gọi `ad.show()` 2 lần → AdMob throw "Ad already used".
  final Map<String, void Function(RewardItem reward)?> _rewardCallbacks = {};

  @override
  String get type => 'rewarded';

  @override
  int intervalSeconds(AdRules rules) => rules.rewardedInterval;

  @override
  int? maxPerSession(AdRules rules) => rules.maxRewardedPerSession;

  @override
  void loadFromSdk({
    required AdUnit unit,
    required void Function(RewardedAd ad) onLoaded,
    required void Function(LoadAdError err) onFailed,
  }) {
    RewardedAd.load(
      adUnitId: unit.resolvedId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: onLoaded,
        onAdFailedToLoad: onFailed,
      ),
    );
  }

  @override
  Future<void> showAd(RewardedAd ad) async {
    // ⚡ Tìm callback đã lưu cho placement này. `showRewarded()` set qua
    // `_rewardCallbacks` trước khi gọi base `show()`.
    // Map có thể chứa nhiều placements; cần xoá sau khi consume.
    final cb = _rewardCallbacks.remove(_findPlacementForAd(ad));
    await ad.show(onUserEarnedReward: (_, reward) {
      cb?.call(reward);
    });
  }

  /// Tìm placement key dựa trên ad reference trong cache.
  /// Backwards: ad → cacheKey → placement (sau prefix `rewarded_`).
  String? _findPlacementForAd(RewardedAd ad) {
    for (final entry in _rewardCallbacks.keys) {
      if (cache.get<RewardedAd>(cacheKey(entry)) == ad) return entry;
    }
    return null;
  }

  @override
  void setFullScreenCallback(
    RewardedAd ad,
    FullScreenContentCallback<RewardedAd> cb,
  ) {
    ad.fullScreenContentCallback = cb;
  }

  /// API riêng để gọi reward — set callback rồi gọi base `show()`.
  Future<bool> showRewarded({
    required AdUnit? unit,
    required String placement,
    required AdConfig cfg,
    void Function(RewardItem reward)? onEarnedReward,
    Duration timeout = const Duration(seconds: 5),
  }) async {
    // ⚡ Đăng ký callback TRƯỚC khi gọi show() — `showAd()` sẽ consume.
    _rewardCallbacks[placement] = onEarnedReward;

    final shown = await show(
      unit: unit,
      placement: placement,
      cfg: cfg,
      timeout: timeout,
      onDismissed: () {
        // Cleanup nếu show fail hoặc user dismiss trước khi earn.
        _rewardCallbacks.remove(placement);
      },
    );

    // Nếu show fail (chưa gọi showAd) → cleanup callback luôn.
    if (!shown) _rewardCallbacks.remove(placement);

    return shown;
  }
}
