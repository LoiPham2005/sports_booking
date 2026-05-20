// ════════════════════════════════════════════════════════════════
// 📁 lib/modules/app_config/services/app_config_service.dart
// ════════════════════════════════════════════════════════════════
//
// Wrapper Firebase Remote Config — parse JSON 1 key duy nhất thành
// `AppConfigSnapshot` (atomic update, không lệch field).
//
// Lưu ý: Version-related keys đã được `AppVersionService` xử lý riêng.
//
// 📦 Firebase Console — chỉ 1 key:
//   `app_config` (String JSON) — xem schema trong `AppConfigSnapshot`.
//
// 🔌 Toggle: xem `kUseAppRemoteConfig` ở `app_config_defaults.dart`.

import 'dart:async';
import 'dart:convert';

import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/app_config/models/app_config_snapshot.dart';
import 'package:sports_booking_mobile/modules/app_config/utils/app_config_defaults.dart';
import 'package:injectable/injectable.dart';

const _kAppConfigKey = 'app_config';

@LazySingleton()
class AppConfigService {
  AppConfigService();

  static const _tag = 'APP-CONFIG';

  /// Lazy — resolve sau khi Firebase init thành công.
  FirebaseRemoteConfig? _remoteConfig;
  StreamSubscription<RemoteConfigUpdate>? _updateSub;

  /// ⚡ Reactive snapshot — emit mỗi khi Remote Config đổi.
  final ValueNotifier<AppConfigSnapshot> snapshot =
      ValueNotifier<AppConfigSnapshot>(AppConfigSnapshot.empty);

  /// Gọi 1 lần ở AppInitializer (sau Firebase.initializeApp).
  Future<void> initialize() async {
    if (!kUseAppRemoteConfig) {
      snapshot.value = kAppConfigDev;
      Logger.info(
        'kUseAppRemoteConfig=false → dùng kAppConfigDev (no Firebase)',
        tag: _tag,
      );
      return;
    }

    try {
      _remoteConfig = FirebaseRemoteConfig.instance;
    } catch (e, s) {
      Logger.error(
        'FirebaseRemoteConfig unavailable — fallback empty',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
      snapshot.value = kAppConfigDisabled;
      return;
    }

    final rc = _remoteConfig!;
    try {
      await rc.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 10),
          minimumFetchInterval: const Duration(minutes: 30),
        ),
      );
      await rc.setDefaults({
        _kAppConfigKey: jsonEncode(AppConfigSnapshot.empty.toJson()),
      });

      await rc.fetchAndActivate();
      _parseFromRemote();

      _updateSub = rc.onConfigUpdated.listen((_) async {
        await rc.activate();
        _parseFromRemote();
        Logger.info('Config updated via realtime', tag: _tag);
      });
    } catch (e, s) {
      Logger.error(
        'Remote Config init failed',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
    }
  }

  /// Trigger manual refresh — dùng cho pull-to-refresh / debug page.
  Future<bool> refresh() async {
    final rc = _remoteConfig;
    if (rc == null) return false;
    try {
      final activated = await rc.fetchAndActivate();
      _parseFromRemote();
      Logger.info('Manual refresh activated=$activated', tag: _tag);
      return activated;
    } catch (e, s) {
      Logger.error('Manual refresh failed', error: e, stackTrace: s, tag: _tag);
      return false;
    }
  }

  /// Parse JSON từ key `app_config` → snapshot. Fail → kAppConfigDisabled.
  void _parseFromRemote() {
    final rc = _remoteConfig;
    if (rc == null) return;

    final raw = rc.getString(_kAppConfigKey);
    if (raw.isEmpty) {
      snapshot.value = kAppConfigDisabled;
      return;
    }
    try {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      snapshot.value = AppConfigSnapshot.fromJson(json);
      if (kDebugMode) Logger.info('Parsed: ${snapshot.value}', tag: _tag);
    } catch (e, s) {
      Logger.error(
        'Parse JSON failed → fallback disabled',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
      snapshot.value = kAppConfigDisabled;
    }
  }

  // ── Typed getters — route qua snapshot để hỗ trợ local + Firebase mode.

  bool get isMaintenance => snapshot.value.isMaintenance;
  String get maintenanceMessage => snapshot.value.maintenanceMessage;

  bool get noticeEnabled => snapshot.value.noticeEnabled;
  String get noticeTitle => snapshot.value.noticeTitle;
  String get noticeBody => snapshot.value.noticeBody;
  String get noticeUrl => snapshot.value.noticeUrl;
  bool get hasNotice => snapshot.value.hasNotice;
  bool get hasNoticeAction => snapshot.value.hasNoticeAction;

  String get policyUrl => snapshot.value.policyUrl;
  String get termsUrl => snapshot.value.termsUrl;

  // ── Generic getters cho custom feature flags (không cần thêm field).

  String getString(String key) => _remoteConfig?.getString(key) ?? '';
  bool getBool(String key) => _remoteConfig?.getBool(key) ?? false;
  int getInt(String key) => _remoteConfig?.getInt(key) ?? 0;
  double getDouble(String key) => _remoteConfig?.getDouble(key) ?? 0.0;

  @disposeMethod
  void dispose() {
    _updateSub?.cancel();
    _updateSub = null;
    snapshot.dispose();
    Logger.info('AppConfigService disposed', tag: _tag);
  }
}
