import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Placeholder visual cho camera scanner. Khi gắn thật, swap bằng
/// `mobile_scanner` hoặc `qr_code_scanner` plugin.
class QrScannerPlaceholder extends StatefulWidget {
  const QrScannerPlaceholder({super.key});

  @override
  State<QrScannerPlaceholder> createState() => _QrScannerPlaceholderState();
}

class _QrScannerPlaceholderState extends State<QrScannerPlaceholder>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 2),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(20),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Camera "live" gradient
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    Colors.grey.shade800,
                    Colors.black,
                  ],
                ),
              ),
            ),
            // Frame brackets
            Padding(
              padding: const EdgeInsets.all(40),
              child: Stack(
                children: [
                  Align(alignment: Alignment.topLeft, child: _corner(top: true, left: true)),
                  Align(alignment: Alignment.topRight, child: _corner(top: true, right: true)),
                  Align(alignment: Alignment.bottomLeft, child: _corner(bottom: true, left: true)),
                  Align(alignment: Alignment.bottomRight, child: _corner(bottom: true, right: true)),

                  // Scan line
                  AnimatedBuilder(
                    animation: _ctrl,
                    builder: (_, __) => Positioned(
                      left: 0,
                      right: 0,
                      top: _ctrl.value * (MediaQuery.of(context).size.width - 80),
                      child: Container(
                        height: 2,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [
                            AppColors.primary.withValues(alpha: 0),
                            AppColors.primary,
                            AppColors.primary.withValues(alpha: 0),
                          ]),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.7),
                              blurRadius: 12,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _corner({bool top = false, bool bottom = false, bool left = false, bool right = false}) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        border: Border(
          top: top ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
          bottom: bottom ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
          left: left ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
          right: right ? const BorderSide(color: Colors.white, width: 4) : BorderSide.none,
        ),
      ),
    );
  }
}
