import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/status_badge.dart';

class StaffTodayTab extends StatelessWidget {
  const StaffTodayTab({super.key});

  @override
  Widget build(BuildContext context) {
    final bookings = MockData.staffBookingsToday;
    final upcoming = bookings.where((b) => b.startsAt.isAfter(DateTime.now())).toList();
    final past = bookings.where((b) => b.endsAt.isBefore(DateTime.now())).toList();
    final now = DateTime.now();
    final active = bookings.where((b) =>
        !b.startsAt.isAfter(now) && !b.endsAt.isBefore(now)).toList();

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          // Header
          Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.shield_outlined,
                    color: AppColors.accent, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Text(
                          formatDateLong(DateTime.now()),
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    Text(
                      MockData.staffVenue.name,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // BIG QR SCAN BUTTON
          Material(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(20),
            child: InkWell(
              onTap: () => context.push(RoutePaths.staffQrScan),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.primary, AppColors.primaryDark],
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      height: 56,
                      width: 56,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.qr_code_scanner,
                          color: Colors.white, size: 30),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Quét mã QR check-in',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800)),
                          SizedBox(height: 2),
                          Text('Đưa mã của khách vào camera',
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward, color: Colors.white),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Stats strip
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'Đang chơi',
                  value: '${active.length}',
                  color: AppColors.primary,
                  icon: Icons.sports_tennis,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _StatCard(
                  label: 'Sắp đến',
                  value: '${upcoming.length}',
                  color: AppColors.accent,
                  icon: Icons.schedule,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _StatCard(
                  label: 'Đã xong',
                  value: '${past.length}',
                  color: AppColors.success,
                  icon: Icons.check_circle_outline,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),
          const _Section('Lịch hôm nay'),

          ...bookings.map((b) => _BookingTile(booking: b)),

          if (bookings.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.inbox_outlined,
                        size: 48, color: AppColors.textMuted),
                    SizedBox(height: 8),
                    Text('Hôm nay không có booking nào',
                        style: TextStyle(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final Color color;
  final IconData icon;
  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
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
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 6),
          Text(value,
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w800)),
          Text(label,
              style: const TextStyle(
                  color: AppColors.textMuted, fontSize: 11)),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _Section(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(text,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
      );
}

class _BookingTile extends StatelessWidget {
  final Booking booking;
  const _BookingTile({required this.booking});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final isActive = !booking.startsAt.isAfter(now) && !booking.endsAt.isBefore(now);
    return InkWell(
      onTap: () => context.push(RoutePaths.staffBookingDetail(booking.id)),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.06)
              : Colors.white,
          border: Border.all(
            color: isActive ? AppColors.primary.withValues(alpha: 0.4) : AppColors.border,
            width: isActive ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 60,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(formatTime(booking.startsAt),
                      style: const TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w800)),
                  const Text('–',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  Text(formatTime(booking.endsAt),
                      style: const TextStyle(
                          fontFamily: 'monospace',
                          color: AppColors.textMuted,
                          fontSize: 11)),
                ],
              ),
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
                      const SizedBox(width: 6),
                      StatusBadge(status: booking.status),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${booking.courtName} · Trần Minh',
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                ],
              ),
            ),
            if (booking.status == BookingStatus.confirmed && isActive)
              IconButton(
                onPressed: () => context.push(RoutePaths.staffQrScan),
                icon: const Icon(Icons.qr_code_scanner,
                    color: AppColors.primary),
              ),
          ],
        ),
      ),
    );
  }
}
