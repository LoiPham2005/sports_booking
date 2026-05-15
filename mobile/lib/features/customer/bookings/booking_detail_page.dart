import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';
import '../../../shared/widgets/status_badge.dart';

class BookingDetailPage extends StatelessWidget {
  final String id;
  const BookingDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final b = MockData.bookings.firstWhere(
      (x) => x.id == id,
      orElse: () => MockData.bookings.first,
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
      body: ListView(
        children: [
          // Header gradient
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
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
                    Text(
                      b.code,
                      style: const TextStyle(
                        fontSize: 28,
                        letterSpacing: 4,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 12),
                    StatusBadge(status: b.status),
                  ],
                ),
              ],
            ),
          ),

          if (b.status == BookingStatus.confirmed)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text('Mã QR check-in',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: QrImageView(
                        data: 'sportsbooking://checkin/${b.code}',
                        size: 200,
                        backgroundColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Đưa mã này cho nhân viên tại sân.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _InfoTile(
                    icon: Icons.place_outlined,
                    title: b.venue.name,
                    subtitle: '${b.venue.address}, ${b.venue.district}',
                  ),
                  const Divider(height: 1),
                  _InfoTile(
                    icon: Icons.event_outlined,
                    title: formatDateLong(b.startsAt),
                    subtitle:
                        '${formatTime(b.startsAt)} – ${formatTime(b.endsAt)}',
                  ),
                  const Divider(height: 1),
                  _InfoTile(
                    icon: Icons.sports_handball_outlined,
                    title: b.courtName,
                    subtitle: 'Cỏ nhân tạo · 10 người',
                  ),
                  const Divider(height: 1),
                  _InfoTile(
                    icon: Icons.payments_outlined,
                    title: formatVND(b.total),
                    subtitle: 'Đã thanh toán qua VNPay',
                    highlight: true,
                  ),
                ],
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Lịch sử trạng thái',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  const SizedBox(height: 12),
                  _Timeline(
                    items: [
                      ('Tạo booking', '12:30', true, false),
                      ('Thanh toán thành công qua VNPay', '12:32', true, false),
                      ('Đã đặt giờ, đợi check-in', '—', false, true),
                      ('Hoàn thành', '—', false, false),
                    ],
                  ),
                ],
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(
              children: [
                if (b.status == BookingStatus.confirmed ||
                    b.status == BookingStatus.pendingPayment)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.danger,
                        side: const BorderSide(color: AppColors.danger),
                      ),
                      child: const Text('Huỷ booking'),
                    ),
                  ),
                if (b.status == BookingStatus.completed)
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.star_outline),
                      label: const Text('Đánh giá'),
                    ),
                  ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.receipt_long_outlined),
                    label: const Text('Hoá đơn'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final bool highlight;
  const _InfoTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
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
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: highlight ? 17 : 14,
                    color: highlight ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
                Text(subtitle,
                    style:
                        const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  /// (label, time, done, current)
  final List<(String, String, bool, bool)> items;
  const _Timeline({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(items.length, (i) {
        final (label, time, done, current) = items[i];
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  height: 12,
                  width: 12,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: done
                        ? AppColors.success
                        : current
                            ? AppColors.primary
                            : AppColors.surfaceAlt,
                    border: current
                        ? Border.all(
                            color: AppColors.primary.withValues(alpha: 0.25), width: 4)
                        : null,
                  ),
                ),
                if (i < items.length - 1)
                  Container(width: 2, height: 26, color: AppColors.border),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                    Text(time,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}
