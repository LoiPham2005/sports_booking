import 'dart:convert';

import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/utils/ad_defaults.dart';
import 'package:injectable/injectable.dart';

/// Key trong Firebase Remote Config.
const _kAdConfigKey = 'ad_config';

@lazySingleton
class AdConfigService {
  /// Constructor KHÔNG nhận `FirebaseRemoteConfig` qua DI — lazy resolve trong
  /// `initialize()` để tránh crash khi Firebase.initializeApp chưa chạy xong.
  AdConfigService();

  /// Lazy — chỉ access sau khi Firebase init thành công.
  FirebaseRemoteConfig? _remoteConfig;

  /// Expose ra ValueNotifier để widget lắng nghe realtime.
  /// Dev mode hoặc tắt Remote Config → dùng test IDs; ngược lại → disabled khi chưa fetch.
  final ValueNotifier<AdConfig> config = ValueNotifier(
    (!kUseRemoteConfig || kDebugMode) ? AdConfig.development() : AdConfig.disabled(),
  );

  AdConfig get current => config.value;

  /// Gọi 1 lần ở `AppInitializer._initAds()` — phải SAU `Firebase.initializeApp()`.
  /// Nếu Firebase chưa init → log warning và dùng config dev/disabled.
  Future<void> initialize() async {
    if (!kUseRemoteConfig) {
      Logger.info(
        'kUseRemoteConfig=false → dùng AdConfig.development()',
        tag: 'ADS CONFIG',
      );
      _updateConfig();
      return;
    }

    // ⚡ Lazy resolve Firebase — bắt mọi exception (Firebase chưa init, plugin
    // chưa available...) để không block app boot.
    try {
      _remoteConfig = FirebaseRemoteConfig.instance;
    } catch (e, s) {
      Logger.error(
        'FirebaseRemoteConfig unavailable — falling back to disabled config',
        error: e,
        stackTrace: s,
        tag: 'ADS CONFIG',
      );
      return;
    }

    final rc = _remoteConfig!;

    await rc.setConfigSettings(
      RemoteConfigSettings(
        fetchTimeout: const Duration(seconds: 10),
        minimumFetchInterval:
            kDebugMode ? Duration.zero : const Duration(hours: 1),
      ),
    );

    // Giá trị mặc định khi chưa fetch được — tắt ads.
    await rc.setDefaults({
      _kAdConfigKey: jsonEncode(AdConfig.disabled().toJson()),
    });

    await _fetchAndActivate();

    // Lắng nghe thay đổi realtime (Remote Config Realtime).
    rc.onConfigUpdated.listen((_) async {
      await rc.activate();
      _updateConfig();
    });
  }

  Future<void> _fetchAndActivate() async {
    final rc = _remoteConfig;
    if (rc == null) {
      _updateConfig();
      return;
    }
    try {
      final activated = await rc.fetchAndActivate();
      Logger.info(
        'fetchAndActivate → activated=$activated | '
        'status=${rc.lastFetchStatus} | '
        'lastFetch=${rc.lastFetchTime}',
        tag: 'ADS CONFIG',
      );
    } catch (e) {
      Logger.error('fetchAndActivate failed', error: e, tag: 'ADS CONFIG');
    }
    _updateConfig();
  }

  void _updateConfig() {
    if (!kUseRemoteConfig || _remoteConfig == null) {
      config.value = AdConfig.development();
      _logConfig(config.value);
      return;
    }

    final rc = _remoteConfig!;
    final raw = rc.getString(_kAdConfigKey);
    final source = rc.getValue(_kAdConfigKey).source;
    Logger.info(
      'source=$source | length=${raw.length} chars',
      tag: 'ADS CONFIG',
    );

    final parsed = _parse(raw);
    if (!parsed.useRemoteConfig) {
      Logger.info(
        'useRemoteConfig=false → dùng AdConfig.development()',
        tag: 'ADS CONFIG',
      );
      config.value = AdConfig.development();
      _logConfig(config.value);
      return;
    }
    config.value = parsed;
  }

  AdConfig _parse(String raw) {
    if (raw.isEmpty) return AdConfig.disabled();
    try {
      final cfg = AdConfig.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      _logConfig(cfg);
      return cfg;
    } catch (e) {
      Logger.error(
        'parse failed → fallback disabled',
        error: e,
        tag: 'ADS CONFIG',
      );
      return AdConfig.disabled();
    }
  }

  void _logConfig(AdConfig cfg) {
    if (!kDebugMode) return; // ⚡ Production: skip pretty-print
    final rows = <(String, String)>[];

    rows
      ..add(('showAllAds', '${cfg.showAllAds}'))
      ..add(('enableInter', '${cfg.enableInter}'))
      ..add(('enableAppOpen', '${cfg.enableAppOpen}'))
      ..add(('enableRewarded', '${cfg.enableRewarded}'))
      ..add(('enableNative', '${cfg.enableNative}'))
      ..add(('enableNativeFull', '${cfg.enableNativeFull}'))
      ..add(('enableBanner', '${cfg.enableBanner}'))
      ..add(('nativeFullAfterInter', '${cfg.nativeFullAfterInter}'))
      ..add(('totalPlacements', '${cfg.totalPlacements}'))
      ..add(('interInterval', '${cfg.rules.interInterval}s'))
      ..add(('maxInterPerSession', '${cfg.rules.maxInterPerSession}'));

    void addGroup(String type, Map<String, AdUnit> units) {
      if (units.isEmpty) return;
      rows.add(('── $type (${units.length})', ''));
      for (final e in units.entries) {
        final u = e.value;
        final status = u.enable ? '✅ ON' : '❌ OFF';
        final activeId = (u.useId2 == true && u.id2.isNotEmpty) ? u.id2 : u.id;
        final idLine = u.id2.isNotEmpty
            ? 'id=${u.id} | id2=${u.id2} | useId2=${u.useId2 ?? 'null'} → $activeId'
            : u.id;
        rows.add(('  ${e.key}', '$status  $idLine'));
      }
    }

    addGroup('inter', cfg.inter);
    addGroup('app_open', cfg.appOpen);
    addGroup('rewarded', cfg.rewarded);
    addGroup('native', cfg.native);
    addGroup('banner', cfg.banner);

    Logger.adTable('Config Updated', tag: 'ADS CONFIG', rows: rows);
  }
}
