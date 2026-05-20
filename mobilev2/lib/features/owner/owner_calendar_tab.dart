import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import 'owner_core/presentation/providers/owner_bookings_notifier.dart';

class OwnerCalendarTab extends ConsumerStatefulWidget {
  const OwnerCalendarTab({super.key});

  @override
  ConsumerState<OwnerCalendarTab> createState() => _OwnerCalendarTabState();
}

class _OwnerCalendarTabState extends ConsumerState<OwnerCalendarTab> {
  DateTime _weekStart = _mondayOf(DateTime.now());
  int _selectedDay = DateTime.now().weekday - 1; // 0..6
  String _courtFilter = 'all';

  static const _hourStart = 6; // 06:00
  static const _hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00',
  ];

  static DateTime _mondayOf(DateTime d) =>
      DateTime(d.year, d.month, d.day).subtract(Duration(days: d.weekday - 1));

  List<DateTime> get _week =>
      List.generate(7, (i) => _weekStart.add(Duration(days: i)));

  String _yyyymmdd(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-'
      '${d.month.toString().padLeft(2, '0')}-'
      '${d.day.toString().padLeft(2, '0')}';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _reloadDay());
  }

  void _reloadDay() {
    final date = _yyyymmdd(_week[_selectedDay]);
    ref.read(ownerBookingsProvider.notifier).apply(
          OwnerBookingsFilter(date: date),
        );
  }

  void _pickDay(int i) {
    setState(() => _selectedDay = i);
    _reloadDay();
  }

  void _pickWeek(DateTime newStart) {
    setState(() => _weekStart = newStart);
    _reloadDay();
  }

  /// Tìm booking phủ giờ `hour` (6..21) trong list — áp dụng courtFilter (name match).
  Booking? _bookingAt(List<Booking> all, int hour) {
    final day = _week[_selectedDay];
    final slotStart = DateTime(day.year, day.month, day.day, hour);
    final slotEnd = slotStart.add(const Duration(hours: 1));
    for (final b in all) {
      if (b.status == BookingStatus.cancelled) continue;
      if (_courtFilter != 'all' &&
          !b.courtName.toLowerCase().contains(_courtFilter.toLowerCase())) {
        continue;
      }
      if (b.startsAt.isBefore(slotEnd) && b.endsAt.isAfter(slotStart)) {
        return b;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final bookings =
        ref.watch(ownerBookingsProvider).value ?? const <Booking>[];
    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                Text('Lịch sân',
                    style: Theme.of(context).textTheme.headlineSmall),
                const Spacer(),
                _VenueFilterChip(
                  value: _courtFilter,
                  onChanged: (v) => setState(() => _courtFilter = v),
                ),
              ],
            ),
          ),

          // Week navigator
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: () => _pickWeek(
                      _weekStart.subtract(const Duration(days: 7))),
                ),
                Expanded(
                  child: Center(
                    child: Text(
                      '${_week.first.day}/${_week.first.month} – ${_week.last.day}/${_week.last.month}',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () =>
                      _pickWeek(_weekStart.add(const Duration(days: 7))),
                ),
              ],
            ),
          ),

          // Day strip
          SizedBox(
            height: 64,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: 7,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final d = _week[i];
                final selected = i == _selectedDay;
                const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                return InkWell(
                  onTap: () => _pickDay(i),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 52,
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
                        Text(labels[i],
                            style: TextStyle(
                                fontSize: 11,
                                color: selected
                                    ? Colors.white70
                                    : AppColors.textMuted)),
                        Text('${d.day}',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: selected ? Colors.white : null)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Legend
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: const [
                _LegendDot(color: AppColors.primary, label: 'Đã xác nhận'),
                SizedBox(width: 12),
                _LegendDot(color: Color(0xFFFCD34D), label: 'Chờ TT'),
                SizedBox(width: 12),
                _LegendDot(color: Color(0xFFE2E8F0), label: 'Còn trống'),
              ],
            ),
          ),

          // Slot grid for selected day
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              itemCount: _hours.length,
              itemBuilder: (_, i) {
                final hour = _hours[i];
                final b = _bookingAt(bookings, _hourStart + i);
                final pending = b?.status == BookingStatus.pendingPayment;
                final booked = b != null && !pending;

                Color bg = AppColors.surfaceAlt;
                Color border = AppColors.border;
                Color fg = AppColors.textPrimary;
                String label = 'Còn trống';
                IconData? icon;

                if (pending) {
                  bg = const Color(0xFFFEF3C7);
                  border = const Color(0xFFFCD34D);
                  fg = const Color(0xFFB45309);
                  label = 'Chờ TT · ${b!.code}';
                  icon = Icons.hourglass_top;
                } else if (booked) {
                  bg = AppColors.primary.withValues(alpha: 0.1);
                  border = AppColors.primary.withValues(alpha: 0.4);
                  fg = AppColors.primary;
                  label = '${b.courtName} · ${b.code}';
                  icon = Icons.check_circle;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: InkWell(
                    onTap: b != null
                        ? () => context
                            .push(RoutePaths.ownerBookingDetail(b.id))
                        : null,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: border),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 50,
                            child: Text(hour,
                                style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13)),
                          ),
                          if (icon != null)
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Icon(icon, size: 14, color: fg),
                            ),
                          Expanded(
                            child: Text(label,
                                style: TextStyle(
                                    color: fg,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13)),
                          ),
                          if (b != null)
                            Text('${b.total ~/ 1000}k',
                                style: TextStyle(
                                    color: fg,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13)),
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
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _VenueFilterChip extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;
  const _VenueFilterChip({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (_) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                height: 4,
                width: 40,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 8),
              for (final opt in const [
                ('all', 'Tất cả sân'),
                ('c1', 'Sân 1'),
                ('c2', 'Sân 2'),
                ('c3', 'Sân VIP'),
              ])
                ListTile(
                  title: Text(opt.$2),
                  trailing: value == opt.$1
                      ? const Icon(Icons.check, color: AppColors.primary)
                      : null,
                  onTap: () {
                    onChanged(opt.$1);
                    Navigator.pop(context);
                  },
                ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.filter_list, size: 14, color: AppColors.textSecondary),
            const SizedBox(width: 4),
            Text(
              value == 'all' ? 'Mọi sân' : value.toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
