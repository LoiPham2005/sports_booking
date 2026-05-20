import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/data/network/interceptors/auth_interceptor.dart';
import 'package:sports_booking_mobile/core/data/network/interceptors/logging_interceptor.dart';
import 'package:sports_booking_mobile/core/data/network/interceptors/network_check_interceptor.dart';
import 'package:sports_booking_mobile/core/data/network/interceptors/retry_interceptor.dart';
import 'package:sports_booking_mobile/core/data/network/interceptors/smart_cache_interceptor.dart';
import 'package:sports_booking_mobile/core/data/network/network_info.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:injectable/injectable.dart';

@LazySingleton()
class DioClient {
  DioClient(NetworkInfo info, SecureStorageService secureStorage)
      : dio = Dio(
          BaseOptions(
            baseUrl: FlavorConfig.current.apiBaseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            sendTimeout: const Duration(seconds: 30),
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            responseType: ResponseType.json,
          ),
        ) {
    dio.interceptors.addAll([
      SmartCacheInterceptor(),
      AuthInterceptor(secureStorage),
      RetryInterceptor(),
      NetworkCheckInterceptor(info),
      buildLoggingInterceptor(),
    ]);
  }

  final Dio dio;
}
