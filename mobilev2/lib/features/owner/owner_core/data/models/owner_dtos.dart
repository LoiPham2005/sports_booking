import 'package:freezed_annotation/freezed_annotation.dart';

part 'owner_dtos.freezed.dart';
part 'owner_dtos.g.dart';

// ─── Venue create ───

@freezed
abstract class CreateVenueRequest with _$CreateVenueRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CreateVenueRequest({
    required String name,
    required String addressLine,
    required String city,
    String? district,
    String? ward,
    String? newCity,
    String? newWard,
    String? provinceCode,
    String? wardCode,
    double? lat,
    double? lng,
    String? phone,
    String? description,
  }) = _CreateVenueRequest;

  factory CreateVenueRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateVenueRequestFromJson(json);
}

// ─── Walk-in booking ───

@freezed
abstract class CreateWalkInRequest with _$CreateWalkInRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CreateWalkInRequest({
    required String courtId,
    required String startsAt,
    required String endsAt,
    required int total,
    String? customerName,
    String? customerPhone,
  }) = _CreateWalkInRequest;

  factory CreateWalkInRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateWalkInRequestFromJson(json);
}

// ─── Refuse booking ───

@freezed
abstract class RefuseBookingRequest with _$RefuseBookingRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory RefuseBookingRequest({String? reason}) = _RefuseBookingRequest;

  factory RefuseBookingRequest.fromJson(Map<String, dynamic> json) =>
      _$RefuseBookingRequestFromJson(json);
}
