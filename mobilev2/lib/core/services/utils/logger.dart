// ════════════════════════════════════════════════════════════════
// 📁 lib/core/services/utils/logger.dart
//
// Single source of truth cho log:
//   - info/warning/success/debug/error    (text + tag + level)
//   - httpRequest/Response/Error          (border frames + duration)
//   - riverpod{Add/Update/Dispose/Error}  (provider lifecycle)
//   - adTable                             (bảng cho ads)
//
// Tính năng:
//   - Mask sensitive fields (password/token/otp...) — recursive cho map/list
//   - Auto Crashlytics cho error + http 5xx (release-only, safe try/catch)
//   - Toggle qua LogConfig (master switch theo build mode)
// ════════════════════════════════════════════════════════════════
import 'dart:convert';
import 'dart:developer' as developer;

import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

// developer.log severity levels — DevTools dùng để filter
const _levelDebug = 500;
const _levelInfo = 800;
const _levelWarning = 900;
const _levelError = 1000;

/// Simple & Powerful Logger Configuration
class LogConfig {
  // ═══════════════════════════════════════════════════════════════
  // CORE SETTINGS
  // ═══════════════════════════════════════════════════════════════

  /// Enable all logs (master switch)
  static bool enabled = kDebugMode;

  /// Show HTTP logs
  static bool showHttp = kDebugMode;

  /// Show Riverpod logs
  static bool showRiverpod = kDebugMode;

  /// Mask sensitive data (password, token, etc.)
  static bool maskSensitive = !kDebugMode;

  /// Send errors to crash reporting (Firebase, Sentry)
  static bool crashReporting = kReleaseMode;

  // ═══════════════════════════════════════════════════════════════
  // SENSITIVE FIELDS (auto-masked)
  // ═══════════════════════════════════════════════════════════════

  static const sensitiveFields = {
    'password',
    'token',
    'access_token',
    'refresh_token',
    'authorization',
    'secret',
    'api_key',
    'pin',
    'otp',
    'cvv',
  };
}

/// Logger with Beautiful Border Frames
class Logger {
  Logger._();

  static const _name = 'APP';
  static const _maxLength = 10000;
  static const _width = 60;

  // Box drawing characters
  static const _line = '═';
  static const _divider = '─';
  static const _topLeft = '╔';
  static const _topRight = '╗';
  static const _bottomLeft = '╚';
  static const _bottomRight = '╝';
  static const _middleLeft = '╠';
  static const _middleRight = '╣';
  static const _vertical = '║';

  // Border helpers
  static String get _top => '$_topLeft${_line * _width}$_topRight';
  static String get _middle => '$_middleLeft${_line * _width}$_middleRight';
  static String get _bottom => '$_bottomLeft${_line * _width}$_bottomRight';
  static String get _section => '$_middleLeft${_divider * _width}$_middleRight';

  // ═══════════════════════════════════════════════════════════════
  // 📝 BASIC LOGS
  // ═══════════════════════════════════════════════════════════════

  static void info(String message, {String? tag}) {
    if (!LogConfig.enabled) return;
    final tagStr = tag != null ? '[$tag] ' : '';
    developer.log('ℹ️ $tagStr$message', name: _name, level: _levelInfo);
  }

  static void warning(String message, {String? tag}) {
    if (!LogConfig.enabled) return;
    final tagStr = tag != null ? '[$tag] ' : '';
    developer.log('⚠️ $tagStr$message', name: _name, level: _levelWarning);
  }

  static void success(String message, {String? tag}) {
    if (!LogConfig.enabled) return;
    final tagStr = tag != null ? '[$tag] ' : '';
    developer.log('✅ $tagStr$message', name: _name, level: _levelInfo);
  }

  static void debug(String message, {String? tag}) {
    if (!LogConfig.enabled) return;
    final tagStr = tag != null ? '[$tag] ' : '';
    developer.log('🐛 $tagStr$message', name: _name, level: _levelDebug);
  }

  // ═══════════════════════════════════════════════════════════════
  // ❌ ERROR LOG (WITH BORDER)
  // ═══════════════════════════════════════════════════════════════

  static void error(
    String message, {
    String? tag,
    Object? error,
    StackTrace? stackTrace,
    String? location,
  }) {
    if (!LogConfig.enabled) return;

    final buffer = StringBuffer();
    final tagStr = tag != null ? '[$tag] ' : '';

    buffer.writeln('\n$_top');
    buffer.writeln('$_vertical ❌ ERROR $tagStr');
    buffer.writeln(_middle);
    buffer.writeln('$_vertical $message');

    if (error != null) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical Details: ${error.toString()}');
    }

    if (location != null) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical Location: $location');
    }

    if (kDebugMode && stackTrace != null) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical Stack Trace (Top 3):');
      final lines = stackTrace.toString().split('\n').take(3);
      for (final line in lines) {
        buffer.writeln('$_vertical   $line');
      }
    }

    buffer.writeln(_bottom);
    developer.log(buffer.toString(), name: _name, level: _levelError);

    if (LogConfig.crashReporting) {
      _sendToCrashReporting(message, error, stackTrace);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 HTTP REQUEST (WITH BORDER)
  // ═══════════════════════════════════════════════════════════════

  static void httpRequest(String method, String url, {dynamic data}) {
    if (!LogConfig.enabled || !LogConfig.showHttp) return;

    final buffer = StringBuffer();
    final uri = Uri.parse(url);

    // buffer.writeln(_top);
    buffer.writeln('\n$_top');
    buffer.writeln('$_vertical 🚀 REQUEST: $method');
    buffer.writeln(_middle);
    buffer.writeln('$_vertical Domain: ${uri.host}');
    buffer.writeln('$_vertical Endpoint: ${uri.path}');

    if (uri.queryParameters.isNotEmpty) {
      buffer.writeln('$_vertical Query: ${uri.queryParameters}');
    }

    // Log body for mutations
    if (data != null && ['POST', 'PUT', 'PATCH'].contains(method)) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical 📦 Body:');
      final body = _formatBody(data);
      for (final line in body.split('\n')) {
        buffer.writeln('$_vertical   $line');
      }
    }

    buffer.writeln(_bottom);
    developer.log(buffer.toString(), name: _name);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 HTTP RESPONSE (WITH BORDER)
  // ═══════════════════════════════════════════════════════════════

  static void httpResponse(
    String method,
    String url,
    int statusCode, {
    dynamic data,
    Duration? duration,
  }) {
    if (!LogConfig.enabled || !LogConfig.showHttp) return;

    final buffer = StringBuffer();
    final uri = Uri.parse(url);
    final isSuccess = statusCode >= 200 && statusCode < 300;
    final emoji = isSuccess ? '✅' : '⚠️';
    final time = duration != null ? ' (${duration.inMilliseconds}ms)' : '';

    // buffer.writeln(_top);
    buffer.writeln('\n$_top');
    buffer.writeln('$_vertical $emoji RESPONSE: $statusCode$time');
    buffer.writeln(_middle);
    buffer.writeln('$_vertical $method ${uri.path}');

    // Log response data
    if (data != null) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical 📥 Response Data:');
      final response = _formatJson(data);
      for (final line in response.split('\n')) {
        buffer.writeln('$_vertical   $line');
      }
    }

    buffer.writeln(_bottom);
    developer.log(buffer.toString(), name: _name);

    // Send 5xx errors to crash reporting
    if (LogConfig.crashReporting && statusCode >= 500) {
      _sendToCrashReporting('HTTP $statusCode: $method $url', data, null);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 HTTP ERROR (WITH BORDER)
  // ═══════════════════════════════════════════════════════════════

  static void httpError(
    String method,
    String url,
    int? statusCode,
    dynamic errorData, {
    Duration? duration,
  }) {
    if (!LogConfig.enabled || !LogConfig.showHttp) return;

    final buffer = StringBuffer();
    final time = duration != null ? ' (${duration.inMilliseconds}ms)' : '';

    // buffer.writeln(_top);
    buffer.writeln('\n$_top');
    buffer.writeln('$_vertical ❌ HTTP ERROR [$statusCode]$time');
    buffer.writeln(_middle);
    buffer.writeln('$_vertical $method $url');

    if (errorData != null) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical Response:');
      final response = _formatJson(errorData);
      for (final line in response.split('\n')) {
        buffer.writeln('$_vertical   $line');
      }
    }

    buffer.writeln(_bottom);
    developer.log(buffer.toString(), name: _name, level: _levelWarning);

    if (LogConfig.crashReporting) {
      _sendToCrashReporting('HTTP Error $statusCode: $method $url', errorData, null);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 RIVERPOD OBSERVER
  // ═══════════════════════════════════════════════════════════════

  static void riverpodAdd(String provider) {
    if (!LogConfig.enabled || !LogConfig.showRiverpod) return;
    developer.log('🟢 ADD [$provider]', name: _name);
  }

  static void riverpodUpdate(String provider, dynamic prev, dynamic next) {
    if (!LogConfig.enabled || !LogConfig.showRiverpod) return;

    final prevStatus = _extractStatus(prev);
    final nextStatus = _extractStatus(next);

    // Only log if status string changes or if it's not easily extractable
    if (prevStatus != nextStatus) {
      developer.log('🔄 UPDATE [$provider] $prevStatus → $nextStatus', name: _name);
    } else {
      // Optional: hide minor state changes or show them
      developer.log('🔄 UPDATE [$provider]', name: _name);
    }
  }

  static void riverpodDispose(String provider) {
    if (!LogConfig.enabled || !LogConfig.showRiverpod) return;
    developer.log('⚪ DISPOSE [$provider]', name: _name);
  }

  static void riverpodError(String provider, Object error, StackTrace stackTrace) {
    final buffer = StringBuffer();

    buffer.writeln('\n$_top');
    buffer.writeln('$_vertical ❌ RIVERPOD ERROR [$provider]');
    buffer.writeln(_middle);
    buffer.writeln('$_vertical ${error.toString()}');

    if (kDebugMode) {
      buffer.writeln(_section);
      buffer.writeln('$_vertical Stack Trace:');
      final lines = stackTrace.toString().split('\n').take(3);
      for (final line in lines) {
        buffer.writeln('$_vertical   $line');
      }
    }

    buffer.writeln(_bottom);
    developer.log(buffer.toString(), name: _name, level: _levelError);

    if (LogConfig.crashReporting) {
      _sendToCrashReporting('Riverpod Error: $provider', error, stackTrace);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📺 ADS TABLE LOG
  // ═══════════════════════════════════════════════════════════════

  /// Log thông tin ads dạng bảng — dễ quan sát trên console.
  /// [rows] là list cặp [label, value] hiển thị theo hàng.
  static void adTable(
    String title, {
    required List<(String, String)> rows,
    String? tag,
    bool isError = false,
  }) {
    if (!LogConfig.enabled) return;

    const colLabel = 22; // độ rộng cột label
    const colValue = 50; // độ rộng cột value
    const totalWidth = colLabel + colValue + 3; // 3 = '│ ' + ' │' giữa + ' │'

    final hr = '├${'─' * (colLabel + 2)}┼${'─' * (colValue + 2)}┤';
    final top = '┌${'─' * (colLabel + 2)}┬${'─' * (colValue + 2)}┐';
    final bot = '└${'─' * (colLabel + 2)}┴${'─' * (colValue + 2)}┘';

    String cell(String text, int width) {
      if (text.length > width) return '${text.substring(0, width - 1)}…';
      return text.padRight(width);
    }

    final emoji = isError ? '❌' : '📺';
    final tagStr = tag != null ? ' [$tag]' : '';
    final buffer = StringBuffer('\n');

    buffer.writeln(top);

    // Title row (full-width)
    final titleLine = ' $emoji ADS$tagStr │ $title';
    buffer.writeln('│ ${cell(titleLine, totalWidth + 1)}│');
    buffer.writeln(hr);

    // Header
    buffer.writeln('│ ${'FIELD'.padRight(colLabel)} │ ${'VALUE'.padRight(colValue)} │');
    buffer.writeln(hr);

    // Data rows
    for (final (label, value) in rows) {
      buffer.writeln('│ ${cell(label, colLabel)} │ ${cell(value, colValue)} │');
    }

    buffer.writeln(bot);
    developer.log(buffer.toString(), name: _name, level: isError ? 900 : 0);
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  static String _formatBody(dynamic data) {
    if (data == null) return 'null';

    final masked = _maskRecursive(data);
    if (masked is Map) {
      return masked.entries.map((e) => '${e.key}: ${e.value}').join('\n');
    }
    return _truncate(masked.toString());
  }

  static String _formatJson(dynamic data) {
    if (data == null) return 'null';

    try {
      final masked = _maskRecursive(data);
      final json = const JsonEncoder.withIndent('  ').convert(masked);
      return _truncate(json);
    } catch (_) {
      return _truncate(data.toString());
    }
  }

  /// Recursive mask — đi sâu vào Map/List để không bỏ sót nested token.
  /// Vd: `{"data": {"access_token": "..."}}` → access_token vẫn bị mask.
  static dynamic _maskRecursive(dynamic value) {
    if (!LogConfig.maskSensitive) return value;

    if (value is Map) {
      return value.map((k, v) {
        final keyStr = k.toString().toLowerCase();
        final isSensitive = LogConfig.sensitiveFields.any(
          (field) => keyStr.contains(field),
        );
        return MapEntry(k, isSensitive ? '******' : _maskRecursive(v));
      });
    }
    if (value is List) {
      return value.map(_maskRecursive).toList();
    }
    return value;
  }

  static String _extractStatus(dynamic state) {
    if (state == null) return 'null';

    final str = state.toString();
    
    // Support Riverpod AsyncValue natively
    if (str.startsWith('AsyncData')) return 'AsyncData';
    if (str.startsWith('AsyncLoading')) return 'AsyncLoading';
    if (str.startsWith('AsyncError')) return 'AsyncError';

    // Support Freezed or manual states if they have a status field
    final match = RegExp(r'status:\s*(\w+)').firstMatch(str);

    return match?.group(1) ?? state.runtimeType.toString();
  }

  static String _truncate(String text) {
    if (text.length <= _maxLength) return text;
    return '${text.substring(0, _maxLength)}...';
  }

  /// Gửi error lên Crashlytics — wrap try/catch vì có thể được gọi
  /// TRƯỚC khi `Firebase.initializeApp()` hoàn tất (vd. lỗi early boot).
  /// Crashlytics throw → KHÔNG được throw ngược lại làm Logger crash.
  static void _sendToCrashReporting(
    String message,
    Object? error,
    StackTrace? stackTrace,
  ) {
    try {
      FirebaseCrashlytics.instance.log('[Logger] $message');
      FirebaseCrashlytics.instance.recordError(
        error ?? Exception(message),
        stackTrace,
        reason: message,
        fatal: false,
      );
    } catch (_) {
      // Best-effort — never propagate.
    }
  }
}
