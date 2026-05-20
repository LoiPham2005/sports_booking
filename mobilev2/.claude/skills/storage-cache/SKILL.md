---
name: storage-cache
description: Persistence layer — LocalStorageService (SharedPreferences), SecureStorageService (Keychain/Keystore), CacheService (in-memory + TTL), SmartCacheInterceptor (Dio response cache). Đọc khi cần lưu user prefs, token bảo mật, cache list/detail tạm thời, hoặc bật HTTP cache cho GET endpoint.
---

# Storage & Cache

## 📋 3 layer persistence

| Layer | Service | Backend | Use case | Persist qua restart? |
|---|---|---|---|---|
| **Plain prefs** | `LocalStorageService` | shared_preferences | Theme/locale/onboarding flag/JSON small | ✅ |
| **Secure** | `SecureStorageService` | Keychain (iOS) / EncryptedSharedPreferences (Android) | Access token, refresh token, PIN | ✅ |
| **Memory** | `CacheService` | In-process `Map` + TTL | Cache list response, computed data | ❌ (mất khi kill app) |
| **HTTP** | `SmartCacheInterceptor` | In-process Map theo `URL + queryParams` | Cache response GET | ❌ |

→ **Quy tắc chọn**:
- Token, mật khẩu → **Secure** (KHÔNG bao giờ dùng `LocalStorage`)
- User preferences (theme, language, viewed onboarding) → **Local**
- Cache UI khỏi gọi lại server trong session → **Cache** (TTL ngắn) hoặc **SmartCacheInterceptor** (HTTP)

## 💾 LocalStorageService — SharedPreferences wrapper

**Path**: `lib/core/data/storage/local_storage_service.dart`

```dart
final local = getIt<LocalStorageService>();

// Primitives
await local.setString('user_name', 'Loi');
await local.setInt('age', 25);
await local.setBool('onboarded', true);
await local.setDouble('rating', 4.5);

local.getString('user_name');     // String?
local.getInt('age');              // int?
local.getBool('onboarded');       // bool?

// JSON
await local.setJson('user', {'id': 1, 'name': 'Loi'});
final user = local.getJson('user');   // Map<String, dynamic>?

// Generic
await local.remove('age');
await local.clear();
local.containsKey('user_name');
```

### Pattern: Persist user preference (theme)

```dart
@riverpod
class ThemeNotifier extends _$ThemeNotifier {
  static const _key = 'theme_variant';

  @override
  AppThemeVariant build() {
    final saved = getIt<LocalStorageService>().getString(_key);
    return AppThemeVariant.values.firstWhere(
      (v) => v.name == saved,
      orElse: () => AppThemeVariant.light,
    );
  }

  Future<void> set(AppThemeVariant variant) async {
    state = variant;
    await getIt<LocalStorageService>().setString(_key, variant.name);
  }
}
```

> **DI registered as `@LazySingleton`** — auto-inject `SharedPreferences` qua RegisterModule. Đọc `skill: dependency-injection`.

## 🔒 SecureStorageService — Keychain/Keystore wrapper

**Path**: `lib/core/data/storage/secure_storage_service.dart`

```dart
final secure = getIt<SecureStorageService>();

await secure.write('access_token', 'xxx.yyy.zzz');
final token = await secure.read('access_token');    // Future<String?>
await secure.delete('access_token');
await secure.clear();                                // xoá toàn bộ
final has = await secure.containsKey('access_token');
```

### Convenience aliases (đã có)

Trong v2 `SecureStorageService` có wrap method tiện cho auth flow (xem code):
```dart
secure.getAccessToken();   // alias read('access_token')
secure.setAccessToken(t);
secure.getRefreshToken();
secure.setRefreshToken(t);
secure.clearAll();         // dùng khi logout
```

### Pattern: Login flow

```dart
Future<void> login(String email, String password) => runAsync(
      action: () async {
        final res = await _service.login(LoginRequest(...));
        if (!res.isSuccess) throw ServerFailure(res.message ?? 'Lỗi');

        await getIt<SecureStorageService>().setAccessToken(res.data!.accessToken);
        await ref.read(appAuthProvider.notifier).login(res.data!.accessToken);
        return res.data;
      },
      successMessage: 'Đăng nhập thành công',
    );
```

### ⚠️ iOS lưu ý
- Secure data **survive uninstall** trên iOS theo mặc định → có thể leak token khi user re-install. Nếu muốn xoá khi uninstall:
  ```dart
  FlutterSecureStorage(
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
  );
  ```
  (config trong `RegisterModule` ở `lib/core/base/di/register_module.dart`).

## ⚡ CacheService — In-memory + TTL

**Path**: `lib/core/data/cache/cache_service.dart`

```dart
final cache = getIt<CacheService>();

// Set với TTL
cache.set<UserModel>('user_123', user, ttl: 5.minutes);

// Get (null nếu hết hạn hoặc chưa có)
final user = cache.get<UserModel>('user_123');

cache.remove('user_123');
cache.clear();
cache.contains('user_123');   // false khi expired
```

→ **Lifecycle**: chỉ tồn tại trong process. Kill app → mất hết. Khác `LocalStorageService` (persist disk).

### Pattern: Cache repo response trong notifier

```dart
@riverpod
class UserProfileNotifier extends _$UserProfileNotifier
    with BaseNotifier<UserModel> {
  late UserService _service;
  final _cache = getIt<CacheService>();

  @override
  Future<UserModel> build() async {
    _service = UserService(ref.read(dioProvider));
    return _fetch();
  }

  Future<UserModel> _fetch() async {
    final cached = _cache.get<UserModel>('user_profile');
    if (cached != null) return cached;

    final res = await _service.getProfile();
    if (!res.isSuccess || res.data == null) {
      throw ServerFailure(res.message ?? 'Lỗi tải profile');
    }
    _cache.set('user_profile', res.data!, ttl: 10.minutes);
    return res.data!;
  }

  Future<void> refresh() => runAsync(
        action: () {
          _cache.remove('user_profile');
          return _fetch();
        },
        keepPreviousOnLoading: true,
      );
}
```

## 🌐 SmartCacheInterceptor — Dio response cache

**Path**: `lib/core/data/network/interceptors/smart_cache_interceptor.dart`

→ Đã wire vào `DioClient` (đọc `skill: network-error`).

### Cách bật cache cho 1 endpoint

```dart
@GET('/products')
Future<ApiResponse<List<ProductModel>>> getProducts({
  @Header('x-use-cache') bool? useCache,  // ❌ không hoạt động, dùng options:
});

// ✅ Cách đúng: bật qua RequestOptions extra
@GET('/products')
@Extra({'use_cache': true})  // retrofit hỗ trợ
Future<ApiResponse<List<ProductModel>>> getProducts();
```

Hoặc thẳng Dio:
```dart
await dio.get('/products', options: Options(extra: {'use_cache': true}));
```

→ Interceptor:
1. Check `options.method == 'GET'` + `options.extra['use_cache'] == true`
2. Có hit → `handler.resolve(...)` (không gọi network)
3. Miss → gọi network rồi set cache key = `URL + queryParams`
4. TTL mặc định 5 phút (cấu hình trong constructor: `SmartCacheInterceptor(ttl: 10.minutes)`)

### Invalidate cache
Hiện chưa có public API → cần thêm `getIt<SmartCacheInterceptor>().clear()` (nếu register interceptor như LazySingleton) hoặc gọi cache layer thay thế (`CacheService`).

## 🎯 Comparison table

| Cần | Service |
|---|---|
| Lưu token (secure) | `SecureStorageService` |
| Lưu user prefs (theme, locale) | `LocalStorageService` |
| Lưu small JSON (user model offline) | `LocalStorageService.setJson` |
| Cache response trong session | `CacheService` (in-memory) |
| Auto-cache GET API | `SmartCacheInterceptor` (extra: `use_cache`) |
| Cache lớn / queryable (DB) | ❌ Chưa có — phải thêm `drift`/`isar` |

## ❌ Anti-patterns

```dart
// ❌ Lưu token bằng LocalStorageService
await local.setString('access_token', token);  // ⛔ KHÔNG SECURE

// ✅ Dùng SecureStorageService
await secure.setAccessToken(token);

// ❌ JSON encode/decode mỗi lần access
final user = UserModel.fromJson(jsonDecode(local.getString('user')!));

// ✅ Dùng getJson + cache vào CacheService
final cached = cacheService.get<UserModel>('user');
if (cached != null) return cached;
final raw = local.getJson('user');
final user = raw != null ? UserModel.fromJson(raw) : null;
if (user != null) cacheService.set('user', user, ttl: 1.hours);

// ❌ CacheService cho data quan trọng (mất khi kill app)
cache.set('user_token', token);

// ✅ Token = Secure storage
```

## 📂 Files quan trọng

| File | Mục đích |
|---|---|
| `lib/core/data/storage/local_storage_service.dart` | SharedPreferences wrapper |
| `lib/core/data/storage/secure_storage_service.dart` | FlutterSecureStorage wrapper |
| `lib/core/data/cache/cache_service.dart` | In-memory cache + TTL |
| `lib/core/data/network/interceptors/smart_cache_interceptor.dart` | Dio HTTP cache |
| `lib/core/base/di/register_module.dart` | DI module — register SharedPreferences/FlutterSecureStorage |
