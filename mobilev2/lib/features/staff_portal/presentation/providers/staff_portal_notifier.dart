import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/customer/bookings/presentation/providers/bookings_notifier.dart';
import 'package:sports_booking_mobile/features/staff_portal/data/models/staff_portal_dtos.dart';
import 'package:sports_booking_mobile/features/staff_portal/data/services/staff_portal_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'staff_portal_notifier.g.dart';

/// Memberships (giúp UI xác định MANAGER vs STAFF + venue đang trực).
@riverpod
Future<List<MembershipDto>> staffMemberships(Ref ref) async {
  if (AppConfig.useMock) {
    return const [
      MembershipDto(
        id: 'm1',
        venueId: 'v1',
        role: 'STAFF',
        venue: MembershipVenueInline(id: 'v1', name: 'Sân Phú Mỹ Hưng'),
      ),
    ];
  }
  return StaffPortalService(ref.read(dioProvider)).memberships();
}

/// `true` nếu user có ít nhất 1 membership role=MANAGER.
@riverpod
bool isManager(Ref ref) {
  final list = ref.watch(staffMembershipsProvider).value ?? const [];
  return list.any((m) => m.role == 'MANAGER');
}

/// Today bookings — list cho `/staff` today tab.
@riverpod
class StaffTodayNotifier extends _$StaffTodayNotifier
    with BaseNotifier<List<Booking>> {
  late StaffPortalService _service;

  @override
  Future<List<Booking>> build() async {
    _service = StaffPortalService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<Booking>> _fetch() async {
    if (AppConfig.useMock) return MockData.bookingsToday;
    final list = await _service.today();
    return list.map(bookingDtoToUi).toList();
  }

  Future<void> refresh() => runAsync(action: _fetch, keepPreviousOnLoading: true);

  /// Check-in qua QR token. Sau khi OK refetch list.
  Future<void> checkIn(String token) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.checkIn(CheckInRequest(token: token));
          }
          return _fetch();
        },
        successMessage: 'Đã check-in',
        errorMessage: 'Check-in thất bại',
        keepPreviousOnLoading: true,
      );
}

/// Schedule list family theo `date` (YYYY-MM-DD).
@riverpod
Future<List<Booking>> staffSchedule(
  Ref ref, {
  String? date,
  int days = 1,
}) async {
  if (AppConfig.useMock) {
    return MockData.bookingsToday;
  }
  final list = await StaffPortalService(ref.read(dioProvider))
      .schedule(date: date, days: days);
  return list.map(bookingDtoToUi).toList();
}

/// Revenue (Manager-only) family theo `date`.
@riverpod
Future<RevenueResponse> staffRevenue(Ref ref, {String? date}) async {
  if (AppConfig.useMock) {
    return const RevenueResponse(
      date: '',
      revenue: 12500000,
      bookings: 18,
      totalSlots: 24,
      byHour: [
        RevenueByHour(hour: 6, total: 800000, count: 2),
        RevenueByHour(hour: 8, total: 1200000, count: 3),
        RevenueByHour(hour: 14, total: 2400000, count: 4),
        RevenueByHour(hour: 18, total: 4800000, count: 6),
        RevenueByHour(hour: 20, total: 3300000, count: 3),
      ],
      byCourt: [
        RevenueByCourt(courtId: 'c1', courtName: 'Sân 1', total: 4500000, count: 6),
        RevenueByCourt(courtId: 'c2', courtName: 'Sân 2', total: 3800000, count: 5),
        RevenueByCourt(courtId: 'c3', courtName: 'Sân 3', total: 4200000, count: 7),
      ],
    );
  }
  return StaffPortalService(ref.read(dioProvider)).revenue(date: date);
}

/// Pricing overrides notifier — list + create + delete.
@riverpod
class StaffOverridesNotifier extends _$StaffOverridesNotifier
    with BaseNotifier<List<PriceOverrideDto>> {
  late StaffPortalService _service;

  @override
  Future<List<PriceOverrideDto>> build({required String venueId}) async {
    _service = StaffPortalService(ref.read(dioProvider));
    return _fetch(venueId);
  }

  Future<List<PriceOverrideDto>> _fetch(String venueId) async {
    if (AppConfig.useMock) {
      return const [
        PriceOverrideDto(
          id: 'o1',
          courtId: 'c1',
          date: '2026-05-10',
          startTime: '18:00',
          endTime: '21:00',
          price: 450000,
          reason: 'Lễ',
          court: PriceOverrideCourtInline(id: 'c1', name: 'Sân 1'),
        ),
      ];
    }
    return _service.listOverrides(venueId: venueId);
  }

  Future<void> create(CreatePriceOverrideRequest body) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.createOverride(body);
          }
          return _fetch(body.courtId);
        },
        successMessage: 'Đã tạo override',
        errorMessage: 'Tạo override thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> remove(String id, {required String venueId}) => runAsync(
        action: () async {
          if (!AppConfig.useMock) await _service.deleteOverride(id);
          return _fetch(venueId);
        },
        successMessage: 'Đã xoá',
        errorMessage: 'Xoá thất bại',
        keepPreviousOnLoading: true,
      );
}
