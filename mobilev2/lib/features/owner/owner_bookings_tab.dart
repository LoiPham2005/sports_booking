import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/status_badge.dart';
import 'owner_core/presentation/providers/owner_bookings_notifier.dart';

class OwnerBookingsTab extends ConsumerStatefulWidget {
  const OwnerBookingsTab({super.key});

  @override
  ConsumerState<OwnerBookingsTab> createState() => _OwnerBookingsTabState();
}

class _OwnerBookingsTabState extends ConsumerState<OwnerBookingsTab> {
  String _filter = 'all';

  static const _filters = [
    ('all', 'Tất cả'),
    ('pending', 'Chờ TT'),
    ('confirmed', 'Đã xác nhận'),
    ('completed', 'Hoàn thành'),
    ('cancelled', 'Đã huỷ'),
  ];

  /// Map UI filter chip → BookingStatus DB string (cho query API).
  /// 'all' / 'cancelled' (multi-value) → null + filter client-side.
  String? _statusForApi() => switch (_filter) {
        'pending' => 'PENDING_PAYMENT',
        'confirmed' => 'CONFIRMED',
        'completed' => 'COMPLETED',
        _ => null,
      };

  List<Booking> _filterClient(List<Booking> list) {
    if (_filter == 'cancelled') {
      return list.where((b) => b.status == BookingStatus.cancelled).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final asyncList = ref.watch(ownerBookingsProvider);
    final rawItems = asyncList.value ?? const <Booking>[];
    final items = _filterClient(rawItems);
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                Text('Booking', style: Theme.of(context).textTheme.headlineSmall),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Tìm theo mã booking, tên khách...',
                  prefixIcon: Icon(Icons.search, size: 20),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                ),
              ),
            ),
          ),

          // Filter chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final f = _filters[i];
                final active = _filter == f.$1;
                return InkWell(
                  onTap: () {
                    setState(() => _filter = f.$1);
                    ref.read(ownerBookingsProvider.notifier).apply(
                          OwnerBookingsFilter(status: _statusForApi()),
                        );
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: active ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: active ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(
                      f.$2,
                      style: TextStyle(
                        color: active ? Colors.white : AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // List
          Expanded(
            child: items.isEmpty
                ? _Empty(label: _filter)
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) => _Tile(booking: items[i]),
                  ),
          ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final Booking booking;
  const _Tile({required this.booking});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(RoutePaths.ownerBookingDetail(booking.id)),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  '#${booking.code}',
                  style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: AppColors.textMuted),
                ),
                const SizedBox(width: 8),
                StatusBadge(status: booking.status),
                const Spacer(),
                Text(
                  formatVND(booking.total),
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w800,
                      fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor:
                      AppColors.primary.withValues(alpha: 0.15),
                  child: const Text('K',
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                          fontSize: 12)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Khách: Trần Minh',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 13)),
                      Text(
                        '${booking.courtName} · ${formatDateShort(booking.startsAt)} ${formatTime(booking.startsAt)}–${formatTime(booking.endsAt)}',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios,
                    size: 12, color: AppColors.textMuted),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  final String label;
  const _Empty({required this.label});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.inbox_outlined,
              size: 56, color: AppColors.textMuted),
          const SizedBox(height: 8),
          Text(
            'Không có booking nào ($label)',
            style: const TextStyle(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
