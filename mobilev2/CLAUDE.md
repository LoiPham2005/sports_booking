# flutter_base2 — Project Instructions for Claude

## Ngôn ngữ
- **Reply tiếng Việt**. Code, class names, file names, technical terms giữ tiếng Anh.

## Kiến trúc

```
lib/
  config/           — Flavor, env config, app initializer, observers
  core/
    base/
      di/           — injectable + get_it (DI)
      errors/       — Result<T>, Failure subtypes, ErrorHandler
      riverpod/     — BaseNotifier mixin + useAsyncValueChange hook (CHỈ Riverpod)
      usecases/     — BaseUseCase (optional, khi cần Domain layer)
    data/
      network/      — DioClient, ApiResponse<T>, ApiPaginatedData<T>, interceptors
      storage/      — local & secure storage
      cache/        — cache_service
    services/       — auth, notification, version, permission, navigation
    common/         — extensions, constants, mixins, converters, utils
  design/
    theme/          — AppTheme + ColorTokens + Dimensions + TextStyles
    l10n/           — ARB translations + LocaleNotifier
  shared/
    models/         — BaseEntity, CommonParam
    widgets/        — AppScaffold, AppButton, AppTextField, dialogs, states
  features/{name}/
    data/
      models/       — @freezed + json_serializable
      services/     — @RestApi (Retrofit)
    presentation/
      providers/    — @riverpod class extends + with BaseNotifier<T>
      pages/        — HookConsumerWidget
  modules/          — Ads, Analytics, IAP, AppConfig
  routes/
    base/           — observer, refresh stream, not_found
    config/         — app_router, app_routes, route_names, route_guards
```

## State Management — Riverpod CHÍNH THỨC (KHÔNG dùng BLoC/Cubit/GetX)

### Notifier pattern
```dart
@riverpod
class NameNotifier extends _$NameNotifier with BaseNotifier<List<NameModel>> {
  late NameService _service;

  @override
  Future<List<NameModel>> build() async {
    _service = NameService(ref.read(dioProvider));
    return _service.getList();
  }

  Future<void> refresh() => runAsync(
    action: _service.getList,
    keepPreviousOnLoading: true,
  );

  Future<void> search(String query) => runAsync(
    action: () => _service.search(query),
    cancelPrevious: true,
    keepPreviousOnLoading: true,
  );
}
```

### Method selection
| Service trả về | Method |
|---|---|
| `Future<T>` raw | `runAsync` |
| `Future<ApiResponse<R>>` | `runUnwrap` |
| `Future<ApiResponse<ApiPaginatedData<R>>>` | `runPagination` |
| `Future<Result<R>>` | `runResult` |

### runAsync flags
| Flag | Tác dụng |
|---|---|
| `cancelPrevious: true` | Hủy call cũ — bắt buộc với search/filter |
| `keepPreviousOnLoading: true` | Giữ data cũ khi refresh (không flash trắng) |
| `emitEmptyForEmptyList: true` | `notifier.isEmpty = true` khi list rỗng |
| `successMessage: '...'` | Toast tự động qua `useAsyncValueChange` |
| `errorMessage: '...'` | Prefix cho toast lỗi |
| `onError: (e, s) => ...` | Rollback optimistic update |

### Page pattern
```dart
class NamePage extends HookConsumerWidget {
  const NamePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(nameProvider);
    final notifier = ref.read(nameProvider.notifier);
    useAsyncValueChange(state);

    return Scaffold(
      body: switch (state) {
        AsyncValue(:final value?, isLoading: true) => Stack(
          children: [_buildContent(value), const LinearProgressIndicator()],
        ),
        AsyncData(value: final list) when list.isEmpty => const EmptyWidget(),
        AsyncData(:final value) => _buildContent(value),
        AsyncError(:final error) => ErrorRetry(onRetry: notifier.refresh),
        _ => const LoadingWidget(),
      },
    );
  }
}
```

## Service return type
```dart
// ĐÚNG — interceptor xử lý exception → Failure tự động
Future<List<T>>                             // raw, dùng với runAsync
Future<ApiResponse<T>>                      // dùng với runUnwrap
Future<ApiResponse<ApiPaginatedData<T>>>    // dùng với runPagination
Future<void>                                // DELETE, side-effect

// SAI — không bao giờ wrap Result ở service layer
Future<Result<ApiResponse<T>>>
```

## DI annotations
- **Notifier**: KHÔNG cần annotation — Riverpod codegen tự quản lifecycle
- `@LazySingleton()` → Service, Repository, stateful singletons
- `@Singleton()` → eager init at boot
- `@injectable` → mỗi lần tạo mới

## Env loading
- **Compile-time** (secret keys): `@Envied(.env.{flavor})` trong `lib/config/env/`
- **Runtime** (toggle, URL theo flavor): `FlavorConfig` singleton
- **Remote** (feature flag): `FirebaseRemoteConfig`

## After any code-gen change
Run: `make gen` (hoặc VSCode Task: ⚡ Build Runner: Build)

## Skills available

> 📚 **16 skills toàn diện** — đọc khi cần hiểu sâu pattern v2. Mỗi skill có frontmatter `description` mô tả khi nào nên dùng. Bắt đầu với `architecture` nếu chưa quen — nó có skill index.

### Foundation
| Skill | Khi nào đọc |
|---|---|
| `.claude/skills/architecture/` | Folder structure + layer separation + **skill index** |
| `.claude/skills/app-boot/` | main_*.dart, AppInitializer, FlavorConfig, Env, observers, globalContainer |

### Code patterns
| Skill | Khi nào đọc |
|---|---|
| `.claude/skills/state-management/` | Viết Notifier, runAsync/runUnwrap/runPagination, search/filter |
| `.claude/skills/network-error/` | Retrofit service, Failure/Result, interceptors, ApiResponse |
| `.claude/skills/graphql/` | GraphQL với graphql_flutter + graphql_codegen (type-safe queries) |
| `.claude/skills/dependency-injection/` | get_it + injectable, `@LazySingleton`, env-aware DI |
| `.claude/skills/storage-cache/` | Local/Secure storage, CacheService, SmartCacheInterceptor |
| `.claude/skills/routing/` | go_router typed, ShellRoute, guards, deep linking |
| `.claude/skills/design-system/` | Theme tokens, AppDimensions, ARB l10n + auto-translate |

### Catalog (tái sử dụng)
| Skill | Khi nào đọc |
|---|---|
| `.claude/skills/shared-ui-extensions/` | AppScaffold/AppButton/AppTextField + all extensions + BaseEntity/CommonParam |
| `.claude/skills/core-services/` | Auth, Notification, Permission, AppVersion, QuickActions, Validators |
| `.claude/skills/modules/` | Ads/IAP/Analytics/AppConfig |

### Infrastructure
| Skill | Khi nào đọc |
|---|---|
| `.claude/skills/firebase-flavors/` | Multi-flavor + Firebase + Android signing/R8 + iOS xcconfigs |
| `.claude/skills/commands/` | Makefile, Mason bricks, VSCode tasks, tools/ scripts |

### Workflows
| Skill | Khi nào đọc |
|---|---|
| `.claude/skills/new-feature/` | Scaffold feature mới — workflow 5 bước (Mason + customize + route) |
| `.claude/skills/code-review/` | Checklist review trước commit |

## Quy tắc vàng
1. **KHÔNG** import legacy state mgmt (`flutter_bloc`, `get`) trong feature mới
2. **KHÔNG** dùng `Map<String, dynamic>` cho request body — luôn tạo `@freezed` Request class
3. **KHÔNG** wrap `Result<>` ở service layer — chỉ wrap ở repository (khi có Domain)
4. **LUÔN** dùng `prefer_const_constructors` (lint enforce)
5. **LUÔN** chạy `make gen` sau khi sửa `@freezed`, `@RestApi`, `@riverpod`, `@injectable`, `@TypedGoRoute`, `@Envied`
6. Nếu chưa biết: đọc reference feature `lib/features/_reference/voucher/`
