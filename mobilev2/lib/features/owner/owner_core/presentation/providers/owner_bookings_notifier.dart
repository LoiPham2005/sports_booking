import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/customer/bookings/presentation/providers/bookings_notifier.dart';
import 'package:sports_booking_mobile/features/owner/owner_core/data/models/owner_dtos.dart';
import 'package:sports_booking_mobile/features/owner/owner_core/data/services/owner_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'owner_bookings_notifier.g.dart';

/// Filter cho owner bookings list (immutable).
class OwnerBookingsFilter {
  const OwnerBookingsFilter({this.venueId, this.date, this.status});
  final String? venueId;
  final String? date;
  final String? status; // BookingStatus DB enum string

  OwnerBookingsFilter copyWith({String? venueId, String? date, String? status}) =>
      OwnerBookingsFilter(
        venueId: venueId ?? this.venueId,
        date: date ?? this.date,
        status: status ?? this.status,
      );
}

@riverpod
class OwnerBookingsNotifier extends _$OwnerBookingsNotifier
    with BaseNotifier<List<Booking>> {
  late OwnerService _service;
  OwnerBookingsFilter _filter = const OwnerBookingsFilter();

  @override
  Future<List<Booking>> build() async {
    _service = OwnerService(ref.read(dioProvider));
    return _fetch(_filter);
  }

  Future<List<Booking>> _fetch(OwnerBookingsFilter f) async {
    if (AppConfig.useMock) {
      return MockData.bookingsToday;
    }
    final list = await _service.listBookings(
      venueId: f.venueId,
      date: f.date,
      status: f.status,
    );
    return list.map(bookingDtoToUi).toList();
  }

  Future<void> apply(OwnerBookingsFilter filter) {
    _filter = filter;
    return runAsync(
      action: () => _fetch(filter),
      cancelPrevious: true,
      keepPreviousOnLoading: true,
      emitEmptyForEmptyList: true,
    );
  }

  Future<void> refresh() => runAsync(
        action: () => _fetch(_filter),
        keepPreviousOnLoading: true,
      );

  /// Tạo walk-in booking (source=WALK_IN, payment=CASH).
  Future<Booking?> createWalkIn(CreateWalkInRequest body) async {
    Booking? out;
    await runAsync(
      action: () async {
        if (AppConfig.useMock) {
          final mock = MockData.bookingsToday.first;
          out = mock;
          return [mock, ...(state.value ?? [])];
        }
        final dto = await _service.createWalkIn(body);
        out = bookingDtoToUi(dto);
        return [out!, ...(state.value ?? [])];
      },
      successMessage: 'Đã tạo walk-in',
      errorMessage: 'Tạo walk-in thất bại',
      keepPreviousOnLoading: true,
    );
    return out;
  }

  /// Owner từ chối booking (trong 5' đầu sau tạo). Refund 100%.
  Future<void> refuse(String id, {String? reason}) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.refuseBooking(id, RefuseBookingRequest(reason: reason));
          }
          return _fetch(_filter);
        },
        successMessage: 'Đã từ chối booking',
        errorMessage: 'Từ chối thất bại',
        keepPreviousOnLoading: true,
      );
}
