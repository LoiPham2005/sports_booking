import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/court_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';

part 'booking_dto.freezed.dart';
part 'booking_dto.g.dart';

/// BookingDto — khớp Prisma `Booking` model.
/// `status` là string (9 giá trị): PENDING_PAYMENT/CONFIRMED/CHECKED_IN/
/// COMPLETED/CANCELLED_BY_USER/CANCELLED_BY_OWNER/CANCELLED_TIMEOUT/
/// NO_SHOW/REFUNDED. UI gộp lại 5 status qua `bookingStatusToUi()`.
@freezed
abstract class BookingDto with _$BookingDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory BookingDto({
    required String id,
    required String code,
    required String userId,
    required String courtId,
    required String venueId,
    required String startsAt,
    required String endsAt,
    required String status,
    @Default('ONLINE') String source,
    @Default(0) int subtotal,
    @Default(0) int discount,
    @Default(0) int total,
    String? voucherId,
    String? notes,
    String? checkInToken,
    String? checkedInAt,
    String? cancelledAt,
    String? cancelReason,
    int? refundAmount,
    required String createdAt,
    String? updatedAt,
    CourtDto? court,
    VenueDto? venue,
  }) = _BookingDto;

  factory BookingDto.fromJson(Map<String, dynamic> json) =>
      _$BookingDtoFromJson(json);
}

/// Body cho `POST /bookings/quote`.
@freezed
abstract class QuoteRequest with _$QuoteRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory QuoteRequest({
    required String courtId,
    required String startsAt,
    required String endsAt,
    String? voucherCode,
  }) = _QuoteRequest;

  factory QuoteRequest.fromJson(Map<String, dynamic> json) =>
      _$QuoteRequestFromJson(json);
}

/// Response `POST /bookings/quote` — gồm holdToken + breakdown từng slot.
@freezed
abstract class QuoteResponse with _$QuoteResponse {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory QuoteResponse({
    required String courtId,
    required String startsAt,
    required String endsAt,
    @Default([]) List<QuoteSlot> slots,
    @Default(0) int subtotal,
    @Default(0) int discount,
    @Default(0) int total,
    String? voucherCode,
    required String holdToken,
  }) = _QuoteResponse;

  factory QuoteResponse.fromJson(Map<String, dynamic> json) =>
      _$QuoteResponseFromJson(json);
}

@freezed
abstract class QuoteSlot with _$QuoteSlot {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory QuoteSlot({
    required String startsAt,
    required String endsAt,
    @Default(0) int price,
  }) = _QuoteSlot;

  factory QuoteSlot.fromJson(Map<String, dynamic> json) =>
      _$QuoteSlotFromJson(json);
}

/// Body cho `POST /bookings` — tạo booking từ holdToken (đã quote trước).
@freezed
abstract class CreateBookingRequest with _$CreateBookingRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CreateBookingRequest({
    required String holdToken,
    String? notes,
  }) = _CreateBookingRequest;

  factory CreateBookingRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateBookingRequestFromJson(json);
}

/// Body cho `POST /bookings/:id/cancel`.
@freezed
abstract class CancelBookingRequest with _$CancelBookingRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CancelBookingRequest({
    String? reason,
  }) = _CancelBookingRequest;

  factory CancelBookingRequest.fromJson(Map<String, dynamic> json) =>
      _$CancelBookingRequestFromJson(json);
}
