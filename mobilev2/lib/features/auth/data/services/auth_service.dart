import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/auth/data/models/auth_dto.dart';
import 'package:sports_booking_mobile/features/auth/data/models/user_dto.dart';

part 'auth_service.g.dart';

/// Retrofit service mapping `/auth/*` + `/me`.
///
/// Inject qua DI:
/// ```dart
/// final api = getIt<AuthService>();
/// final result = await api.login(LoginRequest(identifier: '...', password: '...'));
/// ```
@RestApi()
@LazySingleton()
abstract class AuthService {
  @factoryMethod
  factory AuthService(Dio dio) = _AuthService;

  @POST('/auth/login')
  Future<AuthResultDto> login(@Body() LoginRequest body);

  @POST('/auth/register')
  Future<AuthResultDto> register(@Body() RegisterRequest body);

  @POST('/auth/refresh')
  Future<AuthResultDto> refresh(@Body() RefreshTokenRequest body);

  @POST('/auth/logout')
  Future<void> logout();

  @POST('/auth/forgot-password')
  Future<OkResponse> forgotPassword(@Body() ForgotPasswordRequest body);

  @POST('/auth/reset-password')
  Future<OkResponse> resetPassword(@Body() ResetPasswordRequest body);

  @GET('/me')
  Future<UserDto> me();
}
