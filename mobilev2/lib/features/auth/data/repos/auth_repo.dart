import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:sports_booking_mobile/features/auth/data/services/auth_service.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/auth/data/models/auth_dto.dart';
import 'package:sports_booking_mobile/features/auth/data/models/user_dto.dart';

/// Auth repository — facade chọn mock vs API qua `AppConfig.useMock`.
///
/// Khi API mode: gọi `AuthService` qua DI + lưu token vào `SecureStorageService`.
/// Khi mock mode: trả `UserDto` giả theo identifier suffix:
///   - `admin@*` → ADMIN
///   - `owner@*` → OWNER
///   - `manager@*` → STAFF (sub-role MANAGER do client tự gán)
///   - `staff@*` → STAFF
///   - `super@*` → SUPER_ADMIN
///   - còn lại → CUSTOMER
abstract class AuthRepo {
  AuthRepo._();

  static SecureStorageService get _storage => getIt<SecureStorageService>();

  /// Mock token để test interceptor không null.
  static const _mockAccessToken = 'mock-access-token';
  static const _mockRefreshToken = 'mock-refresh-token';

  static Future<UserDto> login({
    required String identifier,
    required String password,
  }) async {
    if (AppConfig.useMock) {
      final user = _buildMockUser(identifier);
      await _saveTokens(_mockAccessToken, _mockRefreshToken);
      return user;
    }

    final api = getIt<AuthService>();
    final result = await api.login(
      LoginRequest(identifier: identifier, password: password),
    );
    await _saveTokens(result.accessToken, result.refreshToken);
    return result.user;
  }

  static Future<UserDto> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
  }) async {
    if (AppConfig.useMock) {
      final user = UserDto(
        id: 'mock-${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        phone: phone,
        fullName: fullName,
        role: UserRole.customer,
      );
      await _saveTokens(_mockAccessToken, _mockRefreshToken);
      return user;
    }

    final api = getIt<AuthService>();
    final result = await api.register(
      RegisterRequest(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      ),
    );
    await _saveTokens(result.accessToken, result.refreshToken);
    return result.user;
  }

  static Future<void> forgotPassword(String identifier) async {
    if (AppConfig.useMock) return;
    await getIt<AuthService>()
        .forgotPassword(ForgotPasswordRequest(identifier: identifier));
  }

  static Future<void> resetPassword({
    required String identifier,
    required String code,
    required String newPassword,
  }) async {
    if (AppConfig.useMock) return;
    await getIt<AuthService>().resetPassword(
      ResetPasswordRequest(
        identifier: identifier,
        code: code,
        newPassword: newPassword,
      ),
    );
  }

  static Future<UserDto?> me() async {
    if (AppConfig.useMock) {
      // Không có user trong mock state — trả null (chưa login).
      return null;
    }
    final token = await _storage.read(TokenKeys.accessToken);
    if (token == null || token.isEmpty) return null;

    try {
      return await getIt<AuthService>().me();
    } catch (_) {
      return null;
    }
  }

  static Future<void> logout() async {
    if (!AppConfig.useMock) {
      try {
        await getIt<AuthService>().logout();
      } catch (_) {
        // Best-effort — token vẫn clear local kể cả call fail.
      }
    }
    await _storage.delete(TokenKeys.accessToken);
    await _storage.delete(TokenKeys.refreshToken);
  }

  static Future<void> _saveTokens(String access, String refresh) async {
    await _storage.write(TokenKeys.accessToken, access);
    await _storage.write(TokenKeys.refreshToken, refresh);
  }

  static UserDto _buildMockUser(String identifier) {
    final lower = identifier.toLowerCase();
    UserRole role;
    if (lower.startsWith('super@') || lower.contains('superadmin')) {
      role = UserRole.superAdmin;
    } else if (lower.startsWith('admin@')) {
      role = UserRole.admin;
    } else if (lower.startsWith('owner@')) {
      role = UserRole.owner;
    } else if (lower.startsWith('manager@') || lower.startsWith('staff@')) {
      role = UserRole.staff;
    } else {
      role = UserRole.customer;
    }

    return UserDto(
      id: 'mock-${role.name}',
      email: identifier.contains('@') ? identifier : null,
      phone: identifier.contains('@') ? null : identifier,
      fullName: _roleDisplayName(role),
      role: role,
    );
  }

  static String _roleDisplayName(UserRole role) => switch (role) {
        UserRole.customer => 'Demo Customer',
        UserRole.owner => 'Demo Owner',
        UserRole.staff => 'Demo Staff',
        UserRole.admin => 'Demo Admin',
        UserRole.superAdmin => 'Demo Super Admin',
      };
}
