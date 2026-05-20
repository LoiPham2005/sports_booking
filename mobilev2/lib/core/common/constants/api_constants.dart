abstract class ApiConstants {
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  static const String headerAuth = 'Authorization';
  static const String headerLang = 'Accept-Language';
  static const String headerContentType = 'Content-Type';
  static const String contentTypeJson = 'application/json';
}
