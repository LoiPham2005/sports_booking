import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sports_booking_mobile/core/common/extensions/context_extensions.dart';

/// Custom screen thay thế `ErrorWidget.builder` mặc định của Flutter:
/// - Default Flutter debug: red box đầy stack trace
/// - Default Flutter release: grey box trống — xấu
///
/// Component này:
/// - **Debug**: hiện exception + location file (để dev debug nhanh)
/// - **Release**: hiện message generic + nút "Quay về trang chủ"
///
/// Lưu ý: `ErrorWidget.builder` có thể được gọi ở vị trí KHÔNG có Theme
/// (vd. lỗi build MaterialApp). Dùng `Theme.maybeOf` + fallback safe color.
class AppErrorScreen extends StatelessWidget {
  const AppErrorScreen({
    super.key,
    required this.details,
    this.location,
  });

  final FlutterErrorDetails details;
  final String? location;

  static const _fallbackBg = Color(0xFFF9FAFB);
  static const _fallbackSurface = Colors.white;
  static const _fallbackError = Color(0xFFB91C1C);
  static const _fallbackErrorBg = Color(0xFFFEE2E2);
  static const _fallbackTextPrimary = Color(0xFF1F2937);
  static const _fallbackTextSecondary = Color(0xFF6B7280);

  @override
  Widget build(BuildContext context) {
    // Theme có thể không tồn tại nếu lỗi xảy ra trước MaterialApp build xong.
    // Theme.of throw nếu không có ancestor — wrap try để fallback default.
    ThemeData? theme;
    try {
      theme = Theme.of(context);
    } catch (_) {
      theme = null;
    }
    final colors = theme?.colorScheme;

    final bg = colors?.surfaceContainerLowest ?? _fallbackBg;
    final surface = colors?.surface ?? _fallbackSurface;
    final errorColor = colors?.error ?? _fallbackError;
    final errorBg =
        colors?.errorContainer ?? _fallbackErrorBg;
    final textPrimary = colors?.onSurface ?? _fallbackTextPrimary;
    final textSecondary = colors?.onSurfaceVariant ?? _fallbackTextSecondary;

    return Material(
      color: bg,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _Card(
                surface: surface,
                errorColor: errorColor,
                errorBg: errorBg,
                textPrimary: textPrimary,
                textSecondary: textSecondary,
                details: details,
                location: location,
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () => _restart(context),
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Quay về trang chủ'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors?.primary ?? const Color(0xFF374151),
                  foregroundColor: colors?.onPrimary ?? Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _restart(BuildContext context) {
    // Thử navigate về root thay vì pop — pop có thể đẩy về 1 page khác cũng broken.
    try {
      appContext.go('/');
    } catch (_) {
      if (Navigator.of(context).canPop()) Navigator.of(context).pop();
    }
  }
}

class _Card extends StatelessWidget {
  const _Card({
    required this.surface,
    required this.errorColor,
    required this.errorBg,
    required this.textPrimary,
    required this.textSecondary,
    required this.details,
    required this.location,
  });

  final Color surface;
  final Color errorColor;
  final Color errorBg;
  final Color textPrimary;
  final Color textSecondary;
  final FlutterErrorDetails details;
  final String? location;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: errorColor.withValues(alpha: 0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: errorBg,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(11),
              ),
            ),
            child: Text(
              kDebugMode ? '❌ FLUTTER ERROR' : '⚠️ ĐÃ CÓ LỖI XẢY RA',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: errorColor,
                fontWeight: FontWeight.w900,
                fontSize: 13,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: kDebugMode
                ? _DebugBody(
                    details: details,
                    location: location,
                    textPrimary: textPrimary,
                    textSecondary: textSecondary,
                  )
                : _ReleaseBody(textSecondary: textSecondary),
          ),
        ],
      ),
    );
  }
}

class _DebugBody extends StatelessWidget {
  const _DebugBody({
    required this.details,
    required this.location,
    required this.textPrimary,
    required this.textSecondary,
  });

  final FlutterErrorDetails details;
  final String? location;
  final Color textPrimary;
  final Color textSecondary;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Framework caught an error:',
          style: TextStyle(
            fontSize: 12,
            color: textSecondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          details.exception.toString(),
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
        ),
        if (location != null) ...[
          const SizedBox(height: 16),
          Divider(height: 1, color: textSecondary.withValues(alpha: 0.2)),
          const SizedBox(height: 12),
          Text(
            'Location:',
            style: TextStyle(
              fontSize: 11,
              color: textSecondary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          SelectableText(
            location!,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF0369A1),
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ],
    );
  }
}

class _ReleaseBody extends StatelessWidget {
  const _ReleaseBody({required this.textSecondary});

  final Color textSecondary;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text(
        'Một sự cố không mong muốn đã xảy ra.\n'
        'Vui lòng thử lại hoặc quay về trang chủ.',
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 14, color: textSecondary, height: 1.5),
      ),
    );
  }
}
