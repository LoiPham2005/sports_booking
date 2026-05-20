// ════════════════════════════════════════════════════════════════
// Widget chain extensions — minimal subset (~13 method).
//
// Triết lý: chỉ port method thật sự tiết kiệm code, bỏ những cái
// builtin đã đủ rõ ràng (vd. `Hero(tag:)` ngắn hơn `.hero(tag)`).
//
// Cách dùng:
//   Text('Hello')
//     .paddingAll(16.w)
//     .center()
//     .onTap(() {})
//
// ⚠️ Lưu ý: `.paddingAll(...)` trả về Padding non-const — nếu cần const
// (vd. ListView item rebuild nhiều), dùng `const Padding(...)` thẳng.
// ════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';

extension WidgetX on Widget {
  // ── Padding ──────────────────────────────────────────────────

  Widget paddingAll(double v) =>
      Padding(padding: EdgeInsets.all(v), child: this);

  Widget paddingSymmetric({double h = 0, double v = 0}) => Padding(
        padding: EdgeInsets.symmetric(horizontal: h, vertical: v),
        child: this,
      );

  Widget paddingOnly({
    double l = 0,
    double t = 0,
    double r = 0,
    double b = 0,
  }) =>
      Padding(
        padding: EdgeInsets.only(left: l, top: t, right: r, bottom: b),
        child: this,
      );

  // ── Alignment ────────────────────────────────────────────────

  Widget center() => Center(child: this);

  Widget align(Alignment alignment) =>
      Align(alignment: alignment, child: this);

  // ── Flex ─────────────────────────────────────────────────────

  Widget expanded({int flex = 1}) => Expanded(flex: flex, child: this);

  Widget flexible({int flex = 1, FlexFit fit = FlexFit.loose}) =>
      Flexible(flex: flex, fit: fit, child: this);

  // ── Gesture ──────────────────────────────────────────────────

  /// GestureDetector — không có ripple effect.
  Widget onTap(VoidCallback? onTap) =>
      GestureDetector(onTap: onTap, child: this);

  /// InkWell — có ripple effect (cần Material ancestor).
  Widget inkWell({
    VoidCallback? onTap,
    VoidCallback? onLongPress,
    BorderRadius? borderRadius,
  }) =>
      InkWell(
        onTap: onTap,
        onLongPress: onLongPress,
        borderRadius: borderRadius,
        child: this,
      );

  // ── Decoration ───────────────────────────────────────────────

  /// Clip với bo góc tròn.
  Widget rounded({double radius = 8}) => ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: this,
      );

  // ── Visibility ───────────────────────────────────────────────

  /// Show widget nếu `show=true`, ngược lại trả `SizedBox.shrink()`.
  Widget visible(bool show) => show ? this : const SizedBox.shrink();

  /// Opacity (0..1).
  Widget opacity(double value) => Opacity(opacity: value, child: this);
}
