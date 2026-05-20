import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_dto.freezed.dart';
part 'user_dto.g.dart';

/// 5 role toàn cục — khớp với `Role` enum ở backend Prisma schema.
/// VenueMember.role (MANAGER/STAFF) là sub-role per venue, không nằm ở đây.
enum UserRole {
  @JsonValue('CUSTOMER')
  customer,
  @JsonValue('OWNER')
  owner,
  @JsonValue('STAFF')
  staff,
  @JsonValue('ADMIN')
  admin,
  @JsonValue('SUPER_ADMIN')
  superAdmin,
}

enum UserAccountStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('SUSPENDED')
  suspended,
  @JsonValue('DELETED')
  deleted,
}

@freezed
abstract class UserDto with _$UserDto {
  // Backend trả camelCase nguyên gốc (không snake) — không set fieldRename.
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory UserDto({
    required String id,
    String? email,
    String? phone,
    required String fullName,
    String? avatarUrl,
    required UserRole role,
    @Default(UserAccountStatus.active) UserAccountStatus status,
    @Default('vi') String locale,
    String? createdAt,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) =>
      _$UserDtoFromJson(json);
}
