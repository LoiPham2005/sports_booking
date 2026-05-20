import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';

class AppLoggingInterceptor extends Interceptor {
  const AppLoggingInterceptor();

  static const _startTimeKey = 'request_start_time';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (FlavorConfig.instance.enableLogging) {
      options.extra[_startTimeKey] = DateTime.now().millisecondsSinceEpoch;
      Logger.httpRequest(
        options.method,
        options.uri.toString(),
        data: options.data,
      );
    }
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response<dynamic> response, ResponseInterceptorHandler handler) {
    if (FlavorConfig.instance.enableLogging) {
      final startTime = response.requestOptions.extra[_startTimeKey] as int?;
      final duration = startTime != null
          ? Duration(milliseconds: DateTime.now().millisecondsSinceEpoch - startTime)
          : null;

      Logger.httpResponse(
        response.requestOptions.method,
        response.requestOptions.uri.toString(),
        response.statusCode ?? 200,
        data: response.data,
        duration: duration,
      );
    }
    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (FlavorConfig.instance.enableLogging) {
      final startTime = err.requestOptions.extra[_startTimeKey] as int?;
      final duration = startTime != null
          ? Duration(milliseconds: DateTime.now().millisecondsSinceEpoch - startTime)
          : null;

      Logger.httpError(
        err.requestOptions.method,
        err.requestOptions.uri.toString(),
        err.response?.statusCode,
        err.response?.data ?? err.message,
        duration: duration,
      );
    }
    super.onError(err, handler);
  }
}

Interceptor buildLoggingInterceptor() {
  return const AppLoggingInterceptor();
}


// Interceptor buildLoggingInterceptor() {
//   if (!FlavorConfig.instance.enableLogging) {
//     return InterceptorsWrapper();
//   }
//   return PrettyDioLogger(
//     requestHeader: true,
//     requestBody: true,
//     responseHeader: false,
//     responseBody: true,
//     error: true,
//     compact: true,
//     maxWidth: 200,
//   logPrint: (log) {
//     final msg = log.toString();
//     if (msg.startsWith('Request:')) {
//       print('🚀 $msg');
//     } else if (msg.startsWith('│ Body:') || msg.contains('"')) {
//       print('📦 $msg');
//     } else if (msg.startsWith('Response:')) {
//       print('📥 $msg');
//     } else if (msg.startsWith('Error:') || msg.contains('DioError')) {
//       print('❌ $msg');
//     } else {
//       print('🔎 $msg');
//     }
//   },
//   );
// }