// ════════════════════════════════════════════════════════════════
// 📁 lib/core/common/utils/image_picker_utils.dart
// ════════════════════════════════════════════════════════════════
//
// Pick image từ gallery/camera với auto permission check.
// Compress ảnh + UI dialog chọn nguồn.
//
// Cách dùng:
//   final file = await ImagePickerUtils.showSourceDialog(context);
//   if (file != null) {
//     final compressed = await ImagePickerUtils.compressImage(file);
//   }

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/services/permission/permission_service.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_picker/image_picker.dart';

/// Image picker helper
///
/// Responsibilities:
/// - Pick images from gallery/camera (with permission check)
/// - Compress images
/// - Show picker dialog
class ImagePickerUtils {
  ImagePickerUtils._();

  static final _picker = ImagePicker();
  static PermissionService get _permissionService => getIt<PermissionService>();

  // ═══════════════════════════════════════════════════════════════
  // PICK OPERATIONS (with permission check)
  // ═══════════════════════════════════════════════════════════════

  /// Pick image from gallery
  static Future<File?> pickFromGallery(BuildContext? context) async {
    try {
      // ✅ Check permission first
      final hasPermission = await _permissionService.requestPhotos(context);
      if (!hasPermission) {
        Logger.warning('Gallery permission denied');
        return null;
      }

      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
      return pickedFile != null ? File(pickedFile.path) : null;
    } catch (e) {
      Logger.error('Failed to pick from gallery', error: e);
      return null;
    }
  }

  /// Pick image from camera
  static Future<File?> pickFromCamera(BuildContext? context) async {
    try {
      // ✅ Check permission first
      final hasPermission = await _permissionService.requestCamera(context);
      if (!hasPermission) {
        Logger.warning('Camera permission denied');
        return null;
      }

      final pickedFile = await _picker.pickImage(source: ImageSource.camera);
      return pickedFile != null ? File(pickedFile.path) : null;
    } catch (e) {
      Logger.error('Failed to pick from camera', error: e);
      return null;
    }
  }

  /// Pick multiple images
  static Future<List<File>> pickMultiple(
    BuildContext? context, {
    int maxCount = 10,
  }) async {
    try {
      // ✅ Check permission first
      final hasPermission = await _permissionService.requestPhotos(context);
      if (!hasPermission) {
        Logger.warning('Gallery permission denied');
        return [];
      }

      final pickedFiles = await _picker.pickMultiImage();
      return pickedFiles.take(maxCount).map((file) => File(file.path)).toList();
    } catch (e) {
      Logger.error('Failed to pick multiple images', error: e);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPRESS OPERATION
  // ═══════════════════════════════════════════════════════════════

  /// Compress image
  static Future<File?> compressImage(
    File file, {
    int quality = 85,
    int? maxWidth,
    int? maxHeight,
  }) async {
    try {
      final targetPath =
          '${file.parent.path}/compressed_${file.path.split('/').last}';

      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: quality,
        minWidth: maxWidth ?? 1920,
        minHeight: maxHeight ?? 1080,
      );

      if (result != null) {
        final originalSize = await file.length();
        final compressedSize = await File(result.path).length();
        final saved = ((1 - compressedSize / originalSize) * 100).toInt();

        Logger.info('Image compressed: saved $saved%');
        return File(result.path);
      }

      return null;
    } catch (e) {
      Logger.error('Failed to compress image', error: e);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════════════════════════════

  /// Show image source picker dialog
  static Future<File?> showSourceDialog(BuildContext context) async {
    return showDialog<File>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Chọn nguồn ảnh'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Thư viện'),
              onTap: () async {
                final file = await pickFromGallery(context);
                if (dialogContext.mounted) {
                  Navigator.pop(dialogContext, file);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () async {
                final file = await pickFromCamera(context);
                if (dialogContext.mounted) {
                  Navigator.pop(dialogContext, file);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Generate placeholder color based on text
  static Color getPlaceholderColor(String text) {
    final hash = text.hashCode;
    return Color.fromARGB(
      255,
      (hash & 0xFF0000) >> 16,
      (hash & 0x00FF00) >> 8,
      hash & 0x0000FF,
    );
  }
}
