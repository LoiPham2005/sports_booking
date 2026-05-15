import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class RevenueSparkline extends StatelessWidget {
  final List<int> data;
  final double height;
  const RevenueSparkline({
    super.key,
    required this.data,
    this.height = 80,
  });

  @override
  Widget build(BuildContext context) {
    final maxValue = data.reduce((a, b) => a > b ? a : b).toDouble();
    return SizedBox(
      height: height,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(data.length, (i) {
          final ratio = maxValue == 0 ? 0.0 : data[i] / maxValue;
          final isLast = i == data.length - 1;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: Container(
                height: (height - 4) * ratio.clamp(0.05, 1.0),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: isLast
                        ? [AppColors.primary, AppColors.primaryDark]
                        : [
                            AppColors.primary.withValues(alpha: 0.55),
                            AppColors.primary.withValues(alpha: 0.25),
                          ],
                  ),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
