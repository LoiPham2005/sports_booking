import 'package:flutter/foundation.dart';
import 'package:sports_booking_mobile/core/base/di/global_providers.dart';
import 'package:sports_booking_mobile/core/services/app_auth/app_auth_notifier.dart';

/// ChangeNotifier dùng làm `refreshListenable` cho GoRouter.
/// Lắng nghe state auth qua `globalContainer` (Riverpod) — khi đổi → notify
/// để GoRouter chạy lại `redirect` (auth guard).
class AuthRefreshNotifier extends ChangeNotifier {
  AuthRefreshNotifier() {
    _subscription = globalContainer.listen<AppAuthState>(
      appAuthProvider,
      (_, _) => notifyListeners(),
    );
  }

  late final dynamic _subscription;

  @override
  void dispose() {
    // ignore: avoid_dynamic_calls
    _subscription.close();
    super.dispose();
  }
}
