import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';

/// JWT Bearer auth + auto-refresh interceptor.
///
/// Flow:
///   - Mỗi request không phải public endpoint: gắn `Authorization: Bearer <accessToken>`.
///   - Response 401 → gọi `POST /auth/refresh` với `refreshToken` body.
///     - Refresh OK → save token mới + retry request gốc 1 lần.
///     - Refresh fail → clear tokens (user phải login lại).
///   - Skip refresh cho `/auth/refresh` (tránh loop) + endpoint đã retry rồi.
///
/// Khác với web (cookie-based): mobile gửi refresh token trong body vì
/// `flutter_secure_storage` lưu local, không có cookie management.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._secureStorage);

  final SecureStorageService _secureStorage;

  /// Tránh đa refresh đồng thời khi nhiều request 401 cùng lúc.
  static Future<bool>? _refreshFuture;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (_isPublicEndpoint(options.path)) {
      return handler.next(options);
    }

    final token = await _secureStorage.read(TokenKeys.accessToken);
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
    final shouldRefresh = err.response?.statusCode == 401 &&
        !_isPublicEndpoint(err.requestOptions.path) &&
        !err.requestOptions.path.contains('/auth/refresh') &&
        err.requestOptions.extra['_retried'] != true;

    if (!shouldRefresh) return handler.next(err);

    final refreshed = await _ensureRefreshed();
    if (!refreshed) {
      await _clearTokens();
      return handler.next(err);
    }

    try {
      final newToken = await _secureStorage.read(TokenKeys.accessToken);
      err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
      err.requestOptions.extra['_retried'] = true;

      final retryDio =
          Dio(BaseOptions(baseUrl: FlavorConfig.current.apiBaseUrl));
      final response = await retryDio.fetch<dynamic>(err.requestOptions);
      return handler.resolve(response);
    } catch (retryErr) {
      Logger.warning('Retry after refresh failed: $retryErr', tag: 'AUTH');
      return handler.next(err);
    }
  }

  Future<bool> _ensureRefreshed() {
    return _refreshFuture ??= _doRefresh().whenComplete(() {
      _refreshFuture = null;
    });
  }

  Future<bool> _doRefresh() async {
    try {
      final refreshToken = await _secureStorage.read(TokenKeys.refreshToken);
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final dio = Dio(BaseOptions(
        baseUrl: FlavorConfig.current.apiBaseUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ));
      final res = await dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = res.data;
      if (data == null) return false;

      final newAccess = data['accessToken'] as String?;
      final newRefresh = data['refreshToken'] as String?;
      if (newAccess == null) return false;

      await _secureStorage.write(TokenKeys.accessToken, newAccess);
      if (newRefresh != null) {
        await _secureStorage.write(TokenKeys.refreshToken, newRefresh);
      }
      Logger.info('Token refreshed', tag: 'AUTH');
      return true;
    } catch (e) {
      Logger.warning('Refresh token failed: $e', tag: 'AUTH');
      return false;
    }
  }

  Future<void> _clearTokens() async {
    await _secureStorage.delete(TokenKeys.accessToken);
    await _secureStorage.delete(TokenKeys.refreshToken);
  }

  /// Public endpoint không cần token + không retry refresh.
  bool _isPublicEndpoint(String path) {
    return path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/auth/refresh') ||
        path.contains('/auth/forgot-password') ||
        path.contains('/auth/reset-password') ||
        path.contains('/auth/otp/') ||
        path.contains('/health');
  }
}
