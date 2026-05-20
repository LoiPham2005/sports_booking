// ════════════════════════════════════════════════════════════════
// 📁 lib/core/services/permission_service.dart (ADVANCED)
// ════════════════════════════════════════════════════════════════
import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:injectable/injectable.dart';
import 'package:permission_handler/permission_handler.dart';

/// 🛡️ Permission Service - Centralized permission management
@LazySingleton()
class PermissionService {
  static const String _tag = 'PERMISSION';

  /// Check single permission status
  Future<PermissionStatus> status(Permission permission) async {
    return await permission.status;
  }

  /// Check if permission is granted
  Future<bool> isGranted(Permission permission) async {
    final s = await status(permission);
    return s.isGranted || s.isLimited;
  }

  /// Request single permission
  /// [context] and [message] are used to show a dialog if permanently denied
  Future<bool> request(
    Permission permission, {
    BuildContext? context,
    String? message,
  }) async {
    Logger.info('Requesting permission: $permission', tag: _tag);

    final status = await permission.request();

    if (status.isGranted || status.isLimited) {
      Logger.success('Permission granted: $permission', tag: _tag);
      return true;
    }

    if (status.isPermanentlyDenied && context != null) {
      Logger.warning('Permission permanently denied: $permission', tag: _tag);
      await _showOpenSettingsDialog(context, message);
    }

    return false;
  }

  /// Request multiple permissions at once
  Future<Map<Permission, bool>> requestMultiple(
    List<Permission> permissions, {
    BuildContext? context,
  }) async {
    final statuses = await permissions.request();
    final results = <Permission, bool>{};

    for (final entry in statuses.entries) {
      results[entry.key] = entry.value.isGranted || entry.value.isLimited;

      if (entry.value.isPermanentlyDenied && context != null) {
        await _showOpenSettingsDialog(context, null);
        break; // Only show once to avoid spam
      }
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  Future<bool> requestCamera(BuildContext? context) => request(
    Permission.camera,
    context: context,
    message: 'Ứng dụng cần quyền Camera để chụp ảnh/quét mã.',
  );

  Future<bool> requestPhotos(BuildContext? context) => request(
    Permission.photos,
    context: context,
    message: 'Ứng dụng cần quyền Truy cập ảnh để chọn tệp.',
  );

  Future<bool> requestLocation(BuildContext? context) => request(
    Permission.locationWhenInUse,
    context: context,
    message: 'Ứng dụng cần vị trí của bạn để hiển thị bản đồ.',
  );

  Future<bool> requestNotification(BuildContext? context) => request(
    Permission.notification,
    context: context,
    message: 'Bật thông báo để không bỏ lỡ thông tin quan trọng.',
  );

  // ═══════════════════════════════════════════════════════════════
  // UI UTILITIES
  // ═══════════════════════════════════════════════════════════════

  Future<void> openSettings() => openAppSettings();

  Future<void> _showOpenSettingsDialog(
    BuildContext context,
    String? message,
  ) async {
    if (!context.mounted) return;

    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.settings_outlined, color: Colors.blue),
            SizedBox(width: 8),
            Text('Quyền ứng dụng'),
          ],
        ),
        content: Text(
          message ??
              'Bạn đã từ chối quyền vĩnh viễn. Vui lòng bật nó trong Cài đặt để sử dụng tính năng này.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Đóng', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Mở cài đặt'),
          ),
        ],
      ),
    );
  }
}
