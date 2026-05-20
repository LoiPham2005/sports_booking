import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/owner/dashboard/data/models/owner_dashboard_dto.dart';
import 'package:sports_booking_mobile/features/owner/dashboard/data/services/owner_dashboard_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'owner_dashboard_notifier.g.dart';

/// OwnerDashboardNotifier — KPI overview cho owner_overview_tab.
@riverpod
class OwnerDashboardNotifier extends _$OwnerDashboardNotifier
    with BaseNotifier<OwnerDashboardDto> {
  late OwnerDashboardService _service;

  @override
  Future<OwnerDashboardDto> build() async {
    _service = OwnerDashboardService(ref.read(dioProvider));
    return _fetch();
  }

  Future<OwnerDashboardDto> _fetch() async {
    if (AppConfig.useMock) {
      return _buildMock();
    }
    return _service.getDashboard();
  }

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
      );

  OwnerDashboardDto _buildMock() {
    // Derive từ MockData để có data hiển thị khi USE_MOCK=true.
    final venueCount = MockData.venues.length;
    final todayCount = MockData.bookingsToday.length;
    final todayRevenue = MockData.bookingsToday.fold<int>(
      0,
      (sum, b) => sum + b.total,
    );

    final recent = MockData.bookingsToday.take(5).map((b) {
      return BookingDto(
        id: b.id,
        code: b.code,
        userId: 'mock-user',
        courtId: 'mock-court',
        venueId: b.venue.id,
        startsAt: b.startsAt.toIso8601String(),
        endsAt: b.endsAt.toIso8601String(),
        status: switch (b.status) {
          BookingStatus.confirmed => 'CONFIRMED',
          BookingStatus.checkedIn => 'CHECKED_IN',
          BookingStatus.completed => 'COMPLETED',
          BookingStatus.cancelled => 'CANCELLED_BY_USER',
          _ => 'PENDING_PAYMENT',
        },
        total: b.total,
        createdAt: DateTime.now().toIso8601String(),
      );
    }).toList();

    return OwnerDashboardDto(
      venueCount: venueCount,
      revenueToday: todayRevenue,
      bookingsToday: todayCount,
      revenueMonth: todayRevenue * 18, // demo
      revenueMonthDelta: 12.5,
      occupancyToday: 0.72,
      ratingAvg: 4.7,
      recentBookings: recent,
      revenueLast7Days: const [
        12000000,
        15000000,
        9000000,
        18000000,
        21000000,
        16000000,
        24000000,
      ],
      topCustomers: const [
        TopCustomerDto(name: 'Nguyễn Minh', bookings: 12, total: 3200000),
        TopCustomerDto(name: 'Lê Hà', bookings: 9, total: 2400000),
        TopCustomerDto(name: 'Trần Quang', bookings: 7, total: 1900000),
      ],
    );
  }
}
