import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/data/dto/user_dto.dart';

part 'auth_dto.freezed.dart';
part 'auth_dto.g.dart';

/// Response của `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`.
@freezed
abstract class AuthResultDto with _$AuthResultDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory AuthResultDto({
    required String accessToken,
    required String refreshToken,
    required UserDto user,
  }) = _AuthResultDto;

  factory AuthResultDto.fromJson(Map<String, dynamic> json) =>
      _$AuthResultDtoFromJson(json);
}

/// Body cho `POST /auth/login`.
/// `identifier` = email HOẶC phone (backend tự detect).
@freezed
abstract class LoginRequest with _$LoginRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory LoginRequest({
    required String identifier,
    required String password,
  }) = _LoginRequest;

  factory LoginRequest.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestFromJson(json);
}

/// Body cho `POST /auth/register`.
/// Cần ít nhất 1 trong email/phone.
@freezed
abstract class RegisterRequest with _$RegisterRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory RegisterRequest({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    @Default('vi') String locale,
  }) = _RegisterRequest;

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestFromJson(json);
}

@freezed
abstract class ForgotPasswordRequest with _$ForgotPasswordRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory ForgotPasswordRequest({
    required String identifier,
  }) = _ForgotPasswordRequest;

  factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) =>
      _$ForgotPasswordRequestFromJson(json);
}

@freezed
abstract class ResetPasswordRequest with _$ResetPasswordRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory ResetPasswordRequest({
    required String identifier,
    required String code,
    required String newPassword,
  }) = _ResetPasswordRequest;

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) =>
      _$ResetPasswordRequestFromJson(json);
}

@freezed
abstract class RefreshTokenRequest with _$RefreshTokenRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory RefreshTokenRequest({
    required String refreshToken,
  }) = _RefreshTokenRequest;

  factory RefreshTokenRequest.fromJson(Map<String, dynamic> json) =>
      _$RefreshTokenRequestFromJson(json);
}

/// Endpoint chung trả `{ ok: true }` (forgot/reset password, etc.).
@freezed
abstract class OkResponse with _$OkResponse {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory OkResponse({
    @Default(true) bool ok,
  }) = _OkResponse;

  factory OkResponse.fromJson(Map<String, dynamic> json) =>
      _$OkResponseFromJson(json);
}
