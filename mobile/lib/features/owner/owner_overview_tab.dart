import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/kpi_card.dart';
import '../../shared/widgets/revenue_sparkline.dart';
import '../../shared/widgets/status_badge.dart';

class OwnerOverviewTab extends StatelessWidget {
  const OwnerOverviewTab({super.key});

  @override
  Widget build(BuildContext context) {
    final upcoming = MockData.bookingsToday.firstWhere(
      (b) => b.startsAt.isAfter(DateTime.now()),
      orElse: () => MockData.bookingsToday.last,
    );

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              children: [
                Container(
                  height: 44,
                  width: 44,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Text('O',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Xin chào, Owner 👋',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 12)),
                      Text('Quản lý ${MockData.ownerVenues.length} venue',
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 16)),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.notifications_outlined),
                ),
              ],
            ),
          ),

          // Quick actions row
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 8, 4, 16),
            child: Row(
              children: [
                Expanded(
                  child: _ActionButton(
                    icon: Icons.qr_code_scanner,
                    label: 'Quét QR',
                    color: AppColors.primary,
                    onTap: () => context.push(RoutePaths.ownerQrScan),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _ActionButton(
                    icon: Icons.add_box_outlined,
                    label: 'Booking thủ công',
                    color: AppColors.accent,
                    onTap: () => context.push(RoutePaths.ownerWalkIn),
                  ),
                ),
              ],
            ),
          ),

          // KPI 2x2
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.45,
            children: [
              KpiCard(
                icon: Icons.account_balance_wallet_outlined,
                color: AppColors.primary,
                label: 'DOANH THU HÔM NAY',
                value: formatVND(MockData.ownerKpi['revenueToday'] as int),
                trend: '+12% so với hôm qua',
              ),
              KpiCard(
                icon: Icons.event_available_outlined,
                color: AppColors.success,
                label: 'BOOKING HÔM NAY',
                value: '${MockData.ownerKpi['bookingsToday']}',
                trend: '+3 mới',
              ),
              KpiCard(
                icon: Icons.timeline_outlined,
                color: AppColors.accent,
                label: 'TỈ LỆ LẤP ĐẦY',
                value: '${MockData.ownerKpi['occupancyToday']}%',
                trend: 'Trên TB ngành',
              ),
              KpiCard(
                icon: Icons.star_outline,
                color: AppColors.info,
                label: 'RATING TUẦN',
                value: '${MockData.ownerKpi['ratingAvg']} ⭐',
                trend: '24 đánh giá mới',
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Revenue chart
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Doanh thu 7 ngày',
                              style: TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 14)),
                          Text('Hôm nay đang dẫn đầu tuần',
                              style: TextStyle(
                                  color: AppColors.textMuted, fontSize: 11)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        '+12.4%',
                        style: TextStyle(
                            color: AppColors.success,
                            fontSize: 11,
                            fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                RevenueSparkline(data: MockData.revenueLast7Days),
                const SizedBox(height: 6),
                Row(
                  children: const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                      .map((d) => Expanded(
                            child: Center(
                              child: Text(d,
                                  style: const TextStyle(
                                      color: AppColors.textMuted, fontSize: 10)),
                            ),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Upcoming booking nudge
          _SectionTitle('Booking sắp tới'),
          _UpcomingTile(booking: upcoming),

          const SizedBox(height: 20),

          // Top customers
          _SectionTitle('Khách quen tháng này'),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: MockData.topCustomers.asMap().entries.map((e) {
                final i = e.key;
                final c = e.value;
                return Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    border: i == MockData.topCustomers.length - 1
                        ? null
                        : const Border(
                            bottom: BorderSide(color: AppColors.border)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor:
                            AppColors.primary.withValues(alpha: 0.15),
                        radius: 18,
                        child: Text(c.$1[0],
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(c.$1,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700)),
                            Text('${c.$2} booking',
                                style: const TextStyle(
                                    color: AppColors.textMuted, fontSize: 11)),
                          ],
                        ),
                      ),
                      Text(formatVND(c.$3),
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 10),
      child: Text(text,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
    );
  }
}

class _UpcomingTile extends StatelessWidget {
  final Booking booking;
  const _UpcomingTile({required this.booking});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push(RoutePaths.ownerBookingDetail(booking.id)),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.06),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.schedule,
                  color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Text('#${booking.code}',
                          style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 11,
                              color: AppColors.textMuted)),
                      const SizedBox(width: 8),
                      StatusBadge(status: booking.status),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${booking.courtName} · ${formatTime(booking.startsAt)}–${formatTime(booking.endsAt)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                  Text(formatVND(booking.total),
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios,
                size: 14, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
