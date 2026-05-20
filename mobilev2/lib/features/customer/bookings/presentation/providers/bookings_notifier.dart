import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/services/bookings_service.dart';
import 'package:sports_booking_mobile/features/customer/venues/presentation/providers/venues_notifier.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'bookings_notifier.g.dart';

/// Map 9 status DB → 5 status UI (gộp CANCELLED_* → CANCELLED).
BookingStatus bookingStatusToUi(String dbStatus) {
  if (dbStatus.startsWith('CANCELLED_')) return BookingStatus.cancelled;
  return switch (dbStatus) {
    'PENDING_PAYMENT' => BookingStatus.pendingPayment,
    'CONFIRMED' => BookingStatus.confirmed,
    'CHECKED_IN' => BookingStatus.checkedIn,
    'COMPLETED' => BookingStatus.completed,
    // REFUNDED, NO_SHOW chưa có trong UI enum cũ → coi như cancelled.
    _ => BookingStatus.cancelled,
  };
}

/// Adapter DTO → UI model (Booking trong shared/mock).
Booking bookingDtoToUi(BookingDto dto) {
  final venue = dto.venue != null
      ? venueDtoToUi(dto.venue!)
      : MockData.venues.firstWhere(
          (v) => v.id == dto.venueId,
          orElse: () => MockData.venues.first,
        );

  return Booking(
    id: dto.id,
    code: dto.code,
    venue: venue,
    courtName: dto.court?.name ?? '—',
    startsAt: DateTime.parse(dto.startsAt).toLocal(),
    endsAt: DateTime.parse(dto.endsAt).toLocal(),
    total: dto.total,
    status: bookingStatusToUi(dto.status),
  );
}

/// MyBookingsNotifier — list booking của customer hiện tại (tab Sắp tới/Hoàn thành/Đã huỷ).
@riverpod
class MyBookingsNotifier extends _$MyBookingsNotifier
    with BaseNotifier<List<Booking>> {
  late BookingsService _service;

  @override
  Future<List<Booking>> build() async {
    _service = BookingsService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<Booking>> _fetch() async {
    if (AppConfig.useMock) return MockData.bookings;
    final list = await _service.mine();
    return list.map(bookingDtoToUi).toList();
  }

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> cancel(String id, {String? reason}) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.cancel(id, CancelBookingRequest(reason: reason));
          }
          return _fetch();
        },
        successMessage: 'Đã huỷ booking',
        errorMessage: 'Huỷ thất bại',
        keepPreviousOnLoading: true,
      );
}

/// Booking detail — family theo id.
@riverpod
Future<Booking> bookingDetail(Ref ref, String id) async {
  if (AppConfig.useMock) {
    return MockData.bookings.firstWhere(
      (b) => b.id == id,
      orElse: () => MockData.bookings.first,
    );
  }
  final service = BookingsService(ref.read(dioProvider));
  final dto = await service.detail(id);
  return bookingDtoToUi(dto);
}

/// Notifier cho luồng book mới: quote → create → return booking.
/// State `AsyncValue<BookingFlowState>`:
///   null → chưa start
///   data(quoted=...) → đã quote, đợi user chọn payment
///   data(created=...) → đã create, có booking + holdToken hết hạn
@riverpod
class BookingFlowNotifier extends _$BookingFlowNotifier
    with BaseNotifier<BookingFlowState?> {
  late BookingsService _service;

  @override
  Future<BookingFlowState?> build() async {
    _service = BookingsService(ref.read(dioProvider));
    return null;
  }

  Future<void> quote({
    required String courtId,
    required DateTime startsAt,
    required DateTime endsAt,
    String? voucherCode,
  }) =>
      runAsync(
        action: () async {
          if (AppConfig.useMock) {
            return BookingFlowState(
              quote: QuoteResponse(
                courtId: courtId,
                startsAt: startsAt.toUtc().toIso8601String(),
                endsAt: endsAt.toUtc().toIso8601String(),
                slots: const [],
                subtotal: 300000,
                discount: 0,
                total: 300000,
                holdToken: 'mock-hold-token',
              ),
            );
          }
          final res = await _service.quote(QuoteRequest(
            courtId: courtId,
            startsAt: startsAt.toUtc().toIso8601String(),
            endsAt: endsAt.toUtc().toIso8601String(),
            voucherCode: voucherCode,
          ));
          return BookingFlowState(quote: res);
        },
        errorMessage: 'Báo giá thất bại',
      );

  Future<Booking?> createFromQuote({String? notes}) async {
    final current = state.value;
    final token = current?.quote?.holdToken;
    if (token == null) return null;

    Booking? created;
    await runAsync(
      action: () async {
        if (AppConfig.useMock) {
          final mock = MockData.bookings.first;
          created = mock;
          return current?.copyWith(booking: mock);
        }
        final dto = await _service.create(
          CreateBookingRequest(holdToken: token, notes: notes),
        );
        final ui = bookingDtoToUi(dto);
        created = ui;
        return current?.copyWith(booking: ui);
      },
      errorMessage: 'Tạo booking thất bại',
      keepPreviousOnLoading: true,
    );
    return created;
  }

  void reset() {
    state = const AsyncData(null);
  }
}

/// State combined cho luồng book.
class BookingFlowState {
  const BookingFlowState({this.quote, this.booking});

  final QuoteResponse? quote;
  final Booking? booking;

  BookingFlowState copyWith({
    QuoteResponse? quote,
    Booking? booking,
  }) =>
      BookingFlowState(
        quote: quote ?? this.quote,
        booking: booking ?? this.booking,
      );
}
