# 🏛️ Architecture Deep-Dive

> Tài liệu chi tiết về kiến trúc & design decision của `flutter_base2`.

---

## 1. Triết lý thiết kế

| Nguyên tắc | Cách thực thi |
|---|---|
| **Single source of truth cho state** | Riverpod duy nhất, không mix BLoC/Cubit/GetX |
| **Feature-first** | Mỗi feature 1 thư mục, độc lập tối đa |
| **Type-safe at compile time** | Codegen (riverpod, freezed, go_router, envied, retrofit) |
| **Lean by default** | Domain layer chỉ khi cần (không bắt buộc) |
| **Production-ready** | Multi-flavor, error handling, CI, test scaffold sẵn |

---

## 2. Layered Architecture

```
┌────────────────────────────────────────────────────┐
│ Presentation                                       │
│   - HookConsumerWidget (pages, widgets)            │
│   - Riverpod Notifiers (state)                     │
│   - GoRouter (navigation)                          │
└────────────┬───────────────────────────────────────┘
             │ uses
┌────────────▼───────────────────────────────────────┐
│ Application (optional)                             │
│   - UseCases (chỉ khi business logic phức tạp)     │
└────────────┬───────────────────────────────────────┘
             │ depends on
┌────────────▼───────────────────────────────────────┐
│ Data                                               │
│   - Retrofit services (HTTP)                       │
│   - Repositories (abstract data sources)           │
│   - Models (freezed + json_serializable)           │
└────────────┬───────────────────────────────────────┘
             │ uses
┌────────────▼───────────────────────────────────────┐
│ Infrastructure (core/)                             │
│   - DioClient + interceptors                       │
│   - Storage (SharedPreferences, SecureStorage)     │
│   - Firebase (Analytics, Crashlytics, Remote)      │
│   - Services (auth, notification, permission)      │
└────────────────────────────────────────────────────┘
```

---

## 3. State Management — Riverpod + `BaseNotifier`

### Vì sao chọn Riverpod?
- Compile-safe (`riverpod_lint`)
- Code-gen reduce boilerplate
- Hỗ trợ async natively qua `AsyncValue`
- Test-friendly (override providers)
- Không cần `BuildContext` để access state

### `BaseNotifier<T>` — mixin gom logic async

```dart
mixin BaseNotifier<T> on _$NotifierBase<AsyncValue<T>> {
  Future<void> runAsync({
    required Future<T> Function() action,
    bool cancelPrevious = false,
    bool keepPreviousOnLoading = false,
    bool emitEmptyForEmptyList = false,
    String? successMessage,
    String? errorMessage,
    void Function(Object e, StackTrace s)? onError,
  });

  Future<void> runUnwrap<R>({ ... mapper: R Function(ApiResponse<R>) });
  Future<void> runPagination<R>({ ... });
  Future<void> runResult<R>({ ... });
}
```

### Trade-off đã chốt
- ✅ Sử dụng `@riverpod` codegen (không dùng manual `Provider<T>`)
- ✅ Notifier mặc định **autoDispose** — opt-in `keepAlive: true` khi cần
- ✅ Service được tạo lazy bên trong `build()`, không qua DI (Riverpod tự quản)

---

## 4. Networking Stack

### Interceptor order (rất quan trọng)
```
Request:
  SmartCache → Auth → Retry → NetworkCheck → Logging → Network
Response: (reverse)
```

### `ApiResponse<T>` standard wrapper
```dart
@freezed
class ApiResponse<T> with _$ApiResponse<T> {
  const factory ApiResponse({
    required bool isSuccess,
    T? data,
    String? message,
    PaginationMeta? meta,
  }) = _ApiResponse<T>;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) = _$ApiResponseFromJson<T>;
}
```

### Retrofit service convention
- 1 file `<feature>_service.dart` per feature
- Service KHÔNG bắt exception — interceptor sẽ throw `ServerException`
- Body bắt buộc dùng `@freezed` Request class (không dùng `Map`)

---

## 5. Error Handling

```
DioException (transport)
  ↓ interceptor
ServerException (typed)
  ↓ ErrorHandler.handle()
Failure (sealed)
  ↓ Result<T>
AsyncValue<T> (Riverpod)
  ↓ useAsyncValueListener
Toast / SmartDialog
```

### Failure hierarchy
```dart
sealed class Failure {
  final String message;
}
class NetworkFailure extends Failure {}
class ServerFailure extends Failure { final int? code; }
class CacheFailure extends Failure {}
class ValidationFailure extends Failure {}
class UnknownFailure extends Failure {}
```

---

## 6. Dependency Injection

### Hai hệ thống song song
| | get_it + injectable | Riverpod |
|---|---|---|
| **Dùng cho** | Services, Repositories, Singletons | Notifiers, State, Computed |
| **Annotation** | `@LazySingleton`, `@Singleton`, `@injectable` | `@riverpod` |
| **Lifecycle** | Manual reset (logout) | Auto via `autoDispose` |
| **Cross-tree access** | `getIt<T>()` | `globalContainer.read(provider)` |

### Tại sao 2 hệ?
- `get_it`: tương thích lib bên thứ 3 (Dio, FirebaseAuth) không hỗ trợ Riverpod
- `Riverpod`: tự nhiên cho UI state

### Reset on logout
```dart
Future<void> resetAndReinitDependencies() async {
  await getIt.reset(dispose: true);
  await configureDependencies(environment: FlavorConfig.flavor.name);
  globalContainer = ProviderContainer(observers: [...]);
}
```

---

## 7. Routing — GoRouter typed

### Vì sao GoRouter?
- Official Flutter team support
- URL-based (deep link friendly)
- Typed routes qua `go_router_builder`
- Stream-based refresh (lắng nghe auth state)

### Pattern
```dart
@TypedGoRoute<HomeRoute>(path: '/home')
class HomeRoute extends GoRouteData {
  @override
  Widget build(BuildContext context, GoRouterState state) => const HomePage();
}
```

### Auth guard
```dart
String? authGuard(BuildContext ctx, GoRouterState state) {
  final isAuth = globalContainer.read(appAuthProvider).isAuthenticated;
  final isLogin = state.matchedLocation == RouteNames.login;
  if (!isAuth && !isLogin) return RouteNames.login;
  if (isAuth && isLogin) return RouteNames.home;
  return null;
}
```

---

## 8. Multi-flavor & Env

```
              .env.dev        .env.stg        .env.prod
                 │                │                │
                 ▼                ▼                ▼
              EnvDev           EnvStg           EnvProd      (envied codegen)
                 \                │                /
                  \               │               /
                   ▼              ▼              ▼
                       FlavorConfig (singleton)
                              │
                              ▼
                       Used everywhere
```

### Khởi tạo
```dart
void main_dev() => mainCommon(AppFlavor.dev);

Future<void> mainCommon(AppFlavor flavor) async {
  WidgetsFlutterBinding.ensureInitialized();
  FlavorConfig.setFlavor(flavor);   // 👈 PHẢI ĐẦU TIÊN
  globalContainer = ProviderContainer(observers: [...]);
  await AppInitializer.initialize();
  runApp(const App());
}
```

---

## 9. Design System

### Token-based
```dart
class AppColorTokens {
  final Color primary;
  final Color onPrimary;
  // ... 30+ tokens

  factory AppColorTokens.light() => const AppColorTokens(...);
  factory AppColorTokens.dark() => const AppColorTokens(...);
}
```

### `ThemeData` factory
```dart
class AppTheme {
  static ThemeData light(AppColorTokens t) {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: t.toColorScheme(),
      textTheme: AppTextStyles.theme(t),
    );
    return AppComponentThemes.apply(base, t);
  }
}
```

### Customization
- `AppDimensions` (4/8/12/16/24/32 spacing)
- `AppTextStyles` (display/headline/body/label scale)
- `AppComponentThemes.apply()` — custom AppBar/Button/Card/Input/Dialog

---

## 10. Initialization Sequence

```
main_dev/stg/prod()
   │
   ▼
mainCommon(flavor)
   │
   ├── runZonedGuarded() ── catch async errors
   ├── WidgetsFlutterBinding.ensureInitialized()
   ├── FlavorConfig.setFlavor(flavor)
   ├── globalContainer = ProviderContainer(...)
   ├── AppInitializer.initialize()
   │      ├── Firebase + Crashlytics
   │      ├── SystemUIManager
   │      ├── DI: configureDependencies()
   │      ├── AppConfigService (Remote Config)
   │      └── Services: notification, permission
   ├── FlutterError.onError = ...
   ├── PlatformDispatcher.onError = ...
   └── runApp(App())
            │
            ▼
       App widget
            │
            ├── UncontrolledProviderScope(globalContainer)
            └── ScreenUtilInit(designSize: 375x812)
                       │
                       ▼
                  _AppContent
                       │
                       ├── watch themeProvider
                       ├── watch localeProvider
                       ├── MaterialApp.router(...)
                       └── Wrap: Toastification + FlutterSmartDialog
```

---

## 11. Testing Strategy

### Pyramid
```
       ╱╲
      ╱  ╲       Golden (5%) — theme, key widgets
     ╱────╲
    ╱      ╲     Widget (20%) — pages, complex widgets
   ╱────────╲
  ╱          ╲   Unit (75%) — notifiers, services, utils
 ╱────────────╲
```

### Helpers
```dart
// test/helpers/pump_app.dart
Future<void> pumpApp(
  WidgetTester tester,
  Widget child, {
  List<Override> overrides = const [],
}) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: overrides,
      child: MaterialApp(home: child, theme: AppTheme.light(...)),
    ),
  );
}
```

---

## 12. Performance considerations

| Area | Strategy |
|---|---|
| **Network** | Smart cache + retry + dedupe |
| **Image** | `cached_network_image` với placeholder |
| **List** | `ListView.builder` + pagination |
| **Rebuild** | `select` trong Riverpod để watch sub-tree |
| **Startup** | Lazy init service, splash hide ASAP |
| **Bundle** | Tree-shake assets (chỉ include cái dùng) |

---

## 13. Design decisions — Lý do bỏ vs giữ

### ✅ Giữ từ v1
- `BaseNotifier` mixin — đã rất tinh tế
- Dio interceptor stack — battle-tested
- Feature-first folder — scale tốt
- FlavorConfig singleton — đơn giản, hiệu quả
- Mason bricks — đẩy nhanh scaffold

### ❌ Bỏ khỏi v1
- BLoC/Cubit/GetX — gây phân mảnh, mỗi feature 1 cách
- 9 example features — gây nhiễu cho dev mới
- `easy_localization` — không hot reload tốt, lệch standard
- `theme_tailor` — Material 3 + token đã đủ
- PowerShell trong Makefile — không cross-platform
- `graphql_flutter` — chỉ thêm khi cần thật

### ➕ Thêm vào v2
- `envied` typed env
- `riverpod_lint` (Dart 3.10+)
- `golden_toolkit` cho UI regression test
- GitHub Actions workflows
- Fastlane integration
- `docs/` riêng thay vì nhét hết vào CLAUDE.md
