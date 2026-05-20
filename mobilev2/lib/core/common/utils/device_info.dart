import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';

/// 📱 Device hardware & App platform information
class DeviceInfo {
  DeviceInfo._();

  static final _plugin = DeviceInfoPlugin();
  static PackageInfo? _packageInfo;

  // Cache
  static Map<String, dynamic>? _cachedInfo;
  static String? _cachedDeviceId;

  // ═══════════════════════════════════════════════════════════════
  // PLATFORM CHECKS
  // ═══════════════════════════════════════════════════════════════

  static bool get isWeb => kIsWeb;
  static bool get isIOS => !kIsWeb && Platform.isIOS;
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;
  static bool get isMacOS => !kIsWeb && Platform.isMacOS;
  static bool get isWindows => !kIsWeb && Platform.isWindows;
  static bool get isLinux => !kIsWeb && Platform.isLinux;

  static bool get isMobile => isAndroid || isIOS;
  static bool get isDesktop => isMacOS || isWindows || isLinux;

  // ═══════════════════════════════════════════════════════════════
  // APP INFORMATION (Consolidated from AppInfo)
  // ═══════════════════════════════════════════════════════════════

  static Future<PackageInfo> getPackageInfo() async {
    _packageInfo ??= await PackageInfo.fromPlatform();
    return _packageInfo!;
  }

  static Future<String> getAppVersion() async => (await getPackageInfo()).version;
  static Future<String> getBuildNumber() async => (await getPackageInfo()).buildNumber;
  static Future<String> getAppName() async => (await getPackageInfo()).appName;
  static Future<String> getPackageName() async => (await getPackageInfo()).packageName;

  // ═══════════════════════════════════════════════════════════════
  // DEVICE INFORMATION
  // ═══════════════════════════════════════════════════════════════

  /// Get full device info (cached)
  static Future<Map<String, dynamic>> getInfo() async {
    if (_cachedInfo != null) return _cachedInfo!;

    final info = <String, dynamic>{};
    try {
      if (isAndroid) {
        final android = await _plugin.androidInfo;
        info.addAll({
          'model': android.model,
          'osVersion': android.version.release,
          'sdkInt': android.version.sdkInt,
          'isPhysicalDevice': android.isPhysicalDevice,
          'id': android.id,
        });
      } else if (isIOS) {
        final ios = await _plugin.iosInfo;
        info.addAll({
          'model': ios.model,
          'osVersion': ios.systemVersion,
          'isPhysicalDevice': ios.isPhysicalDevice,
          'id': ios.identifierForVendor,
        });
      }
    } catch (_) {}

    _cachedInfo = info;
    return info;
  }

  static Future<String> getModel() async =>
      (await getInfo())['model'] as String? ?? 'Unknown';
  static Future<String> getOSVersion() async =>
      (await getInfo())['osVersion'] as String? ?? 'Unknown';
  static Future<int> getAndroidSdkVersion() async =>
      (await getInfo())['sdkInt'] as int? ?? 0;
  static Future<bool> isPhysicalDevice() async =>
      (await getInfo())['isPhysicalDevice'] as bool? ?? true;

  static Future<String?> getDeviceId() async {
    if (_cachedDeviceId != null) return _cachedDeviceId;
    _cachedDeviceId = (await getInfo())['id'] as String?;
    return _cachedDeviceId;
  }

  /// Clear all cache
  static void clearCache() {
    _cachedInfo = null;
    _cachedDeviceId = null;
    _packageInfo = null;
  }
}
