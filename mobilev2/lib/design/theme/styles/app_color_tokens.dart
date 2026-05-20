import 'package:flutter/material.dart';

@immutable
class AppColorTokens {
  const AppColorTokens({
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.surface,
    required this.onSurface,
    required this.surfaceVariant,
    required this.background,
    required this.onBackground,
    required this.error,
    required this.onError,
    required this.success,
    required this.warning,
    required this.info,
    required this.outline,
    required this.shadow,
    required this.textPrimary,
    required this.textSecondary,
    required this.textTertiary,
    required this.divider,
    required this.disabled,
    required this.red,
    required this.green,
  });

  factory AppColorTokens.light() => const AppColorTokens(
        primary: Color(0xFF6750A4),
        onPrimary: Color(0xFFFFFFFF),
        secondary: Color(0xFF625B71),
        onSecondary: Color(0xFFFFFFFF),
        surface: Color(0xFFFFFBFE),
        onSurface: Color(0xFF1C1B1F),
        surfaceVariant: Color(0xFFE7E0EC),
        background: Color(0xFFFFFBFE),
        onBackground: Color(0xFF1C1B1F),
        error: Color(0xFFB3261E),
        onError: Color(0xFFFFFFFF),
        success: Color(0xFF1B873F),
        warning: Color(0xFFD97706),
        info: Color(0xFF2563EB),
        outline: Color(0xFF79747E),
        shadow: Color(0xFF000000),
        textPrimary: Color(0xFF1C1B1F),
        textSecondary: Color(0xFF49454F),
        textTertiary: Color(0xFF79747E),
        divider: Color(0xFFE7E0EC),
        disabled: Color(0xFFC4C7C5),
        red: Color(0xFFDC2626),
        green: Color(0xFF16A34A),
      );

  /// 🌹 Red theme — primary đỏ, nền hồng nhạt
  factory AppColorTokens.red() => const AppColorTokens(
        primary: Color(0xFFDC2626),
        onPrimary: Color(0xFFFFFFFF),
        secondary: Color(0xFFFB7185),
        onSecondary: Color(0xFFFFFFFF),
        surface: Color(0xFFFFFFFF),
        onSurface: Color(0xFF1C1B1F),
        surfaceVariant: Color(0xFFFFE4E6),
        background: Color(0xFFFEF2F2),
        onBackground: Color(0xFF1C1B1F),
        error: Color(0xFF991B1B),
        onError: Color(0xFFFFFFFF),
        success: Color(0xFF16A34A),
        warning: Color(0xFFD97706),
        info: Color(0xFF2563EB),
        outline: Color(0xFFFCA5A5),
        shadow: Color(0xFF000000),
        textPrimary: Color(0xFF1C1B1F),
        textSecondary: Color(0xFF49454F),
        textTertiary: Color(0xFF9F1239),
        divider: Color(0xFFFECDD3),
        disabled: Color(0xFFC4C7C5),
        red: Color(0xFFDC2626),
        green: Color(0xFF16A34A),
      );

  /// 🌿 Green theme — primary xanh, nền xanh nhạt
  factory AppColorTokens.green() => const AppColorTokens(
        primary: Color(0xFF059669),
        onPrimary: Color(0xFFFFFFFF),
        secondary: Color(0xFF34D399),
        onSecondary: Color(0xFFFFFFFF),
        surface: Color(0xFFFFFFFF),
        onSurface: Color(0xFF1C1B1F),
        surfaceVariant: Color(0xFFD1FAE5),
        background: Color(0xFFECFDF5),
        onBackground: Color(0xFF1C1B1F),
        error: Color(0xFFB3261E),
        onError: Color(0xFFFFFFFF),
        success: Color(0xFF065F46),
        warning: Color(0xFFD97706),
        info: Color(0xFF2563EB),
        outline: Color(0xFF6EE7B7),
        shadow: Color(0xFF000000),
        textPrimary: Color(0xFF1C1B1F),
        textSecondary: Color(0xFF49454F),
        textTertiary: Color(0xFF047857),
        divider: Color(0xFFA7F3D0),
        disabled: Color(0xFFC4C7C5),
        red: Color(0xFFDC2626),
        green: Color(0xFF059669),
      );

  factory AppColorTokens.dark() => const AppColorTokens(
        primary: Color(0xFFD0BCFF),
        onPrimary: Color(0xFF381E72),
        secondary: Color(0xFFCCC2DC),
        onSecondary: Color(0xFF332D41),
        surface: Color(0xFF1C1B1F),
        onSurface: Color(0xFFE6E1E5),
        surfaceVariant: Color(0xFF49454F),
        background: Color(0xFF0B0B0F),
        onBackground: Color(0xFFE6E1E5),
        error: Color(0xFFF2B8B5),
        onError: Color(0xFF601410),
        success: Color(0xFF4ADE80),
        warning: Color(0xFFFBBF24),
        info: Color(0xFF60A5FA),
        outline: Color(0xFF938F99),
        shadow: Color(0xFF000000),
        textPrimary: Color(0xFFE6E1E5),
        textSecondary: Color(0xFFCAC4D0),
        textTertiary: Color(0xFF938F99),
        divider: Color(0xFF49454F),
        disabled: Color(0xFF4A4458),
        red: Color(0xFFF87171),
        green: Color(0xFF4ADE80),
      );

  final Color primary;
  final Color onPrimary;
  final Color secondary;
  final Color onSecondary;
  final Color surface;
  final Color onSurface;
  final Color surfaceVariant;
  final Color background;
  final Color onBackground;
  final Color error;
  final Color onError;
  final Color success;
  final Color warning;
  final Color info;
  final Color outline;
  final Color shadow;
  final Color textPrimary;
  final Color textSecondary;
  final Color textTertiary;
  final Color divider;
  final Color disabled;
  final Color red;
  final Color green;

  ColorScheme toColorScheme(Brightness brightness) => ColorScheme(
        brightness: brightness,
        primary: primary,
        onPrimary: onPrimary,
        secondary: secondary,
        onSecondary: onSecondary,
        error: error,
        onError: onError,
        surface: surface,
        onSurface: onSurface,
        outline: outline,
        shadow: shadow,
      );
}
