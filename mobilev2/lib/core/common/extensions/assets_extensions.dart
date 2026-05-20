// ════════════════════════════════════════════════════════════════
// SVG / IMAGE / LOTTIE — extensions trên String path asset.
//
// Cách dùng:
//   'assets/icons/logo.svg'.toSvg(width: 24, color: Colors.red)
//   'assets/images/banner.png'.toImage(fit: BoxFit.cover)
//   'assets/lottie/loading.json'.lottie(repeat: true)
//   'assets/any.svg_or_png'.toWidget()   // auto-detect
// ════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';

extension AssetPathX on String {
  /// `true` nếu path kết thúc bằng `.svg`.
  bool get isSvg => toLowerCase().endsWith('.svg');

  /// `true` nếu là image raster (`png`, `jpg`, `jpeg`, `gif`, `webp`).
  bool get isImage {
    final lower = toLowerCase();
    return lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.webp');
  }

  /// `true` nếu là Lottie JSON (`.json`).
  bool get isLottie => toLowerCase().endsWith('.json');

  /// Load SVG asset với optional tint color.
  Widget toSvg({
    double? height,
    double? width,
    Color? color,
    BoxFit fit = BoxFit.contain,
    BlendMode blendMode = BlendMode.srcIn,
  }) {
    return SvgPicture.asset(
      this,
      height: height,
      width: width,
      fit: fit,
      colorFilter:
          color != null ? ColorFilter.mode(color, blendMode) : null,
    );
  }

  /// Load raster image asset.
  Widget toImage({
    double? height,
    double? width,
    Color? color,
    BoxFit fit = BoxFit.cover,
  }) {
    return Image.asset(
      this,
      height: height,
      width: width,
      fit: fit,
      color: color,
    );
  }

  /// Auto-detect SVG hoặc raster → load tương ứng.
  Widget toWidget({
    double? height,
    double? width,
    Color? color,
    BoxFit fit = BoxFit.contain,
  }) =>
      isSvg
          ? toSvg(height: height, width: width, color: color, fit: fit)
          : toImage(height: height, width: width, color: color, fit: fit);

  /// Load Lottie animation từ asset.
  Widget lottie({
    double? width,
    double? height,
    BoxFit fit = BoxFit.contain,
    bool animate = true,
    bool repeat = true,
    bool reverse = false,
    VoidCallback? onLoaded,
  }) {
    return Lottie.asset(
      this,
      width: width,
      height: height,
      fit: fit,
      animate: animate,
      repeat: repeat,
      reverse: reverse,
      onLoaded: (_) => onLoaded?.call(),
    );
  }
}
