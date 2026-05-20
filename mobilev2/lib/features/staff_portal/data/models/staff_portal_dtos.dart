import 'package:freezed_annotation/freezed_annotation.dart';

part 'staff_portal_dtos.freezed.dart';
part 'staff_portal_dtos.g.dart';

/// Slim membership info để biết user là MANAGER hay STAFF ở venue nào.
@freezed
abstract class MembershipDto with _$MembershipDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory MembershipDto({
    required String id,
    required String venueId,
    required String role, // MANAGER | STAFF
    required MembershipVenueInline venue,
  }) = _MembershipDto;

  factory MembershipDto.fromJson(Map<String, dynamic> json) =>
      _$MembershipDtoFromJson(json);
}

@freezed
abstract class MembershipVenueInline with _$MembershipVenueInline {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory MembershipVenueInline({
    required String id,
    required String name,
  }) = _MembershipVenueInline;

  factory MembershipVenueInline.fromJson(Map<String, dynamic> json) =>
      _$MembershipVenueInlineFromJson(json);
}

// ─── Revenue (Manager-only) ───

@freezed
abstract class RevenueResponse with _$RevenueResponse {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory RevenueResponse({
    required String date,
    @Default(0) int revenue,
    @Default(0) int bookings,
    @Default(0) int totalSlots,
    @Default([]) List<RevenueByHour> byHour,
    @Default([]) List<RevenueByCourt> byCourt,
  }) = _RevenueResponse;

  factory RevenueResponse.fromJson(Map<String, dynamic> json) =>
      _$RevenueResponseFromJson(json);
}

@freezed
abstract class RevenueByHour with _$RevenueByHour {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory RevenueByHour({
    required int hour,
    @Default(0) int total,
    @Default(0) int count,
  }) = _RevenueByHour;

  factory RevenueByHour.fromJson(Map<String, dynamic> json) =>
      _$RevenueByHourFromJson(json);
}

@freezed
abstract class RevenueByCourt with _$RevenueByCourt {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory RevenueByCourt({
    required String courtId,
    required String courtName,
    @Default(0) int total,
    @Default(0) int count,
  }) = _RevenueByCourt;

  factory RevenueByCourt.fromJson(Map<String, dynamic> json) =>
      _$RevenueByCourtFromJson(json);
}

// ─── Price Override (Manager-only) ───

@freezed
abstract class PriceOverrideDto with _$PriceOverrideDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PriceOverrideDto({
    required String id,
    required String courtId,
    required String date,
    required String startTime,
    required String endTime,
    @Default(0) int price,
    String? reason,
    required PriceOverrideCourtInline court,
  }) = _PriceOverrideDto;

  factory PriceOverrideDto.fromJson(Map<String, dynamic> json) =>
      _$PriceOverrideDtoFromJson(json);
}

@freezed
abstract class PriceOverrideCourtInline with _$PriceOverrideCourtInline {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PriceOverrideCourtInline({
    required String id,
    required String name,
  }) = _PriceOverrideCourtInline;

  factory PriceOverrideCourtInline.fromJson(Map<String, dynamic> json) =>
      _$PriceOverrideCourtInlineFromJson(json);
}

@freezed
abstract class CreatePriceOverrideRequest with _$CreatePriceOverrideRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CreatePriceOverrideRequest({
    required String courtId,
    required String date,
    required String startTime,
    required String endTime,
    required int price,
    String? reason,
  }) = _CreatePriceOverrideRequest;

  factory CreatePriceOverrideRequest.fromJson(Map<String, dynamic> json) =>
      _$CreatePriceOverrideRequestFromJson(json);
}

/// Body cho `POST /staff/check-in`.
@freezed
abstract class CheckInRequest with _$CheckInRequest {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory CheckInRequest({
    required String token,
  }) = _CheckInRequest;

  factory CheckInRequest.fromJson(Map<String, dynamic> json) =>
      _$CheckInRequestFromJson(json);
}
