import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/status_badge.dart';

class OwnerBookingDetailPage extends StatelessWidget {
  final String id;
  const OwnerBookingDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final all = [...MockData.bookingsToday, ...MockData.bookings];
    final b = all.firstWhere(
      (x) => x.id == id,
      orElse: () => MockData.bookingsToday.first,
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Chi tiết booking'),
        actions: [
          IconButton(icon: const Icon(Icons.more_horiz), onPressed: () {}),
        ],
      ),
      bottomNavigationBar: _ActionBar(status: b.status, onScan: () => context.push(RoutePaths.ownerQrScan)),
      body: ListView(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary.withValues(alpha: 0.1),
                  AppColors.primary.withValues(alpha: 0.02),
                ],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('MÃ ĐẶT SÂN',
                    style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(b.code,
                        style: const TextStyle(
                            fontSize: 26,
                            letterSpacing: 4,
                            fontWeight: FontWeight.w800)),
                    const SizedBox(width: 12),
                    StatusBadge(status: b.status),
                  ],
                ),
              ],
            ),
          ),

          // Customer card
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.15),
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
                                fontWeight: FontWeight.w700, fontSize: 15)),
                        SizedBox(height: 2),
                        Text('+84 901 234 567',
                            style: TextStyle(
                                color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _RoundIcon(icon: Icons.phone, color: AppColors.success, onTap: () {}),
                      const SizedBox(width: 8),
                      _RoundIcon(icon: Icons.chat_bubble_outline, color: AppColors.primary, onTap: () {}),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Booking info
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  _InfoRow(
                    icon: Icons.place_outlined,
                    title: b.venue.name,
                    subtitle: '${b.venue.district}, ${b.venue.city}',
                  ),
                  const Divider(height: 1),
                  _InfoRow(
                    icon: Icons.event_outlined,
                    title: formatDateLong(b.startsAt),
                    subtitle:
                        '${formatTime(b.startsAt)} – ${formatTime(b.endsAt)}',
                  ),
                  const Divider(height: 1),
                  _InfoRow(
                    icon: Icons.sports_handball_outlined,
                    title: b.courtName,
                    subtitle: 'Cỏ nhân tạo · ${b.endsAt.difference(b.startsAt).inHours} giờ',
                  ),
                  const Divider(height: 1),
                  _InfoRow(
                    icon: Icons.payments_outlined,
                    title: formatVND(b.total),
                    subtitle: b.status == BookingStatus.pendingPayment
                        ? 'Chưa thanh toán'
                        : 'Đã thanh toán qua VNPay',
                    highlight: true,
                  ),
                ],
              ),
            ),
          ),

          // Notes
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: Container(
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
                      'Ghi chú khách: cần mượn thêm 2 chiếc vợt, đội 6 người.',
                      style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                          height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionBar extends StatelessWidget {
  final BookingStatus status;
  final VoidCallback onScan;
  const _ActionBar({required this.status, required this.onScan});

  @override
  Widget build(BuildContext context) {
    final btns = <Widget>[];
    switch (status) {
      case BookingStatus.pendingPayment:
        btns.addAll([
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.danger,
                side: const BorderSide(color: AppColors.danger),
              ),
              child: const Text('Huỷ'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: FilledButton(
              onPressed: () {},
              child: const Text('Xác nhận'),
            ),
          ),
        ]);
        break;
      case BookingStatus.confirmed:
        btns.addAll([
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              child: const Text('Đánh dấu no-show'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: FilledButton.icon(
              onPressed: onScan,
              icon: const Icon(Icons.qr_code_scanner, size: 18),
              label: const Text('Check-in'),
            ),
          ),
        ]);
        break;
      case BookingStatus.checkedIn:
      case BookingStatus.completed:
        btns.add(Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.receipt_long_outlined),
            label: const Text('Xuất hoá đơn'),
          ),
        ));
        break;
      case BookingStatus.cancelled:
        btns.add(const Expanded(
          child: Center(
            child: Text('Booking đã huỷ',
                style: TextStyle(color: AppColors.textMuted)),
          ),
        ));
        break;
    }

    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        12 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(children: btns),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final bool highlight;
  const _InfoRow({
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

class _RoundIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _RoundIcon(
      {required this.icon, required this.color, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withValues(alpha: 0.12),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 36,
          width: 36,
          child: Icon(icon, color: color, size: 18),
        ),
      ),
    );
  }
}
