import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../auth/presentation/providers/auth_notifier.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffShiftReportPage extends ConsumerWidget {
  const StaffShiftReportPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isManager = ref.watch(isManagerProvider);
    final memberships = ref.watch(staffMembershipsProvider).value ?? const [];
    final venueName = memberships.isNotEmpty
        ? memberships.first.venue.name
        : MockData.staffVenue.name;
    final user = ref.watch(currentUserProvider);
    final userName =
        user?.fullName ?? (isManager ? 'Manager' : 'Staff');
    final bookings = ref.watch(staffTodayProvider).value ??
        MockData.staffBookingsToday;
    final completed =
        bookings.where((b) => b.status == BookingStatus.completed).length;
    final upcoming = bookings
        .where((b) => b.status == BookingStatus.confirmed)
        .length;
    final pending = bookings
        .where((b) => b.status == BookingStatus.pendingPayment)
        .length;
    final revenue = bookings
        .where((b) =>
            b.status == BookingStatus.completed ||
            b.status == BookingStatus.confirmed)
        .fold<int>(0, (sum, b) => sum + b.total);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Báo cáo ca trực'),
        actions: [
          IconButton(
            icon: const Icon(Icons.ios_share),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã sao chép link báo cáo')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Shift summary header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withValues(alpha: 0.1),
                  AppColors.accent.withValues(alpha: 0.06),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.access_time,
                              color: AppColors.primary, size: 12),
                          SizedBox(width: 4),
                          Text('ĐANG TRỰC',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              )),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text(formatDateLong(DateTime.now()),
                        style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(venueName,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 16)),
                const SizedBox(height: 4),
                Text(
                  '$userName · 08:00 → 22:00',
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const _SectionTitle('TÓM TẮT'),

          Row(
            children: [
              Expanded(
                child: _KpiCard(
                  icon: Icons.event_available,
                  color: AppColors.primary,
                  value: '${bookings.length}',
                  label: 'Booking',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _KpiCard(
                  icon: Icons.check_circle_outline,
                  color: AppColors.success,
                  value: '$completed',
                  label: 'Hoàn thành',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _KpiCard(
                  icon: Icons.schedule_outlined,
                  color: AppColors.info,
                  value: '$upcoming',
                  label: 'Sắp tới',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _KpiCard(
                  icon: Icons.hourglass_top,
                  color: AppColors.warning,
                  value: '$pending',
                  label: 'Chờ TT',
                ),
              ),
            ],
          ),

          if (isManager) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.08),
                border:
                    Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.25)),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.payments,
                        color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Doanh thu hôm nay',
                            style: TextStyle(
                                color: AppColors.textMuted, fontSize: 11)),
                        Text(formatVND(revenue),
                            style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                                color: Color(0xFF7C3AED))),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('MANAGER',
                        style: TextStyle(
                          color: Color(0xFF7C3AED),
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        )),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 20),
          const _SectionTitle('DÒNG THỜI GIAN'),
          ...bookings.map(_buildTimelineItem),

          const SizedBox(height: 20),
          const _SectionTitle('SỰ CỐ TRONG CA'),
          const _IncidentCard(
            time: '14:30',
            title: 'Khách đến muộn 15 phút',
            note: 'Booking #20260549 — đã ghi nhận, không tính phạt',
            color: AppColors.warning,
          ),
          const _IncidentCard(
            time: '11:05',
            title: 'Sân 2 đèn LED chập chờn',
            note: 'Đã báo kỹ thuật, đang chờ xử lý',
            color: AppColors.danger,
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Demo — chưa cài form sự cố')),
              );
            },
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Thêm sự cố'),
          ),

          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Đã chốt ca — báo cáo gửi cho Owner')),
              );
              safePop(context);
            },
            icon: const Icon(Icons.check_circle_outline, size: 18),
            label: const Text('Chốt ca & gửi báo cáo'),
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  static Widget _buildTimelineItem(Booking b) {
    final color = switch (b.status) {
      BookingStatus.completed => AppColors.success,
      BookingStatus.confirmed => AppColors.info,
      BookingStatus.pendingPayment => AppColors.warning,
      BookingStatus.checkedIn => AppColors.primary,
      BookingStatus.cancelled => AppColors.danger,
    };
    final label = switch (b.status) {
      BookingStatus.completed => 'Hoàn thành',
      BookingStatus.confirmed => 'Sắp tới',
      BookingStatus.pendingPayment => 'Chờ TT',
      BookingStatus.checkedIn => 'Đang chơi',
      BookingStatus.cancelled => 'Đã huỷ',
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 56,
            child: Column(
              children: [
                Text(formatTime(b.startsAt),
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 13)),
                Text(formatTime(b.endsAt),
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 11)),
              ],
            ),
          ),
          Column(
            children: [
              Container(
                height: 10,
                width: 10,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withValues(alpha: 0.3), width: 3),
                ),
              ),
              Container(
                height: 50,
                width: 2,
                color: AppColors.border,
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          b.courtName,
                          style: const TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 13),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(label,
                            style: TextStyle(
                              color: color,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            )),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text('#${b.code} · ${formatVND(b.total)}',
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          text,
          style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w800),
        ),
      );
}

class _KpiCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String value;
  final String label;
  const _KpiCard({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 32,
            width: 32,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 10),
          Text(value,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w800)),
          Text(label,
              style:
                  const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }
}

class _IncidentCard extends StatelessWidget {
  final String time;
  final String title;
  final String note;
  final Color color;
  const _IncidentCard({
    required this.time,
    required this.title,
    required this.note,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        border: Border.all(color: color.withValues(alpha: 0.25)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.warning_amber_outlined, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                    Text(time,
                        style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.w800,
                            fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 2),
                Text(note,
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
