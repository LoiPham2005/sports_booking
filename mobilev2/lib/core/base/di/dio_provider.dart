import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'dio_provider.g.dart';

@Riverpod(keepAlive: true)
Dio dio(Ref ref) => getIt<Dio>();
