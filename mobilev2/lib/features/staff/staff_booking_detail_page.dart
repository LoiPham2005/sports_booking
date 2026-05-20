import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/status_badge.dart';

class StaffBookingDetailPage extends StatelessWidget {
  final String id;
  const StaffBookingDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final all = [...MockData.staffBookingsToday, ...MockData.bookings];
    final b = all.firstWhere(
      (x) => x.id == id,
      orElse: () => MockData.staffBookingsToday.first,
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Chi tiết'),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: b.status == BookingStatus.confirmed
              ? FilledButton.icon(
                  onPressed: () => context.push(RoutePaths.staffQrScan),
                  icon: const Icon(Icons.qr_code_scanner, size: 18),
                  label: const Text('Quét QR check-in'),
                )
              : b.status == BookingStatus.checkedIn
                  ? FilledButton.icon(
                      onPressed: () => ScaffoldMessenger.of(context)
                          .showSnackBar(const SnackBar(
                              content: Text('Đã đánh dấu hoàn thành'))),
                      icon: const Icon(Icons.check_circle, size: 18),
                      label: const Text('Đánh dấu hoàn thành'),
                    )
                  : OutlinedButton(
                      onPressed: null,
                      child: Text(_statusHint(b.status)),
                    ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('MÃ ĐẶT SÂN',
                        style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 11,
                            letterSpacing: 1.5,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(b.code,
                        style: const TextStyle(
                            fontSize: 26,
                            letterSpacing: 4,
                            fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
              StatusBadge(status: b.status),
            ],
          ),

          const SizedBox(height: 20),

          // Customer
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                  child: const Text('M',
                      style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 18)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Trần Minh',
                          style: TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 16)),
                      Text('+84 901 234 567',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
                Material(
                  color: AppColors.success,
                  shape: const CircleBorder(),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () {},
                    child: const SizedBox(
                      height: 40,
                      width: 40,
                      child: Icon(Icons.phone, color: Colors.white, size: 18),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Detail rows
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                _Row(
                    icon: Icons.event_outlined,
                    title: formatDateLong(b.startsAt),
                    subtitle:
                        '${formatTime(b.startsAt)} – ${formatTime(b.endsAt)}'),
                const Divider(height: 1),
                _Row(
                    icon: Icons.sports_handball_outlined,
                    title: b.courtName,
                    subtitle:
                        'Cỏ nhân tạo · ${b.endsAt.difference(b.startsAt).inHours} giờ'),
                const Divider(height: 1),
                _Row(
                    icon: Icons.payments_outlined,
                    title: formatVND(b.total),
                    subtitle: b.status == BookingStatus.pendingPayment
                        ? 'Chờ thanh toán'
                        : 'Đã thanh toán',
                    highlight: true),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Notes
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.sticky_note_2_outlined,
                    size: 18, color: AppColors.textSecondary),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Ghi chú: cần mượn thêm 2 chiếc vợt, đội 6 người.',
                    style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                        height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusHint(BookingStatus s) {
    switch (s) {
      case BookingStatus.pendingPayment:
        return 'Đang chờ khách thanh toán';
      case BookingStatus.completed:
        return 'Booking đã hoàn thành';
      case BookingStatus.cancelled:
        return 'Booking đã huỷ';
      default:
        return '';
    }
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final bool highlight;
  const _Row({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.highlight = false,
  });
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            height: 36,
            width: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: highlight ? 16 : 14,
                    color: highlight ? AppColors.primary : null,
                  ),
                ),
                Text(subtitle,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
