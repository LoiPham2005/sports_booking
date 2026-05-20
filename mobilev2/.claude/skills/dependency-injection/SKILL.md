---
name: dependency-injection
description: get_it + injectable DI pattern. Đọc khi tạo service mới, register dependency, hoặc gặp lỗi "Type X is not registered". KHÔNG dùng Provider/InheritedWidget cho DI.
---

# Dependency Injection — get_it + injectable

## 🎯 Setup

**Path**: `lib/core/base/di/injection.dart`

```dart
final GetIt getIt = GetIt.instance;

@InjectableInit(
  initializerName: 'init',
  preferRelativeImports: false,
  asExtension: true,
)
Future<void> configureDependencies({String? environment}) =>
    getIt.init(environment: environment);

Future<void> resetAndReinitDependencies({String? environment}) async {
  await getIt.reset(dispose: true);
  await configureDependencies(environment: environment);
}
```

→ Gọi 1 lần ở `AppInitializer.initialize()`:
```dart
await configureDependencies(environment: FlavorConfig.current.flavor.name);
```

## 📋 Annotation cheat sheet

| Annotation | Lifecycle | Khi nào |
|---|---|---|
| `@LazySingleton()` | Lazy init, 1 instance | **Phổ biến nhất** — Service, Repository |
| `@Singleton()` | Eager init at boot | Hiếm — chỉ khi cần init ngay |
| `@injectable` | New instance mỗi lần | UseCase, transient objects |
| `@LazySingleton(env: ['dev'])` | Env-aware | Mock vs Real (vd. IapServiceMock) |
| `@LazySingleton(as: BaseClass)` | Register as parent | Mock implements interface |
| `@preResolve` | Async init | SharedPreferences, FirebaseRemoteConfig |

## 🎨 Pattern phổ biến

### Service (HTTP, business)

```dart
import 'package:injectable/injectable.dart';

@LazySingleton()
class ProductRepository {
  ProductRepository(this._service);
  final ProductService _service;

  Future<List<ProductModel>> getAll() => ...;
}

// Sử dụng:
final repo = getIt<ProductRepository>();
```

### Env-aware (mock dev / real prod)

```dart
// Abstract base
@LazySingleton(env: ['prod', 'stg'])
class IapService {
  Future<bool> get isPremium async => ...; // RevenueCat real
}

// Mock cho dev
@LazySingleton(as: IapService, env: ['dev'])
class MockIapService implements IapService {
  @override
  Future<bool> get isPremium async => true; // Always premium
}

// Inject 1 chỗ — flavor quyết định instance
final iap = getIt<IapService>();
// dev → MockIapService
// stg/prod → IapService real
```

### RegisterModule — bên thứ 3 không có @LazySingleton

```dart
@module
abstract class RegisterModule {
  @preResolve
  Future<SharedPreferences> get sharedPreferences =>
      SharedPreferences.getInstance();

  @lazySingleton
  FlutterSecureStorage get secureStorage => const FlutterSecureStorage(
        aOptions: AndroidOptions(encryptedSharedPreferences: true),
        iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
      );

  @lazySingleton
  InternetConnection get internetConnection =>
      InternetConnection.createInstance(checkInterval: const Duration(seconds: 10));

  @lazySingleton
  Dio dio(DioClient client) => client.dio;

  // ⚠️ FirebaseRemoteConfig: KHÔNG register — services tự lazy resolve
  // trong initialize() để tránh crash khi Firebase chưa ready.
}
```

### Dispose method (cleanup khi reset)

```dart
@LazySingleton()
class IapService {
  final _premiumCtrl = StreamController<bool>.broadcast();

  @disposeMethod
  Future<void> dispose() async {
    await _premiumCtrl.close();
    // ... cleanup listeners, subscriptions
  }
}

// Trigger:
await getIt.reset(dispose: true);
// → IapService.dispose() tự được gọi
```

## 🔄 Sau khi sửa @LazySingleton / @injectable

```bash
make gen      # regen injection.config.dart
```

## 🎯 Cách inject vào Notifier

```dart
@riverpod
class ProductNotifier extends _$ProductNotifier with BaseNotifier<List<ProductModel>> {
  late ProductService _service;

  @override
  Future<List<ProductModel>> build() async {
    // ✅ ĐÚNG — inject qua Riverpod provider
    _service = ProductService(ref.read(dioProvider));

    // ✅ HOẶC qua getIt
    // _service = getIt<ProductService>();

    return _service.getList();
  }
}
```

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `lib/core/base/di/injection.dart` | `getIt` + `configureDependencies()` |
| `lib/core/base/di/injection.config.dart` | 🤖 Auto-gen, KHÔNG sửa tay |
| `lib/core/base/di/dio_provider.dart` | Riverpod provider cho Dio |
| `lib/core/base/di/global_providers.dart` | `globalContainer` cho services ngoài widget tree |

## 🌍 globalContainer — Riverpod ngoài widget tree

Dùng khi cần đọc Riverpod state từ service (vd. GoRouter redirect):

```dart
// lib/core/base/di/global_providers.dart
final globalContainer = ProviderContainer();

// app.dart wrap với UncontrolledProviderScope
return UncontrolledProviderScope(
  container: globalContainer,
  child: ...
);

// Service đọc auth state
class AuthRefreshNotifier extends ChangeNotifier {
  AuthRefreshNotifier() {
    _subscription = globalContainer.listen<AppAuthState>(
      appAuthProvider,
      (_, _) => notifyListeners(),
    );
  }
}
```

## ❌ Anti-patterns

```dart
// ❌ Tự new instance
final service = ProductService(Dio());

// ✅ Inject qua getIt
final service = getIt<ProductService>();

// ❌ Quên annotation
class ProductService { ... }

// ✅ Phải có @LazySingleton hoặc @injectable
@LazySingleton()
class ProductService { ... }

// ❌ Đặt @Singleton cho mọi thứ
@Singleton()  // eager — slow boot
class ImageCacheService { ... }

// ✅ Lazy là default đúng
@LazySingleton()
class ImageCacheService { ... }

// ❌ Provider/InheritedWidget cho DI
Provider<ApiClient>(create: (_) => ApiClient())

// ✅ Riverpod cho state, getIt cho services
```

## 🐛 Debug "Type X is not registered"

1. **Đã chạy `make gen`?** → injection.config.dart phải có entry mới
2. **Annotation đúng?** → `@LazySingleton()` với `()`
3. **Import injectable?** → `import 'package:injectable/injectable.dart'`
4. **Constructor public?** → Private constructor → injectable không sinh được
5. **Env filter?** → `@LazySingleton(env: ['dev'])` chỉ register ở flavor dev
6. **Check log**: `Logger.info('Resolved: $instance')` sau `configureDependencies`
