import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._secureStorage);

  static const _tokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  final SecureStorageService _secureStorage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _secureStorage.read(_tokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        try {
          final retryResponse = await _retryRequest(err.requestOptions);
          return handler.resolve(retryResponse);
        } catch (_) {}
      }
      await _secureStorage.delete(_tokenKey);
      await _secureStorage.delete(_refreshTokenKey);
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    return false;
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions options) async {
    final dio = Dio();
    return dio.fetch<dynamic>(options);
  }
}
