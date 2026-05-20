import 'package:flutter/foundation.dart';

abstract class ErrorUtils {
  static final _locationRegex = RegExp(
    r'(?:package:[a-z0-9_]+/|lib/)([^)\s]+\.dart:\d+:\d+)',
  );

  /// Trích vị trí file `lib/...` từ [FlutterErrorDetails] — giúp dev tìm
  /// nguyên nhân nhanh khi `ErrorWidget.builder` được trigger.
  ///
  /// Quét theo thứ tự:
  ///   1. Summary/context của error (thường có frame đầu)
  ///   2. Stack trace — bỏ qua frames Flutter framework, lấy frame app đầu tiên
  static String? extractLocation(FlutterErrorDetails details) {
    try {
      final fromMsg = _locationRegex.firstMatch(details.toString());
      if (fromMsg != null) return 'lib/${fromMsg.group(1)}';

      final stack = details.stack;
      if (stack != null) {
        for (final line in stack.toString().split('\n')) {
          if (line.contains('package:flutter/')) continue;
          final m = _locationRegex.firstMatch(line);
          if (m != null) return 'lib/${m.group(1)}';
        }
      }
    } catch (_) {
      // Best-effort — never throw từ error handler.
    }
    return null;
  }
}
