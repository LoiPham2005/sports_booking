import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/base/errors/exceptions.dart';
import 'package:sports_booking_mobile/core/data/network/network_info.dart';

class NetworkCheckInterceptor extends Interceptor {
  NetworkCheckInterceptor(this._info);

  final NetworkInfo _info;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final connected = await _info.isConnected;
    if (!connected) {
      return handler.reject(
        DioException(
          requestOptions: options,
          error: NetworkException('Không có kết nối mạng'),
          type: DioExceptionType.connectionError,
        ),
      );
    }
    handler.next(options);
  }
}
