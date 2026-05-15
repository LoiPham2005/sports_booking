import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/theme/app_colors.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Thông báo'),
        actions: [
          TextButton(onPressed: () {}, child: const Text('Đánh dấu đã đọc')),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: MockData.notifications.length,
        separatorBuilder: (_, __) => const Divider(height: 1, indent: 70),
        itemBuilder: (_, i) => _Tile(item: MockData.notifications[i]),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final NotificationItem item;
  const _Tile({required this.item});

  (IconData, Color) _iconFor() {
    return switch (item.type) {
      'payment_success' => (Icons.check_circle_outline, AppColors.success),
      'promo' => (Icons.local_offer_outlined, AppColors.accent),
      'reminder' => (Icons.alarm, AppColors.info),
      'review' => (Icons.star_outline, AppColors.warning),
      _ => (Icons.notifications_outlined, AppColors.textSecondary),
    };
  }

  String _agoText(DateTime t) {
    final diff = DateTime.now().difference(t);
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút';
    if (diff.inHours < 24) return '${diff.inHours} giờ';
    return '${diff.inDays} ngày';
  }

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _iconFor();
    return InkWell(
      onTap: () {},
      child: Container(
        color: item.read ? null : AppColors.primary.withValues(alpha: 0.04),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontWeight: item.read ? FontWeight.w600 : FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Text('${_agoText(item.time)} trước',
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(item.body,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 13, height: 1.4)),
                ],
              ),
            ),
            if (!item.read) ...[
              const SizedBox(width: 8),
              Container(
                margin: const EdgeInsets.only(top: 6),
                height: 8,
                width: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
