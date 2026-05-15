import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/status_badge.dart';

class StaffScheduleTab extends StatefulWidget {
  const StaffScheduleTab({super.key});

  @override
  State<StaffScheduleTab> createState() => _StaffScheduleTabState();
}

class _StaffScheduleTabState extends State<StaffScheduleTab> {
  DateTime _date = DateTime.now();

  static const _hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00',
  ];

  bool _hasBooking(int hour) {
    return hour == 1 || hour == 2 || hour == 10 || hour == 12 || hour == 13;
  }

  String _customerFor(int hour) {
    const names = ['Trần Minh', 'Saigon FC', 'Lê Hà', 'Pickleball Group'];
    return names[hour % names.length];
  }

  @override
  Widget build(BuildContext context) {
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
                final hasBooking = _hasBooking(i);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: InkWell(
                    onTap: hasBooking
                        ? () => context.push(RoutePaths.staffBookingDetail('t3'))
                        : null,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: hasBooking
                            ? AppColors.primary.withValues(alpha: 0.08)
                            : AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: hasBooking
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
                          if (hasBooking) ...[
                            const Icon(Icons.check_circle,
                                color: AppColors.primary, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(_customerFor(i),
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13)),
                                  Text(
                                    'Sân ${(i % 3) + 1}',
                                    style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            const StatusBadge(status: BookingStatus.confirmed),
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
