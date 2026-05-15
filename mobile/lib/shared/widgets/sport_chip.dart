import 'package:flutter/material.dart';
import '../mock/mock_data.dart';
import '../theme/app_colors.dart';

class SportChip extends StatelessWidget {
  final Sport sport;
  final VoidCallback? onTap;
  const SportChip({super.key, required this.sport, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 88,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.accent.withValues(alpha: 0.08),
                  ],
                ),
              ),
              alignment: Alignment.center,
              child: Text(sport.icon, style: const TextStyle(fontSize: 24)),
            ),
            const SizedBox(height: 8),
            Text(
              sport.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
            ),
            Text(
              '${sport.count} sân',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
