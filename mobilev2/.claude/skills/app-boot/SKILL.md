---
name: app-boot
description: App entry & boot sequence — main_*.dart, runZonedGuarded, FlavorConfig, AppInitializer (Firebase/SystemUI/DI/IAP/Ads/AppVersion), Env/@Envied, observers (lifecycle + Riverpod), globalContainer. Đọc khi cần biết "app khởi động như thế nào", "thêm bước init mới", "thêm env key", "navigate từ ngoài widget tree", hoặc setup multi-flavor entry mới.
---

# App Boot — Entry, Init, Env, Observers

## 🚀 Boot sequence (mỗi lần app start)

```
main_<flavor>.dart
  └─ mainCommon(AppFlavor.X)
      └─ runZonedGuarded(...)
          1. WidgetsFlutterBinding.ensureInitialized()
          2. FlavorConfig.setFlavor(flavor)            ← snapshot bất biến
          3. globalContainer = ProviderContainer(...)   ← Riverpod root
          4. AppInitializer.initialize()
             ├─ _initFirebase()                         ← Firebase.initializeApp + Crashlytics
             ├─ SystemUIManager.setup()                 ← orientation + edge-to-edge
             ├─ configureDependencies(env: flavor.name) ← injectable codegen
             ├─ _initIap()                              ← RevenueCat (real/mock theo flavor)
             ├─ _initAds()                              ← Remote Config + MobileAds + lifecycle
             └─ _initAppVersion()                       ← Force update RC keys
          5. FlutterError.onError = → Crashlytics
          6. PlatformDispatcher.instance.onError = → Crashlytics
          7. runApp(App())
```

## 📂 File map

| File | Vai trò |
|---|---|
| `lib/main_dev.dart` / `main_stg.dart` / `main_prod.dart` | Entry per flavor — gọi `mainCommon(AppFlavor.X)` |
| `lib/main_common.dart` | Boot logic chung — error zones, Firebase init, runApp |
| `lib/app.dart` | `App` widget — `UncontrolledProviderScope` + `ScreenUtilInit` + `MaterialApp.router` |
| `lib/config/app/flavor_config.dart` | `FlavorConfig` singleton — apiBaseUrl, enableLogging/Crashlytics/Analytics |
| `lib/config/app/app_initializer.dart` | `AppInitializer.initialize()` — orchestrate all init steps |
| `lib/config/app/app_startup.dart` | `AppStartup.launch()` — health checks (network, first run) cho Splash |
| `lib/config/ui/system_ui_manager.dart` | `SystemUIManager.setup()` — orientation + status bar |
| `lib/config/env/env.dart` | `Env.apiBaseUrl`, `Env.apiKey` — switch theo flavor |
| `lib/config/env/env_{dev,stg,prod}.dart` | `@Envied(path: '.env.X', obfuscate: true)` per flavor |
| `lib/config/observers/app_observer.dart` | `WidgetsBindingObserver` — lifecycle callbacks |
| `lib/config/observers/app_riverpod_observer.dart` | `ProviderObserver` — log Riverpod lifecycle |
| `lib/core/base/di/global_providers.dart` | `globalContainer` — Riverpod root container |

## 🎯 `mainCommon` — pattern chuẩn

```dart
// lib/main_common.dart
Future<void> mainCommon(AppFlavor flavor) async {
  await runZonedGuarded<Future<void>>(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      FlavorConfig.setFlavor(flavor);

      globalContainer = ProviderContainer(
        observers: [const AppRiverpodObserver()],
      );

      await AppInitializer.initialize();

      FlutterError.onError = (details) {
        FlutterError.presentError(details);
        if (FlavorConfig.instance.enableCrashlytics && !kDebugMode) {
          FirebaseCrashlytics.instance.recordFlutterFatalError(details);
        }
      };

      PlatformDispatcher.instance.onError = (error, stack) {
        Logger.error('Platform error', error: error, stackTrace: stack);
        if (FlavorConfig.instance.enableCrashlytics && !kDebugMode) {
          FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
        }
        return true;
      };

      runApp(const App());
    },
    (error, stack) {
      Logger.error('Zoned error', error: error, stackTrace: stack);
      if (FlavorConfig.instance.enableCrashlytics && !kDebugMode) {
        FirebaseCrashlytics.instance.recordError(error, stack);
      }
    },
  );
}
```

→ **3 lớp catch** (đảm bảo không có exception nào lọt):
1. `runZonedGuarded` — bắt mọi async error
2. `FlutterError.onError` — bắt error trong widget build
3. `PlatformDispatcher.onError` — bắt error platform native (sentinel error)

## 🌐 globalContainer — Riverpod root

**Path**: `lib/core/base/di/global_providers.dart`

```dart
late ProviderContainer globalContainer;
```

→ Tạo ở `mainCommon` trước khi gọi bất kỳ provider nào. `App` widget dùng `UncontrolledProviderScope(container: globalContainer, ...)`.

→ Dùng ngoài widget tree (vd. trong service callback):
```dart
globalContainer.read(appAuthProvider.notifier).logout();
final config = globalContainer.read(appConfigProvider);
```

→ Reset toàn bộ (vd. khi logout):
```dart
await resetAndReinitDependencies(environment: FlavorConfig.current.flavor.name);
```

## 🌍 appContext — Global BuildContext

**Path**: `lib/core/common/extensions/context_extensions.dart`

```dart
BuildContext get appContext;            // throw nếu router chưa ready
BuildContext? get appContextOrNull;     // safe variant
```

→ Dùng khi cần `context` trong service/observer:
```dart
appContext.go('/main');
ScaffoldMessenger.of(appContext).showSnackBar(...);
```

→ Implementation: lấy từ `getIt<AppRouter>().router.routerDelegate.navigatorKey.currentContext`.

## 🏷️ FlavorConfig — Runtime flavor snapshot

```dart
FlavorConfig.setFlavor(AppFlavor.dev);    // gọi 1 lần ở mainCommon

FlavorConfig.current.apiBaseUrl;           // truy cập
FlavorConfig.current.enableCrashlytics;
FlavorConfig.isDev;                        // shortcut
FlavorConfig.isProd;
```

→ `@immutable` — sau khi `setFlavor` không đổi được.
→ **Khác `Env`**: `FlavorConfig` chứa toggle (boolean), `Env` chứa secret keys (`@Envied` obfuscated).

## 🔐 Env (`@Envied`) — Compile-time secrets

```dart
// lib/config/env/env_dev.dart
@Envied(path: '.env.dev', obfuscate: true)
abstract class EnvDev {
  @EnviedField(varName: 'API_BASE_URL')
  static final String apiBaseUrl = _EnvDev.apiBaseUrl;

  @EnviedField(varName: 'API_KEY')
  static final String apiKey = _EnvDev.apiKey;
}
```

### Thêm key mới (vd. `STRIPE_KEY`)

1. Thêm vào file `.env.dev`, `.env.stg`, `.env.prod`:
   ```
   STRIPE_KEY=sk_test_xxxxx
   ```
2. Thêm field vào `EnvDev/EnvStg/EnvProd`:
   ```dart
   @EnviedField(varName: 'STRIPE_KEY')
   static final String stripeKey = _EnvDev.stripeKey;
   ```
3. Thêm switch trong `Env`:
   ```dart
   static String get stripeKey => switch (FlavorConfig.current.flavor) {
     AppFlavor.dev => EnvDev.stripeKey,
     AppFlavor.stg => EnvStg.stripeKey,
     AppFlavor.prod => EnvProd.stripeKey,
   };
   ```
4. Chạy `make gen` để tạo `env_dev.g.dart` mới.

→ **`obfuscate: true`** trộn ký tự trong bytecode → secret không lộ dễ trong APK.

## 🚀 AppInitializer — Thêm bước init mới

```dart
// lib/config/app/app_initializer.dart
static Future<void> initialize() async {
  Logger.info('🚀 Initializing app (${FlavorConfig.current.flavor.name})...');

  await _initFirebase();
  await SystemUIManager.setup();
  await configureDependencies(environment: FlavorConfig.current.flavor.name);

  await _initIap();
  await _initAds();
  await _initAppVersion();

  // ➕ Thêm bước mới:
  await _initMyService();

  Logger.info('✅ App initialized.');
}

static Future<void> _initMyService() async {
  try {
    await getIt<MyService>().initialize();
  } catch (e, s) {
    Logger.error('MyService init failed', error: e, stackTrace: s);
  }
}
```

### ✅ Quy tắc init:
1. **Try/catch riêng từng step** — 1 module fail không block app boot
2. **Module nào cần timeout** → `Future.timeout(Duration(seconds: 15), onTimeout: ...)`
3. **Order quan trọng**:
   - Firebase **trước** Crashlytics/Analytics/RemoteConfig
   - `configureDependencies` **trước** các step dùng `getIt<>`
   - SystemUI sớm (trước `runApp`)

### ❌ Anti-patterns:
```dart
// ❌ Không catch — 1 fail = app crash
await getIt<NotificationService>().initialize();

// ❌ Đặt context-dependent init ở đây (chưa có BuildContext)
await getIt<QuickActionsService>().initialize(
  onAction: (type) => appContext.go(...),  // appContext = null tại đây!
);
// ✅ Defer vào Splash hoặc App.didChangeDependencies
```

## 🎯 AppStartup — Splash health checks

**Path**: `lib/config/app/app_startup.dart`

```dart
class AppStartupResult {
  final bool isFirstRun;
  final bool hasNetwork;
  final bool needsUpdate;
}

abstract class AppStartup {
  static Future<AppStartupResult> launch() async {
    // Health checks gọi từ SplashPage sau khi initialize() xong
    return const AppStartupResult(
      isFirstRun: false,
      hasNetwork: true,
      needsUpdate: false,
    );
  }
}
```

→ Hiện skeleton — mở rộng để check `LocalStorageService` first-run flag, ping API, fetch Remote Config.

## 👀 Observers

### AppObserver (App lifecycle)

**Path**: `lib/config/observers/app_observer.dart`

```dart
// Subscribe ở App widget initState:
final observer = AppObserver(
  onResume: () => Logger.info('App resumed'),
  onPause: () => Logger.info('App paused'),
);
WidgetsBinding.instance.addObserver(observer);
```

→ Used by `AdLifecycleObserver` để show AppOpen ad khi resume.

### AppRiverpodObserver (provider lifecycle)

**Path**: `lib/config/observers/app_riverpod_observer.dart`

```dart
final class AppRiverpodObserver extends ProviderObserver {
  void didAddProvider(ctx, value) { ... }     // 🟢 ADD
  void didUpdateProvider(ctx, prev, new) { } // 🔄 UPDATE
  void providerDidFail(ctx, err, st) { }     // 🔴 FAIL
  void didDisposeProvider(ctx) { }           // ⚪ DISPOSE
}
```

→ Đã wire vào `globalContainer` ở `mainCommon`. Log chỉ ra ở `kDebugMode`. Fail luôn log kể cả release.

## 🆕 Thêm flavor mới (vd. `qa`)

1. **AppFlavor enum**: thêm `qa` vào `lib/config/app/flavor_config.dart`
2. **FlavorConfig.setFlavor**: thêm case `AppFlavor.qa => FlavorConfig._(...)`
3. **Env**: tạo `env_qa.dart` + `.env.qa`
4. **Entry**: tạo `lib/main_qa.dart`:
   ```dart
   Future<void> main() => mainCommon(AppFlavor.qa);
   ```
5. **Android**: thêm productFlavor `qa` ở `android/app/build.gradle.kts`
6. **iOS**: thêm scheme `qa.xcscheme` + xcconfig `qaDebug.xcconfig`, `qaRelease.xcconfig`
7. **Firebase**: thêm `google-services.json` ở `android/app/src/qa/` + `GoogleService-Info.plist` ở `ios/Runner/qa/`
8. **Makefile**: thêm targets `run-qa`, `build-apk-qa`, `build-ios-qa`
9. **`make gen`** để tạo `env_qa.g.dart`

→ Tham chiếu thêm: skill `firebase-flavors` cho config native.

## 📂 Files quan trọng

| File | Mục đích |
|---|---|
| `lib/main_common.dart` | Boot orchestration + error zones |
| `lib/app.dart` | Widget tree root (Provider/ScreenUtil/MaterialApp.router) |
| `lib/config/app/flavor_config.dart` | FlavorConfig + AppFlavor enum |
| `lib/config/app/app_initializer.dart` | Init pipeline (Firebase/SystemUI/DI/IAP/Ads/Version) |
| `lib/config/app/app_startup.dart` | Splash health check skeleton |
| `lib/config/env/env.dart` | Env keys facade |
| `lib/config/env/env_dev.dart` | `@Envied(path: '.env.dev')` |
| `lib/config/ui/system_ui_manager.dart` | Orientation + edge-to-edge |
| `lib/config/observers/app_observer.dart` | WidgetsBindingObserver wrapper |
| `lib/config/observers/app_riverpod_observer.dart` | ProviderObserver (Riverpod 3.x API) |
| `lib/core/base/di/global_providers.dart` | `globalContainer` declaration |
| `lib/core/common/extensions/context_extensions.dart` | `appContext` accessor |
