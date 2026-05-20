import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/revenue_sparkline.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffRevenueTab extends ConsumerWidget {
  const StaffRevenueTab({super.key});

  static const _hourLabels = [
    '06', '07', '08', '09', '10', '11', '12', '13',
    '14', '15', '16', '17', '18', '19', '20', '21',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final revenue = ref.watch(staffRevenueProvider()).value;
    final memberships = ref.watch(staffMembershipsProvider).value ?? const [];
    final venueName = memberships.isNotEmpty
        ? memberships.first.venue.name
        : 'Sân bóng đá Phú Mỹ Hưng';

    final total = revenue?.revenue ?? 0;
    final bookings = revenue?.bookings ?? 0;
    final totalSlots = revenue?.totalSlots ?? 0;
    final occupancy =
        totalSlots > 0 ? ((bookings / totalSlots) * 100).round() : 0;

    // Map hour → total cho 16 cột (06..21).
    final byHourMap = <int, int>{};
    final byHourList = revenue?.byHour ?? const [];
    for (final h in byHourList) {
      byHourMap[h.hour] = h.total;
    }
    final hourly = List<int>.generate(16, (i) => byHourMap[6 + i] ?? 0);
    final hourlyMax = hourly.isEmpty
        ? 1
        : hourly.reduce((a, b) => a > b ? a : b).clamp(1, 1 << 30);

    // Court split với percent.
    final courts = revenue?.byCourt ?? const [];
    final courtsTotal = courts.fold<int>(0, (s, c) => s + c.total);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          // Manager badge + title
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.workspace_premium,
                        color: Color(0xFF7C3AED), size: 12),
                    SizedBox(width: 4),
                    Text(
                      'MANAGER',
                      style: TextStyle(
                        color: Color(0xFF7C3AED),
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Doanh thu venue',
              style: Theme.of(context).textTheme.displaySmall),
          Text(
            venueName,
            style: const TextStyle(
                color: AppColors.textSecondary, fontSize: 13),
          ),

          const SizedBox(height: 20),

          // Big total card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Doanh thu hôm nay',
                    style: TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 4),
                Text(
                  formatVND(total),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.trending_up,
                              color: Colors.white, size: 12),
                          SizedBox(width: 4),
                          Text('+12% vs hôm qua',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // KPI strip 3 cols
          Row(
            children: [
              Expanded(
                child: _Kpi(
                  icon: Icons.event_available,
                  label: 'Bookings',
                  value: '$bookings',
                  trend: '',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _Kpi(
                  icon: Icons.percent,
                  label: 'Lấp đầy',
                  value: '$occupancy%',
                  trend: '',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _Kpi(
                  icon: Icons.access_time,
                  label: 'Slot trống',
                  value: '${(totalSlots - bookings).clamp(0, 1 << 30)}',
                  trend: '',
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Hourly chart
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Doanh thu theo khung giờ',
                    style:
                        TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 120,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: List.generate(16, (i) {
                      final v = hourly[i];
                      final pct = v / hourlyMax;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Container(
                            height: 116 * pct.clamp(0.02, 1.0),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: v > 0
                                    ? const [
                                        Color(0xFF8B5CF6),
                                        Color(0xFF6D28D9),
                                      ]
                                    : [
                                        AppColors.surfaceAlt,
                                        AppColors.surfaceAlt,
                                      ],
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: _hourLabels
                      .map((d) => Expanded(
                            child: Center(
                              child: Text(
                                d,
                                style: const TextStyle(
                                    fontSize: 9,
                                    color: AppColors.textMuted),
                              ),
                            ),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Last 7 days sparkline
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('7 ngày gần nhất',
                    style:
                        TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                const SizedBox(height: 12),
                RevenueSparkline(data: MockData.revenueLast7Days),
                const SizedBox(height: 6),
                Row(
                  children: const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                      .map((d) => Expanded(
                            child: Center(
                              child: Text(
                                d,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Court split
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Phân bố theo sân',
                    style:
                        TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                const SizedBox(height: 12),
                if (courts.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      'Chưa có dữ liệu',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  )
                else
                  for (final c in courts)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Builder(builder: (_) {
                            final pct = courtsTotal > 0
                                ? (c.total / courtsTotal * 100).round()
                                : 0;
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(c.courtName,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w600)),
                                    Text('$pct% · ${formatVND(c.total)}',
                                        style: const TextStyle(
                                            color: AppColors.textMuted,
                                            fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: LinearProgressIndicator(
                                    value: pct / 100,
                                    minHeight: 6,
                                    backgroundColor: AppColors.surfaceAlt,
                                    valueColor: const AlwaysStoppedAnimation(
                                        Color(0xFF8B5CF6)),
                                  ),
                                ),
                              ],
                            );
                          }),
                        ],
                      ),
                    ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Quick actions for manager
          const Text('Hành động nhanh',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => context.push(RoutePaths.staffPricing),
            icon: const Icon(Icons.local_offer_outlined, size: 18),
            label: const Text('Sửa giá tạm thời'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => context.push(RoutePaths.staffTeam),
            icon: const Icon(Icons.groups_outlined, size: 18),
            label: const Text('Xem đội ngũ'),
          ),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  final IconData icon;
  final String label, value, trend;
  const _Kpi({
    required this.icon,
    required this.label,
    required this.value,
    required this.trend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF8B5CF6), size: 18),
          const SizedBox(height: 8),
          Text(value,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          Text(label,
              style: const TextStyle(
                  color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(height: 2),
          Text(trend,
              style: const TextStyle(
                  color: AppColors.success,
                  fontSize: 10,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
