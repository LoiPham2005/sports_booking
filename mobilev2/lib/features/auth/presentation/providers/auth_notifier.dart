import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/base/errors/failures.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:sports_booking_mobile/features/auth/data/models/auth_dto.dart';
import 'package:sports_booking_mobile/features/auth/data/models/user_dto.dart';
import 'package:sports_booking_mobile/features/auth/data/services/auth_service.dart';

part 'auth_notifier.g.dart';

/// Global auth state — current logged-in user (hoặc null).
///
/// State `AsyncValue<UserDto?>`:
/// - `AsyncData(null)`  → guest (chưa login / đã logout)
/// - `AsyncData(user)`  → đã login
/// - `AsyncLoading`     → submit form đang chạy / restore session lần đầu
/// - `AsyncError`       → submit lỗi (toast tự hiện qua `useAsyncValueChange`)
///
/// Pattern theo `lib/features/_reference/voucher/` (BaseNotifier + runAsync).
/// `keepAlive: true` để user state survive khi navigate giữa pages.
///
/// Mock mode (`AppConfig.useMock`): không gọi API, tạo `UserDto` từ
/// identifier prefix (admin@/owner@/manager@/staff@/super@/...).
@Riverpod(keepAlive: true)
class AuthNotifier extends _$AuthNotifier with BaseNotifier<UserDto?> {
  late AuthService _service;
  late SecureStorageService _storage;

  @override
  Future<UserDto?> build() async {
    _service = AuthService(ref.read(dioProvider));
    _storage = getIt<SecureStorageService>();

    // Restore session khi app boot — nếu có token thì fetch /me.
    if (AppConfig.useMock) return null;

    final token = await _storage.read(TokenKeys.accessToken);
    if (token == null || token.isEmpty) return null;

    try {
      return await _service.me();
    } catch (_) {
      return null;
    }
  }

  Future<void> login({
    required String identifier,
    required String password,
  }) =>
      runAsync(
        action: () async {
          if (AppConfig.useMock) {
            await _saveTokens(_mockAccessToken, _mockRefreshToken);
            return _buildMockUser(identifier);
          }
          final result = await _service.login(
            LoginRequest(identifier: identifier, password: password),
          );
          await _saveTokens(result.accessToken, result.refreshToken);
          return result.user;
        },
        errorMessage: 'Đăng nhập thất bại',
      );

  Future<void> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
  }) =>
      runAsync(
        action: () async {
          if (AppConfig.useMock) {
            await _saveTokens(_mockAccessToken, _mockRefreshToken);
            return UserDto(
              id: 'mock-${DateTime.now().millisecondsSinceEpoch}',
              email: email,
              phone: phone,
              fullName: fullName,
              role: UserRole.customer,
            );
          }
          final result = await _service.register(
            RegisterRequest(
              fullName: fullName,
              email: email,
              phone: phone,
              password: password,
            ),
          );
          await _saveTokens(result.accessToken, result.refreshToken);
          return result.user;
        },
        successMessage: 'Đăng ký thành công',
        errorMessage: 'Đăng ký thất bại',
      );

  /// Gửi mã OTP qua email/SMS. KHÔNG đổi state user (giữ nguyên).
  Future<void> forgotPassword(String identifier) => runAsync(
        action: () async {
          if (AppConfig.useMock) return state.value;
          await _service.forgotPassword(
            ForgotPasswordRequest(identifier: identifier),
          );
          return state.value;
        },
        successMessage: 'Đã gửi mã OTP',
        errorMessage: 'Gửi OTP thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> resetPassword({
    required String identifier,
    required String code,
    required String newPassword,
  }) =>
      runAsync(
        action: () async {
          if (AppConfig.useMock) return state.value;
          await _service.resetPassword(
            ResetPasswordRequest(
              identifier: identifier,
              code: code,
              newPassword: newPassword,
            ),
          );
          return state.value;
        },
        successMessage: 'Đặt lại mật khẩu thành công',
        errorMessage: 'Đặt lại mật khẩu thất bại',
        keepPreviousOnLoading: true,
      );

  /// Best-effort logout — clear token kể cả khi API call fail.
  Future<void> logout() => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            try {
              await _service.logout();
            } catch (_) {/* clear local kể cả khi backend fail */}
          }
          await _storage.delete(TokenKeys.accessToken);
          await _storage.delete(TokenKeys.refreshToken);
          return null;
        },
      );

  Future<void> _saveTokens(String access, String refresh) async {
    await _storage.write(TokenKeys.accessToken, access);
    await _storage.write(TokenKeys.refreshToken, refresh);
  }

  // ── Mock helpers ──────────────────────────────────────────
  static const _mockAccessToken = 'mock-access-token';
  static const _mockRefreshToken = 'mock-refresh-token';

  UserDto _buildMockUser(String identifier) {
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
      fullName: switch (role) {
        UserRole.customer => 'Demo Customer',
        UserRole.owner => 'Demo Owner',
        UserRole.staff => 'Demo Staff',
        UserRole.admin => 'Demo Admin',
        UserRole.superAdmin => 'Demo Super Admin',
      },
      role: role,
    );
  }
}

/// Convenience cho các page check auth nhanh:
/// `final user = ref.watch(currentUserProvider);`
@Riverpod(keepAlive: true)
UserDto? currentUser(Ref ref) => ref.watch(authProvider).value;
