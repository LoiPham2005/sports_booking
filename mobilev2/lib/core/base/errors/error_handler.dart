import 'dart:io';

import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/base/errors/exceptions.dart';
import 'package:sports_booking_mobile/core/base/errors/failures.dart';

abstract class ErrorHandler {
  static Failure handle(Object error) {
    if (error is Failure) return error;
    if (error is UnauthorizedException) {
      return UnauthorizedFailure(error.message ?? 'Phiên đã hết hạn');
    }
    if (error is ServerException) {
      return ServerFailure(
        error.message ?? 'Lỗi server',
        code: error.code,
      );
    }
    if (error is ValidationException) {
      return ValidationFailure(
        error.message ?? 'Dữ liệu không hợp lệ',
        errors: error.errors,
      );
    }
    if (error is NetworkException) return const NetworkFailure();
    if (error is CacheException) return const CacheFailure();
    if (error is SocketException) return const NetworkFailure();
    if (error is DioException) return _fromDio(error);
    return UnknownFailure(error.toString());
  }

  static Failure _fromDio(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const NetworkFailure('Kết nối quá hạn');
      case DioExceptionType.connectionError:
        return const NetworkFailure();
      case DioExceptionType.badResponse:
        final code = e.response?.statusCode;
        if (code == 401) return const UnauthorizedFailure();
        return ServerFailure(
          _extractMessage(e.response?.data) ?? 'Lỗi server',
          code: code,
        );
      case DioExceptionType.cancel:
        return const UnknownFailure('Yêu cầu bị huỷ');
      case DioExceptionType.badCertificate:
      case DioExceptionType.unknown:
        return UnknownFailure(e.message ?? 'Lỗi không xác định');
    }
  }

  static String? _extractMessage(Object? data) {
    if (data is Map) {
      final msg = data['message'] ?? data['error'] ?? data['errors'];
      if (msg is String) return msg;
    }
    return null;
  }
}
