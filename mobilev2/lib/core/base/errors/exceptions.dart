class ServerException implements Exception {
  ServerException({this.code, this.message, this.data});

  final int? code;
  final String? message;
  final Object? data;

  @override
  String toString() => 'ServerException(code: $code, message: $message)';
}

class NetworkException implements Exception {
  NetworkException([this.message]);
  final String? message;
}

class CacheException implements Exception {
  CacheException([this.message]);
  final String? message;
}

class UnauthorizedException implements Exception {
  UnauthorizedException([this.message]);
  final String? message;
}

class ValidationException implements Exception {
  ValidationException(this.errors, [this.message]);
  final Map<String, List<String>> errors;
  final String? message;
}
