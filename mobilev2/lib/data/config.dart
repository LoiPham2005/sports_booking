/// 🔧 Data layer config — mock toggle + endpoint paths.
///
/// **`useMock`**: bật mock data thay vì gọi API thật. Bật/tắt qua:
/// ```sh
/// fvm flutter run --dart-define=USE_MOCK=false
/// ```
/// Mặc định `true` để dev UI nhanh không cần backend.
///
/// **Pattern dùng**:
/// ```dart
/// if (AppConfig.useMock) {
///   return MockData.venues;
/// }
/// return await getIt<VenuesApi>().list();
/// ```
abstract class AppConfig {
  /// Toggle mock vs real API. Default `true` (mock).
  /// Set `--dart-define=USE_MOCK=false` để gọi API thật.
  static const useMock = bool.fromEnvironment('USE_MOCK', defaultValue: true);
}

/// Cookie/token storage keys — đồng nhất với web (xem
/// `frontend/src/lib/api/config.ts`).
abstract class TokenKeys {
  static const accessToken = 'access_token';
  static const refreshToken = 'refresh_token';
}
