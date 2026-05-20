import 'package:equatable/equatable.dart';

sealed class Failure extends Equatable {
  const Failure(this.message, {this.code});

  final String message;
  final int? code;

  @override
  List<Object?> get props => [message, code];
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Không có kết nối mạng']);
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.code});
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Lỗi cache']);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'Phiên đăng nhập đã hết hạn'])
      : super(code: 401);
}

class ValidationFailure extends Failure {
  const ValidationFailure(
    super.message, {
    this.errors = const {},
  });

  final Map<String, List<String>> errors;

  @override
  List<Object?> get props => [message, errors];
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Đã xảy ra lỗi không xác định']);
}
