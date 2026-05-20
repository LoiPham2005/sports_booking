import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_auth_notifier.g.dart';

class AppAuthState {
  const AppAuthState({required this.isAuthenticated});

  factory AppAuthState.initial() => const AppAuthState(isAuthenticated: false);

  final bool isAuthenticated;

  AppAuthState copyWith({bool? isAuthenticated}) =>
      AppAuthState(isAuthenticated: isAuthenticated ?? this.isAuthenticated);
}

@Riverpod(keepAlive: true)
class AppAuthNotifier extends _$AppAuthNotifier {
  static const _tokenKey = 'access_token';

  @override
  AppAuthState build() {
    _restoreSession();
    return AppAuthState.initial();
  }

  Future<void> _restoreSession() async {
    final storage = getIt<SecureStorageService>();
    final token = await storage.read(_tokenKey);
    state = state.copyWith(isAuthenticated: token != null && token.isNotEmpty);
  }

  Future<void> login(String token) async {
    final storage = getIt<SecureStorageService>();
    await storage.write(_tokenKey, token);
    state = state.copyWith(isAuthenticated: true);
  }

  Future<void> logout() async {
    final storage = getIt<SecureStorageService>();
    await storage.clear();
    state = state.copyWith(isAuthenticated: false);
  }
}
