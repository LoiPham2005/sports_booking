abstract class ApiEndpoints {
  // Auth
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refresh = '/auth/refresh';
  static const String register = '/auth/register';
  static const String me = '/auth/me';

  // Voucher (reference feature)
  static const String vouchers = '/vouchers';
  static String voucherDetail(String id) => '/vouchers/$id';
  static const String voucherSearch = '/vouchers/search';
}
