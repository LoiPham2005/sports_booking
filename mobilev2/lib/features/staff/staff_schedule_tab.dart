import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/status_badge.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffScheduleTab extends ConsumerStatefulWidget {
  const StaffScheduleTab({super.key});

  @override
  ConsumerState<StaffScheduleTab> createState() => _StaffScheduleTabState();
}

class _StaffScheduleTabState extends ConsumerState<StaffScheduleTab> {
  DateTime _date = DateTime.now();

  static const _hourStart = 6;
  static const _hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00',
  ];

  String _yyyymmdd(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-'
      '${d.month.toString().padLeft(2, '0')}-'
      '${d.day.toString().padLeft(2, '0')}';

  /// Tìm booking phủ giờ `hour` (6..21) trong list bookings của ngày được chọn.
  Booking? _bookingAt(List<Booking> all, int hour) {
    final slotStart = DateTime(_date.year, _date.month, _date.day, hour);
    final slotEnd = slotStart.add(const Duration(hours: 1));
    for (final b in all) {
      if (b.status == BookingStatus.cancelled) continue;
      if (b.startsAt.isBefore(slotEnd) && b.endsAt.isAfter(slotStart)) {
        return b;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final bookings = ref
            .watch(staffScheduleProvider(date: _yyyymmdd(_date)))
            .value ??
        const <Booking>[];
    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Text('Lịch sân',
                    style: Theme.of(context).textTheme.headlineSmall),
              ],
            ),
          ),

          // Day strip
          SizedBox(
            height: 70,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: 14,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final day = DateTime.now().add(Duration(days: i));
                final selected = day.day == _date.day && day.month == _date.month;
                const dows = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                return InkWell(
                  onTap: () => setState(() => _date = day),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 56,
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: selected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(dows[(day.weekday - 1) % 7],
                            style: TextStyle(
                                fontSize: 11,
                                color: selected
                                    ? Colors.white70
                                    : AppColors.textMuted)),
                        Text('${day.day}',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: selected ? Colors.white : null)),
                        Text(_monthShort(day.month),
                            style: TextStyle(
                                fontSize: 9,
                                color: selected
                                    ? Colors.white70
                                    : AppColors.textMuted)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Hour list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              itemCount: _hours.length,
              itemBuilder: (_, i) {
                final hour = _hours[i];
                final b = _bookingAt(bookings, _hourStart + i);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: InkWell(
                    onTap: b != null
                        ? () => context
                            .push(RoutePaths.staffBookingDetail(b.id))
                        : null,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: b != null
                            ? AppColors.primary.withValues(alpha: 0.08)
                            : AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: b != null
                              ? AppColors.primary.withValues(alpha: 0.3)
                              : AppColors.border,
                        ),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 50,
                            child: Text(hour,
                                style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13)),
                          ),
                          if (b != null) ...[
                            const Icon(Icons.check_circle,
                                color: AppColors.primary, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text('#${b.code}',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13)),
                                  Text(
                                    b.courtName,
                                    style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            StatusBadge(status: b.status),
                          ] else
                            const Expanded(
                              child: Text('Còn trống',
                                  style: TextStyle(
                                      color: AppColors.textMuted, fontSize: 13)),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _monthShort(int m) => 'Th$m';
}
