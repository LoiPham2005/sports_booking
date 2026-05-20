import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/base/di/injection.config.dart';
import 'package:sports_booking_mobile/core/data/network/dio_client.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

final GetIt getIt = GetIt.instance;

@InjectableInit(
  initializerName: 'init',
  preferRelativeImports: false,
  asExtension: true,
)
Future<void> configureDependencies({String? environment}) =>
    getIt.init(environment: environment);

Future<void> resetAndReinitDependencies({String? environment}) async {
  await getIt.reset(dispose: true);
  await configureDependencies(environment: environment);
}

@module
abstract class RegisterModule {
  @preResolve
  Future<SharedPreferences> get sharedPreferences =>
      SharedPreferences.getInstance();

  @lazySingleton
  FlutterSecureStorage get secureStorage => const FlutterSecureStorage(
        aOptions: AndroidOptions(),
        iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
      );

  @lazySingleton
  InternetConnection get internetConnection => InternetConnection.createInstance(
        checkInterval: const Duration(seconds: 10),
      );

  @lazySingleton
  Dio dio(DioClient client) => client.dio;

  // FirebaseRemoteConfig: KHÔNG register qua DI — services tự lazy resolve trong
  // `initialize()` để tránh crash khi Firebase chưa initializeApp xong.
  // Xem AdConfigService / AppConfigService.
}
