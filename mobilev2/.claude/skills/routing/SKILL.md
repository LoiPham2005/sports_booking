---
name: routing
description: go_router typed routes + guards + deep linking. Đọc khi thêm route mới, navigate giữa pages, setup ShellRoute (bottom nav), hoặc auth guard redirect.
---

# Routing — go_router typed

## 🗺️ Architecture

```
lib/routes/
├── base/
│   ├── go_router_refresh_stream.dart  # AuthRefreshNotifier (listen Riverpod → trigger redirect)
│   └── not_found_page.dart            # 404 page
└── config/
    ├── app_router.dart                # @LazySingleton — wrap GoRouter
    ├── app_routes.dart                # @TypedGoRoute declarations (auto-gen $appRoutes)
    ├── route_names.dart               # String constants
    └── route_guards.dart              # authGuard logic
```

## 🎯 Setup chính

### route_names.dart

```dart
abstract class RouteNames {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String main = '/';
  static const String home = '/home';
  static const String settings = '/settings';
  static const String voucherList = '/vouchers';
  static const String voucherDetail = '/vouchers/:id';

  // Helper với param
  static String voucherDetailPath(String id) => '/vouchers/$id';
}
```

### app_routes.dart (typed routes)

```dart
part 'app_routes.g.dart';

@TypedGoRoute<SplashRoute>(path: '/splash')
class SplashRoute extends GoRouteData with $SplashRoute {
  const SplashRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const SplashPage();
}

@TypedGoRoute<LoginRoute>(path: '/login')
class LoginRoute extends GoRouteData with $LoginRoute {
  const LoginRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const LoginPage();
}

// ShellRoute cho bottom nav
@TypedShellRoute<MainShellRoute>(
  routes: [
    TypedGoRoute<HomeRoute>(path: '/'),
    TypedGoRoute<SettingsRoute>(path: '/settings'),
    TypedGoRoute<VoucherListRoute>(path: '/vouchers'),
  ],
)
class MainShellRoute extends ShellRouteData {
  const MainShellRoute();

  @override
  Widget builder(BuildContext context, GoRouterState state, Widget navigator) =>
      MainPage(child: navigator);
}

class HomeRoute extends GoRouteData with $HomeRoute {
  const HomeRoute();
  @override
  Widget build(BuildContext context, GoRouterState state) => const HomePage();
}

class VoucherListRoute extends GoRouteData with $VoucherListRoute {
  const VoucherListRoute();
  @override
  Widget build(BuildContext context, GoRouterState state) => const VoucherListPage();
}
```

### app_router.dart

```dart
@LazySingleton()
class AppRouter {
  AppRouter() {
    const guards = RouteGuards();
    router = GoRouter(
      initialLocation: RouteNames.splash,
      debugLogDiagnostics: true,
      refreshListenable: AuthRefreshNotifier(),  // ⚡ Re-evaluate redirect khi auth đổi
      redirect: guards.authGuard,
      routes: $appRoutes,                          // 🤖 Generated từ @TypedGoRoute
      errorBuilder: (context, state) => const NotFoundPage(),
    );
  }
  late final GoRouter router;
}
```

### app.dart — wire vào MaterialApp

```dart
final router = getIt<AppRouter>().router;
return MaterialApp.router(routerConfig: router, ...);
```

## ➕ Thêm route mới

### 1. Khai báo trong `app_routes.dart`

```dart
// Top-level route
@TypedGoRoute<ProductDetailRoute>(path: '/products/:id')
class ProductDetailRoute extends GoRouteData with $ProductDetailRoute {
  const ProductDetailRoute({required this.id});
  final String id;

  @override
  Widget build(BuildContext context, GoRouterState state) =>
      ProductDetailPage(id: id);
}

// Thêm vào ShellRoute (nếu là bottom nav child):
@TypedShellRoute<MainShellRoute>(
  routes: [
    TypedGoRoute<HomeRoute>(path: '/'),
    TypedGoRoute<SettingsRoute>(path: '/settings'),
    TypedGoRoute<VoucherListRoute>(path: '/vouchers'),
    TypedGoRoute<ProductListRoute>(path: '/products'),  // ← thêm
  ],
)
class MainShellRoute extends ShellRouteData { ... }
```

### 2. Thêm constant (tùy chọn — để dễ refactor)

```dart
// route_names.dart
static const String productList = '/products';
static const String productDetail = '/products/:id';
static String productDetailPath(String id) => '/products/$id';
```

### 3. Generate

```bash
make gen   # build_runner sinh app_routes.g.dart với $appRoutes
```

### 4. Navigate

```dart
// ✅ Typed-safe (preferred)
const HomeRoute().go(context);
const ProductDetailRoute(id: '123').push(context);

// ✅ String-based (cũng OK với route_names)
context.go(RouteNames.home);
context.go(RouteNames.productDetailPath('123'));
context.push(RouteNames.productDetail.replaceAll(':id', '123'));

// Pop
Navigator.of(context).pop();
context.pop();
```

## 🛡️ RouteGuards — auth redirect

**Path**: `lib/routes/config/route_guards.dart`

```dart
class RouteGuards {
  const RouteGuards();

  String? authGuard(BuildContext context, GoRouterState state) {
    final auth = globalContainer.read(appAuthProvider);
    final loc = state.matchedLocation;

    final publicPaths = {RouteNames.splash, RouteNames.login, RouteNames.register};
    final isPublic = publicPaths.contains(loc);

    if (!auth.isAuthenticated && !isPublic) return RouteNames.login;
    if (auth.isAuthenticated && loc == RouteNames.login) return RouteNames.main;
    return null; // không redirect
  }
}
```

→ Trả `null` = stay, trả `String path` = redirect.

## 🔄 AuthRefreshNotifier — trigger redirect khi auth state đổi

**Path**: `lib/routes/base/go_router_refresh_stream.dart`

```dart
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
    _subscription.close();
    super.dispose();
  }
}
```

→ Khi `AppAuthNotifier` đổi state → `AuthRefreshNotifier` notify → GoRouter chạy lại `redirect`.

## 🍃 Pattern phổ biến

### Pass data qua route

```dart
// 1. Path param
@TypedGoRoute<ProductDetailRoute>(path: '/products/:id')
class ProductDetailRoute extends GoRouteData with $ProductDetailRoute {
  const ProductDetailRoute({required this.id});
  final String id;
  @override
  Widget build(...) => ProductDetailPage(id: id);
}

// 2. Query param
@TypedGoRoute<SearchRoute>(path: '/search')
class SearchRoute extends GoRouteData with $SearchRoute {
  const SearchRoute({this.q});
  final String? q;  // /search?q=foo
  @override
  Widget build(...) => SearchPage(query: q);
}

// 3. Extra (transient — không serialize vào URL)
class ProductDetailRoute extends GoRouteData with $ProductDetailRoute {
  const ProductDetailRoute({required this.id, this.preview});
  final String id;
  final ProductModel? preview;  // chỉ dùng trong-app, mất khi reload

  @override
  Widget build(BuildContext context, GoRouterState state) =>
      ProductDetailPage(id: id, preview: preview);
}

// Navigate với extra:
ProductDetailRoute(id: '123', preview: cachedProduct).push(context);
```

### Navigation từ Service (không có context)

```dart
// Setup globalContainer wrap UncontrolledProviderScope (đã có trong app.dart)
final router = getIt<AppRouter>().router;
router.go(RouteNames.login);

// Hoặc qua appContext extension:
appContext.go(RouteNames.login);
```

### Dialog không break GoRouter stack

```dart
// ✅ ĐÚNG — showDialog (overlay route)
showDialog<void>(
  context: appContext,
  builder: (dialogContext) => MyDialog(...),
);

// ❌ SAI — Navigator.push thêm route vào GoRouter stack
appContext.navPush(MyDialogPage(...));  // → break deep linking
```

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `lib/routes/config/app_routes.dart` | @TypedGoRoute declarations |
| `lib/routes/config/app_routes.g.dart` | 🤖 Auto-gen `$appRoutes` |
| `lib/routes/config/app_router.dart` | GoRouter setup + guards |
| `lib/routes/config/route_names.dart` | String constants |
| `lib/routes/config/route_guards.dart` | authGuard logic |
| `lib/routes/base/go_router_refresh_stream.dart` | AuthRefreshNotifier |

## ❌ Anti-patterns

```dart
// ❌ String hardcoded
context.go('/products/$id');

// ✅ Typed route
const ProductDetailRoute(id: id).go(context);

// ❌ Quên `with $XxxRoute` mixin
class HomeRoute extends GoRouteData {
  @override
  Widget build(...) => ...;
}

// ✅ PHẢI có mixin (go_router_builder generate)
class HomeRoute extends GoRouteData with $HomeRoute { ... }

// ❌ ShellRoute thêm mixin (chỉ extension)
class MainShellRoute extends ShellRouteData with $MainShellRoute { ... }

// ✅ ShellRoute KHÔNG có mixin (extension `$MainShellRouteExtension`)
class MainShellRoute extends ShellRouteData { ... }

// ❌ Build dialog bằng push
appContext.navPush(Dialog(...))

// ✅ showDialog overlay
showDialog<void>(context: appContext, builder: (_) => Dialog(...))
```
