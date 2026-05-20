import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';

class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    this.maxRetries = 2,
    this.retryDelay = const Duration(seconds: 1),
  });

  final int maxRetries;
  final Duration retryDelay;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final attempt = (err.requestOptions.extra['retry_attempt'] as int?) ?? 0;
    final shouldRetry = _shouldRetry(err) && attempt < maxRetries;

    if (!shouldRetry) return handler.next(err);

    final nextAttempt = attempt + 1;
    Logger.warning('Retry attempt $nextAttempt → ${err.requestOptions.uri}');

    await Future<void>.delayed(retryDelay * nextAttempt);

    try {
      final options = err.requestOptions
        ..extra['retry_attempt'] = nextAttempt;
      final dio = Dio();
      final response = await dio.fetch<dynamic>(options);
      return handler.resolve(response);
    } catch (e) {
      return handler.next(err);
    }
  }

  bool _shouldRetry(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return true;
      case DioExceptionType.badResponse:
        final code = err.response?.statusCode ?? 0;
        return code >= 500;
      default:
        return false;
    }
  }
}
