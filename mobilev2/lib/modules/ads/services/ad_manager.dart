import 'dart:async';

import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/common/extensions/context_extensions.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_placements.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_cache_service.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_config_service.dart';
import 'package:sports_booking_mobile/modules/ads/services/handlers/app_open_handler.dart';
import 'package:sports_booking_mobile/modules/ads/services/handlers/inter_handler.dart';
import 'package:sports_booking_mobile/modules/ads/services/handlers/rewarded_handler.dart';
import 'package:sports_booking_mobile/modules/ads/widgets/native_ad_full_screen.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:injectable/injectable.dart';

/// Facade gọn cho ads. Không quản lý logic — uỷ thác cho handlers.
///
/// Cách dùng:
/// ```dart
/// adManager.showInter(InterPlacement.splash);
/// adManager.showRewarded(RewardedPlacement.bonus, onEarnedReward: ...);
/// adManager.nativeUnit(NativePlacement.language);
/// adManager.bannerUnit(BannerPlacement.home);
///
/// // Placement động (A/B test):
/// adManager.showInter(const RawPlacement('experimental_v2'));
/// ```
AdManager get adManager => getIt<AdManager>();

@lazySingleton
class AdManager {
  AdManager(this._configService, this._cache, this._inter, this._appOpen, this._rewarded);

  final AdConfigService _configService;
  final AdCacheService _cache;
  final InterHandler _inter;
  final AppOpenHandler _appOpen;
  final RewardedHandler _rewarded;

  AdConfig get _cfg => _configService.current;
  AdConfig get config => _cfg;

  static const _kNativeAfterInterCacheKey = 'native_after_inter';
  static const _kNativeFullCacheKey = 'native_full';

  DateTime? _lastNativeFullShownAt;

  /// ⚡ Cross-handler cooldown — Inter/Rewarded vừa show → block AppOpen.
  /// UX: tránh user dismiss inter → app resume → app-open chồng lên = double ad.
  DateTime? _lastAnyAdShownAt;
  static const _interAppOpenCooldown = Duration(seconds: 10);

  void _markAdShown() => _lastAnyAdShownAt = DateTime.now();

  bool _isInCooldown() {
    final last = _lastAnyAdShownAt;
    if (last == null) return false;
    return DateTime.now().difference(last) < _interAppOpenCooldown;
  }

  // ── INIT ──────────────────────────────────────────────────────

  Future<void> initialize() async {
    await MobileAds.instance.initialize();

    _configService.config.addListener(() {
      Logger.info('Config updated, preloading all placements...', tag: 'ADS');
      _preloadAll();
    });

    _preloadAll();
  }

  /// Swap id→id2 nếu cần, handlers dùng `unit.resolvedId` mà không cần biết.
  AdUnit? _resolve(AdUnit? unit) {
    if (unit == null) return null;
    final use = unit.useId2 ?? false;
    if (!use || unit.id2.isEmpty) return unit;
    return unit.copyWith(id: unit.id2);
  }

  void _preloadAll() {
    if (!_cfg.showAllAds) return;
    if (_cfg.enableInter) {
      _cfg.inter.forEach((p, u) {
        final r = _resolve(u);
        if (r != null) _inter.preload(r, p, _cfg);
      });
    }
    if (_cfg.enableAppOpen) {
      _cfg.appOpen.forEach((p, u) {
        final r = _resolve(u);
        if (r != null) _appOpen.preload(r, p, _cfg);
      });
    }
    if (_cfg.enableRewarded) {
      _cfg.rewarded.forEach((p, u) {
        final r = _resolve(u);
        if (r != null) _rewarded.preload(r, p, _cfg);
      });
    }
    if (_cfg.enableNativeFull) {
      if (_cfg.nativeFullAfterInter) _preloadNativeAfterInter();
      _preloadNativeFull();
    }
  }

  // ── INTER ─────────────────────────────────────────────────────

  Future<bool> showInter(
    PlacementKey placement, {
    VoidCallback? onDismissed,
    Duration timeout = const Duration(seconds: 5),
    bool showNativeFull = true,
  }) async {
    if (!_cfg.enableInter) return false;
    final unit = _resolve(_cfg.inter.byPlacement(placement));
    final wrappedDismiss =
        (showNativeFull && _cfg.enableNativeFull && _cfg.nativeFullAfterInter)
            ? () => _showNativeAfterInter(onClosed: onDismissed)
            : onDismissed;

    final shown = await _inter.show(
      unit: unit,
      placement: placement.key,
      cfg: _cfg,
      onDismissed: wrappedDismiss,
      timeout: timeout,
    );
    if (shown) _markAdShown();
    return shown;
  }

  // ── APP OPEN ──────────────────────────────────────────────────

  Future<bool> showAppOpen(PlacementKey placement, {VoidCallback? onDismissed}) async {
    if (!_cfg.enableAppOpen) return false;

    // ⚡ Block AppOpen nếu vừa show Inter/Rewarded trong cooldown.
    if (_isInCooldown()) {
      Logger.warning(
        'AppOpen[${placement.key}] blocked: cooldown after recent ad',
        tag: 'ADS',
      );
      return false;
    }

    var unit = _resolve(_cfg.appOpen.byPlacement(placement));
    if (unit == null && placement != AppOpenPlacement.resume) {
      Logger.warning(
        'AppOpen placement "${placement.key}" not found, falling back to resume',
        tag: 'ADS',
      );
      unit = _resolve(_cfg.appOpen.byPlacement(AppOpenPlacement.resume));
    }

    final shown = await _appOpen.show(
      unit: unit,
      placement: placement.key,
      cfg: _cfg,
      onDismissed: onDismissed,
    );
    if (shown) _markAdShown();
    return shown;
  }

  // ── REWARDED ──────────────────────────────────────────────────

  Future<bool> showRewarded(
    PlacementKey placement, {
    void Function(RewardItem reward)? onEarnedReward,
    Duration timeout = const Duration(seconds: 5),
  }) async {
    if (!_cfg.enableRewarded) return false;
    final unit = _resolve(_cfg.rewarded.byPlacement(placement));
    final shown = await _rewarded.showRewarded(
      unit: unit,
      placement: placement.key,
      cfg: _cfg,
      onEarnedReward: onEarnedReward,
      timeout: timeout,
    );
    if (shown) _markAdShown();
    return shown;
  }

  // ── NATIVE / BANNER (widget-based) ────────────────────────────

  AdUnit? nativeUnit(PlacementKey placement) {
    if (!_cfg.enableNative) return null;
    final unit = _resolve(_cfg.native.byPlacement(placement));
    if (!_cfg.unitEnabled(unit)) return null;
    return unit;
  }

  AdUnit? bannerUnit(PlacementKey placement) {
    if (!_cfg.enableBanner) return null;
    final unit = _resolve(_cfg.banner.byPlacement(placement));
    if (!_cfg.unitEnabled(unit)) return null;
    return unit;
  }

  // ── NATIVE FULL-SCREEN ────────────────────────────────────────

  void _preloadNativeAfterInter() => _preloadNativeAd(
        placement: NativePlacement.afterInter,
        cacheKey: _kNativeAfterInterCacheKey,
      );

  void _preloadNativeFull() => _preloadNativeAd(
        placement: NativePlacement.nativeFull,
        cacheKey: _kNativeFullCacheKey,
      );

  void _preloadNativeAd({
    required NativePlacement placement,
    required String cacheKey,
  }) {
    final unit = _resolve(_cfg.native.byPlacement(placement));
    if (!_cfg.unitEnabled(unit)) return;
    if (_cache.isReady(cacheKey)) return;

    NativeAd(
      adUnitId: unit!.resolvedId,
      factoryId: 'nativeMedium',
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (ad) {
          _cache.set(cacheKey, ad);
          Logger.info('Native [${placement.key}] loaded', tag: 'ADS');
        },
        onAdFailedToLoad: (ad, err) {
          ad.dispose();
          Logger.warning(
            'Native [${placement.key}] load failed: ${err.message}',
            tag: 'ADS',
          );
        },
      ),
    ).load();
  }

  bool _nativeFullIntervalPassed() {
    final last = _lastNativeFullShownAt;
    if (last == null) return true;
    return DateTime.now().difference(last).inSeconds >=
        _cfg.rules.nativeFullInterval;
  }

  /// Gọi thủ công bất kỳ chỗ nào — check enableNativeFull.
  void showNativeFull({VoidCallback? onClosed}) {
    if (!_cfg.enableNativeFull || !_nativeFullIntervalPassed()) {
      onClosed?.call();
      return;
    }
    _showNativeAd(
      cacheKey: _kNativeFullCacheKey,
      onMiss: _preloadNativeFull,
      onClosed: onClosed,
    );
  }

  /// Gọi tự động sau inter — check nativeFullAfterInter.
  void _showNativeAfterInter({VoidCallback? onClosed}) {
    if (!_cfg.nativeFullAfterInter || !_nativeFullIntervalPassed()) {
      onClosed?.call();
      return;
    }
    _showNativeAd(
      cacheKey: _kNativeAfterInterCacheKey,
      onMiss: _preloadNativeAfterInter,
      onClosed: onClosed,
    );
  }

  void _showNativeAd({
    required String cacheKey,
    required VoidCallback onMiss,
    VoidCallback? onClosed,
  }) {
    // ⚡ Block native full nếu vừa show Inter/Rewarded — UX tránh chồng ad.
    // Exception: _showNativeAfterInter cố tình chain ngay sau inter dismiss
    // (đã ra ngoài cooldown 10s thì OK; nếu chưa thì skip — UX > revenue).
    if (_isInCooldown()) {
      Logger.warning(
        'Native full blocked by cross-handler cooldown',
        tag: 'ADS',
      );
      onClosed?.call();
      return;
    }

    if (!_cache.isReady(cacheKey)) {
      onMiss();
      onClosed?.call();
      return;
    }

    final ad = _cache.get<NativeAd>(cacheKey);
    if (ad == null) {
      onMiss();
      onClosed?.call();
      return;
    }

    _lastNativeFullShownAt = DateTime.now();
    _markAdShown();

    // ⚡ Dùng showDialog (overlay route — không thay đổi GoRouter stack)
    // thay vì Navigator.push trực tiếp → không break deep-linking.
    showDialog<void>(
      context: appContext,
      barrierDismissible: false,
      useSafeArea: false,
      builder: (dialogContext) => NativeAdFullScreen(
        ad: ad,
        onClosed: () {
          Navigator.of(dialogContext).pop();
          _cache.remove(cacheKey);
          onMiss();
          onClosed?.call();
        },
      ),
    );
  }

  // ── SESSION ───────────────────────────────────────────────────

  void resetSession() {
    _inter.resetSession();
    _appOpen.resetSession();
    _rewarded.resetSession();
    _lastAnyAdShownAt = null;
    _lastNativeFullShownAt = null;
  }
}
