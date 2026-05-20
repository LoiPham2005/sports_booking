import 'package:freezed_annotation/freezed_annotation.dart';

part 'staff_dto.freezed.dart';
part 'staff_dto.g.dart';

@freezed
abstract class StaffMemberDto with _$StaffMemberDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory StaffMemberDto({
    required String id,
    required String venueId,
    String? userId,
    String? email,
    @Default('STAFF') String role, // MANAGER | STAFF
    @Default('PENDING') String inviteStatus, // PENDING | ACTIVE | SUSPENDED | REMOVED
    String? inviteToken,
    String? inviteExpiresAt,
    required String createdAt,
    String? acceptedAt,
    required StaffVenueInline venue,
    StaffUserInline? user,
  }) = _StaffMemberDto;

  factory StaffMemberDto.fromJson(Map<String, dynamic> json) =>
      _$StaffMemberDtoFromJson(json);
}

@freezed
abstract class StaffVenueInline with _$StaffVenueInline {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory StaffVenueInline({
    required String id,
    required String name,
  }) = _StaffVenueInline;

  factory StaffVenueInline.fromJson(Map<String, dynamic> json) =>
      _$StaffVenueInlineFromJson(json);
}

@freezed
abstract class StaffUserInline with _$StaffUserInline {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory StaffUserInline({
    required String id,
    required String fullName,
    String? email,
    String? phone,
    String? avatarUrl,
  }) = _StaffUserInline;

  factory StaffUserInline.fromJson(Map<String, dynamic> json) =>
      _$StaffUserInlineFromJson(json);
}

@freezed
abstract class InviteStaffRequest with _$InviteStaffRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory InviteStaffRequest({
    required String email,
    required String venueId,
    @Default('STAFF') String role, // MANAGER | STAFF
  }) = _InviteStaffRequest;

  factory InviteStaffRequest.fromJson(Map<String, dynamic> json) =>
      _$InviteStaffRequestFromJson(json);
}

@freezed
abstract class UpdateStaffRequest with _$UpdateStaffRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory UpdateStaffRequest({
    String? role,
    String? inviteStatus,
  }) = _UpdateStaffRequest;

  factory UpdateStaffRequest.fromJson(Map<String, dynamic> json) =>
      _$UpdateStaffRequestFromJson(json);
}
