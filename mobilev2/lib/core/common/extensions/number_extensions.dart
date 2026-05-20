// ════════════════════════════════════════════════════════════════
// Number extensions — Duration constructors, currency, percentage.
//
// Skip từ v1: `.times()`, `.to()`, `.height/.width` (SizedBox helper),
// `.paddingAll`, `.radius` — đã có `AppDimensions` xử lý spacing chuẩn.
// ════════════════════════════════════════════════════════════════

import 'package:intl/intl.dart';

extension DurationX on num {
  /// `3.milliseconds` → `Duration(milliseconds: 3)`.
  Duration get milliseconds => Duration(milliseconds: toInt());

  /// `5.seconds` → `Duration(seconds: 5)`.
  Duration get seconds => Duration(seconds: toInt());

  /// `2.minutes` → `Duration(minutes: 2)`.
  Duration get minutes => Duration(minutes: toInt());

  /// `1.hours` → `Duration(hours: 1)`.
  Duration get hours => Duration(hours: toInt());

  /// `7.days` → `Duration(days: 7)`.
  Duration get days => Duration(days: toInt());
}

extension NumberFormatX on num {
  /// Format số sang chuỗi tiền VNĐ.
  /// ```dart
  /// 1234567.toCurrency() → '1.234.567 ₫'
  /// 50000.toCurrency(symbol: '\$', locale: 'en_US') → '$50,000'
  /// ```
  String toCurrency({String locale = 'vi_VN', String symbol = '₫'}) {
    final fmt = NumberFormat.currency(
      locale: locale,
      symbol: symbol,
      decimalDigits: 0,
    );
    return fmt.format(this);
  }

  /// Format ratio (0..1) sang phần trăm string.
  /// ```dart
  /// 0.456.toPercentage() → '45.6%'
  /// 0.456.toPercentage(decimals: 0) → '46%'
  /// ```
  String toPercentage({int decimals = 1}) =>
      '${(this * 100).toStringAsFixed(decimals)}%';

  /// Round to N decimal places.
  /// ```dart
  /// 3.14159.roundTo(2) → 3.14
  /// ```
  double roundTo(int decimals) {
    final factor = _pow10(decimals);
    return (this * factor).round() / factor;
  }

  static double _pow10(int n) {
    var result = 1.0;
    for (var i = 0; i < n; i++) {
      result *= 10;
    }
    return result;
  }
}
