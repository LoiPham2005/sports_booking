abstract class RouteNames {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';

  static const String main = '/';
  static const String home = '/home';
  static const String settings = '/settings';

  // Reference feature
  static const String voucherList = '/vouchers';
  static const String voucherDetail = '/vouchers/:id';
  static String voucherDetailPath(String id) => '/vouchers/$id';
}
