import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';
import '../../../shared/widgets/status_badge.dart';
import 'presentation/providers/bookings_notifier.dart';

class BookingsTab extends ConsumerWidget {
  const BookingsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBookings = ref.watch(myBookingsProvider);
    final bookings = asyncBookings.value ?? const <Booking>[];

    final upcoming = bookings
        .where((b) =>
            b.status == BookingStatus.confirmed ||
            b.status == BookingStatus.pendingPayment ||
            b.status == BookingStatus.checkedIn)
        .toList();
    final completed =
        bookings.where((b) => b.status == BookingStatus.completed).toList();
    final cancelled =
        bookings.where((b) => b.status == BookingStatus.cancelled).toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text('Booking của tôi',
                          style: Theme.of(context).textTheme.displaySmall),
                    ),
                  ],
                ),
              ),
              const TabBar(
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                indicatorColor: AppColors.primary,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: TextStyle(fontWeight: FontWeight.w700),
                tabs: [
                  Tab(text: 'Sắp tới'),
                  Tab(text: 'Hoàn thành'),
                  Tab(text: 'Đã huỷ'),
                ],
              ),
              const Divider(height: 1),
              Expanded(
                child: TabBarView(
                  children: [
                    _BookingList(items: upcoming, emptyText: 'Chưa có booking nào sắp tới'),
                    _BookingList(items: completed, emptyText: 'Chưa có booking hoàn thành'),
                    _BookingList(items: cancelled, emptyText: 'Chưa huỷ booking nào'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final List<Booking> items;
  final String emptyText;
  const _BookingList({required this.items, required this.emptyText});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 96,
              width: 96,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary.withValues(alpha: 0.1),
              ),
              alignment: Alignment.center,
              child: const Text('🎾', style: TextStyle(fontSize: 44)),
            ),
            const SizedBox(height: 16),
            Text(emptyText,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('Khám phá sân và đặt ngay hôm nay!',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.push(RoutePaths.venues),
              child: const Text('Khám phá sân'),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 90),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _BookingCard(booking: items[i]),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;
  const _BookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push(RoutePaths.bookingDetail(booking.id)),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: SizedBox(
                    height: 84,
                    width: 84,
                    child: CachedNetworkImage(imageUrl: booking.venue.image, fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '#${booking.code}',
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 11,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const Spacer(),
                          StatusBadge(status: booking.status),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        booking.venue.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_outlined,
                              size: 12, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            '${formatDateShort(booking.startsAt)} · ${formatTime(booking.startsAt)}–${formatTime(booking.endsAt)}',
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${booking.courtName} · ${formatVND(booking.total)}',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (booking.status == BookingStatus.pendingPayment ||
                booking.status == BookingStatus.confirmed ||
                booking.status == BookingStatus.completed) ...[
              const Divider(height: 20),
              Row(
                children: _actions(context, booking),
              ),
            ],
          ],
        ),
      ),
    );
  }

  List<Widget> _actions(BuildContext context, Booking b) {
    final btns = <Widget>[];
    if (b.status == BookingStatus.pendingPayment) {
      btns.add(Expanded(
        child: FilledButton(
          onPressed: () => context.push(RoutePaths.bookingNew),
          child: const Text('Thanh toán'),
        ),
      ));
    }
    if (b.status == BookingStatus.confirmed) {
      btns.add(Expanded(
        child: FilledButton.icon(
          onPressed: () => context.push(RoutePaths.bookingDetail(b.id)),
          icon: const Icon(Icons.qr_code_2),
          label: const Text('QR Check-in'),
        ),
      ));
    }
    if (b.status == BookingStatus.completed) {
      btns.add(Expanded(
        child: OutlinedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.star_outline),
          label: const Text('Đánh giá'),
        ),
      ));
    }
    if (b.status == BookingStatus.pendingPayment ||
        b.status == BookingStatus.confirmed) {
      btns.add(const SizedBox(width: 8));
      btns.add(SizedBox(
        width: 88,
        child: OutlinedButton(
          onPressed: () {},
          child: const Text('Huỷ'),
        ),
      ));
    }
    return btns;
  }
}
