import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../notifications/presentation/providers/notifications_notifier.dart';

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncList = ref.watch(notificationsProvider);
    final notifier = ref.read(notificationsProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Thông báo'),
        actions: [
          TextButton(
            onPressed: () => notifier.markAllRead(),
            child: const Text('Đánh dấu đã đọc'),
          ),
        ],
      ),
      body: asyncList.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Lỗi: $e',
                style: const TextStyle(color: AppColors.danger)),
          ),
        ),
        data: (list) {
          if (list.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('Chưa có thông báo nào',
                    style: TextStyle(color: AppColors.textSecondary)),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: list.length,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 70),
            itemBuilder: (_, i) => _Tile(
              item: list[i],
              onTap: () => notifier.markRead(list[i].id),
            ),
          );
        },
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final NotificationItem item;
  final VoidCallback onTap;
  const _Tile({required this.item, required this.onTap});

  (IconData, Color) _iconFor() => switch (item.type) {
        'payment_success' => (Icons.check_circle_outline, AppColors.success),
        'promo' => (Icons.local_offer_outlined, AppColors.accent),
        'reminder' => (Icons.alarm, AppColors.info),
        'review' => (Icons.star_outline, AppColors.warning),
        _ => (Icons.notifications_outlined, AppColors.textSecondary),
      };

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
      onTap: onTap,
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
                            fontWeight: item.read
                                ? FontWeight.w600
                                : FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Text('${_agoText(item.createdAt)} trước',
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(item.body,
                      style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                          height: 1.4)),
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
