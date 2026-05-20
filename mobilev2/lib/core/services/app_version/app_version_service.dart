// ════════════════════════════════════════════════════════════════
// 📁 lib/core/services/app_version/app_version_service.dart
// ════════════════════════════════════════════════════════════════
//
// Check force update / optional update từ Firebase Remote Config.
//
// Remote Config keys (đặt bên Firebase Console):
//   - `force_update_version` (string)   — vd "1.2.0". App version < này → force update.
//   - `latest_version` (string)         — vd "1.5.0". Lớn hơn current → suggest update.
//   - `update_message` (string)         — Optional message hiển thị trong dialog.
//   - `update_url_android` (string)     — Optional override Play Store URL.
//   - `update_url_ios` (string)         — Optional override App Store URL.
//
// Cách dùng (sau khi user login hoặc ở splash):
//   final updated = await getIt<AppVersionService>().checkForUpdate(
//     context: context,
//     labels: AppVersionLabels.vi,
//     storeIds: const StoreIds(
//       androidPackage: 'com.example.myapp',
//       iosAppId: '1234567890',
//     ),
//   );

import 'dart:async';
import 'dart:io';

import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/services/app_version/widgets/app_update_dialog.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:injectable/injectable.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

/// 🆔 Store identifiers — bắt buộc khi gọi `checkForUpdate`.
class StoreIds {
  const StoreIds({required this.androidPackage, required this.iosAppId});

  /// Android package name — vd `com.example.myapp` (khớp với `applicationId` trong `build.gradle`).
  final String androidPackage;

  /// iOS App Store numeric ID — vd `1234567890` (lấy từ App Store Connect).
  final String iosAppId;
}

/// 🏷️ I18n labels cho dialog. Ngôn ngữ khác → đổi instance khác.
class AppVersionLabels {
  const AppVersionLabels({
    required this.forceUpdateTitle,
    required this.optionalUpdateTitle,
    required this.updateButton,
    required this.laterButton,
    required this.exitButton,
    required this.upToDateTitle,
    required this.upToDateMessage,
    required this.versionLabel,
  });

  final String forceUpdateTitle;
  final String optionalUpdateTitle;
  final String updateButton;
  final String laterButton;
  final String exitButton;
  final String upToDateTitle;
  final String upToDateMessage;
  final String versionLabel;

  /// 🇻🇳 Preset tiếng Việt.
  static const vi = AppVersionLabels(
    forceUpdateTitle: '🚨 Cập nhật bắt buộc',
    optionalUpdateTitle: '✨ Có bản mới',
    updateButton: 'Cập nhật ngay',
    laterButton: 'Để sau',
    exitButton: 'Thoát',
    upToDateTitle: 'Đã cập nhật',
    upToDateMessage: 'Bạn đang dùng phiên bản mới nhất.',
    versionLabel: 'Phiên bản',
  );

  /// 🇬🇧 Preset English.
  static const en = AppVersionLabels(
    forceUpdateTitle: '🚨 Update required',
    optionalUpdateTitle: '✨ New version available',
    updateButton: 'Update now',
    laterButton: 'Later',
    exitButton: 'Exit',
    upToDateTitle: 'Up to date',
    upToDateMessage: 'You are running the latest version.',
    versionLabel: 'Version',
  );
}

/// 🚀 Service check + hiển thị dialog update.
@LazySingleton()
class AppVersionService {
  static const _tag = 'APP-VERSION';

  // Remote Config keys
  static const _kForceUpdate = 'force_update_version';
  static const _kLatestVersion = 'latest_version';
  static const _kUpdateMessage = 'update_message';
  static const _kUpdateUrlAndroid = 'update_url_android';
  static const _kUpdateUrlIos = 'update_url_ios';

  /// Lazy — resolve sau khi Firebase init.
  FirebaseRemoteConfig? _remoteConfig;
  PackageInfo? _packageInfo;

  /// Gọi 1 lần ở AppInitializer.
  Future<void> initialize() async {
    try {
      _remoteConfig = FirebaseRemoteConfig.instance;
      await _remoteConfig!.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 10),
          minimumFetchInterval: const Duration(hours: 1),
        ),
      );
      await _remoteConfig!.setDefaults({
        _kForceUpdate: '0.0.0',
        _kLatestVersion: '0.0.0',
        _kUpdateMessage: '',
      });
      await _remoteConfig!.fetchAndActivate();
    } catch (e, s) {
      Logger.error(
        'AppVersion init failed',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
    }
  }

  /// Cached package info.
  Future<PackageInfo> getAppInfo() async {
    _packageInfo ??= await PackageInfo.fromPlatform();
    return _packageInfo!;
  }

  /// 🔍 Main check flow. Trả về `true` nếu đã handle update (force hoặc dismissed dialog).
  ///
  /// - `showWhenUpToDate`: hiển thị "Đã cập nhật" — chỉ nên `true` khi user manually trigger.
  /// - `showLoadingWhileChecking`: hiển thị loading dialog trong khi fetch.
  Future<UpdateCheckResult> checkForUpdate({
    required BuildContext context,
    required AppVersionLabels labels,
    required StoreIds storeIds,
    bool showWhenUpToDate = false,
    bool showLoadingWhileChecking = false,
  }) async {
    if (showLoadingWhileChecking && context.mounted) {
      // Hiển thị loading nhưng không await để user vẫn thấy UI.
      unawaited(showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      ));
    }

    try {
      final rc = _remoteConfig;
      if (rc == null) {
        if (showLoadingWhileChecking && context.mounted) Navigator.of(context).pop();
        return UpdateCheckResult.noConfig;
      }

      await rc.fetchAndActivate();
      final pkg = await getAppInfo();
      final current = pkg.version;
      final force = rc.getString(_kForceUpdate);
      final latest = rc.getString(_kLatestVersion);
      final message = rc.getString(_kUpdateMessage);
      final customUrl = Platform.isAndroid
          ? rc.getString(_kUpdateUrlAndroid)
          : rc.getString(_kUpdateUrlIos);

      Logger.info(
        'current=$current | force=$force | latest=$latest',
        tag: _tag,
      );

      if (showLoadingWhileChecking && context.mounted) {
        Navigator.of(context).pop();
      }
      if (!context.mounted) return UpdateCheckResult.unknown;

      if (_isLower(current, force)) {
        await _showDialog(
          context: context,
          labels: labels,
          storeIds: storeIds,
          currentVersion: current,
          latestVersion: force,
          message: message.isEmpty ? null : message,
          customUrl: customUrl.isEmpty ? null : customUrl,
          isMandatory: true,
        );
        return UpdateCheckResult.forceUpdate;
      }

      if (_isLower(current, latest)) {
        await _showDialog(
          context: context,
          labels: labels,
          storeIds: storeIds,
          currentVersion: current,
          latestVersion: latest,
          message: message.isEmpty ? null : message,
          customUrl: customUrl.isEmpty ? null : customUrl,
          isMandatory: false,
        );
        return UpdateCheckResult.optionalUpdate;
      }

      if (showWhenUpToDate) {
        await _showUpToDateDialog(context, labels, current);
      }
      return UpdateCheckResult.upToDate;
    } catch (e, s) {
      Logger.error(
        'checkForUpdate failed',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
      if (showLoadingWhileChecking && context.mounted) {
        Navigator.of(context).pop();
      }
      return UpdateCheckResult.error;
    }
  }

  /// So sánh semver — `a < b` ?
  /// Hỗ trợ format `x.y.z`, `x.y.z+build`, `x.y.z-rc1`.
  /// Pre-release suffix (`-rc1`) coi như nhỏ hơn cùng version stable.
  static bool _isLower(String a, String b) {
    return _compareVersions(a, b) < 0;
  }

  /// Trả về số âm nếu a nhỏ hơn b, 0 nếu a bằng b, số dương nếu a lớn hơn b.
  static int _compareVersions(String a, String b) {
    final (na, preA) = _parseVersion(a);
    final (nb, preB) = _parseVersion(b);

    for (var i = 0; i < 3; i++) {
      final ai = i < na.length ? na[i] : 0;
      final bi = i < nb.length ? nb[i] : 0;
      if (ai != bi) return ai.compareTo(bi);
    }
    // Same numeric — pre-release nhỏ hơn stable.
    if (preA.isEmpty && preB.isNotEmpty) return 1;
    if (preA.isNotEmpty && preB.isEmpty) return -1;
    return preA.compareTo(preB);
  }

  /// Parse "1.2.3-rc1+build5" → ([1,2,3], "rc1").
  static (List<int>, String) _parseVersion(String v) {
    final clean = v.split('+').first; // strip build suffix
    final parts = clean.split('-');
    final main = parts[0];
    final pre = parts.length > 1 ? parts.sublist(1).join('-') : '';
    final nums = main.split('.').map((s) => int.tryParse(s) ?? 0).toList();
    return (nums, pre);
  }

  Future<void> _showDialog({
    required BuildContext context,
    required AppVersionLabels labels,
    required StoreIds storeIds,
    required String currentVersion,
    required String latestVersion,
    required bool isMandatory,
    String? message,
    String? customUrl,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: !isMandatory,
      builder: (_) => AppUpdateDialog(
        labels: labels,
        currentVersion: currentVersion,
        latestVersion: latestVersion,
        isMandatory: isMandatory,
        message: message,
        onUpdate: () => _openStore(storeIds, customUrl),
        onExit: () => isMandatory ? exit(0) : Navigator.of(context).pop(),
      ),
    );
  }

  Future<void> _showUpToDateDialog(
    BuildContext context,
    AppVersionLabels labels,
    String version,
  ) {
    return showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(labels.upToDateTitle),
        content: Text(
          '${labels.upToDateMessage}\n\n${labels.versionLabel}: $version',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(labels.laterButton),
          ),
        ],
      ),
    );
  }

  Future<void> _openStore(StoreIds ids, String? customUrl) async {
    final url = customUrl?.isNotEmpty == true
        ? customUrl!
        : Platform.isAndroid
            ? 'https://play.google.com/store/apps/details?id=${ids.androidPackage}'
            : 'https://apps.apple.com/app/id${ids.iosAppId}';

    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      Logger.warning('Cannot launch store URL: $url', tag: _tag);
    }
  }
}

/// 📊 Kết quả `checkForUpdate`.
enum UpdateCheckResult {
  forceUpdate,
  optionalUpdate,
  upToDate,
  noConfig,
  error,
  unknown,
}
