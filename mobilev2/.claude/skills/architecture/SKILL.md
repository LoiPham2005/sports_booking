---
name: architecture
description: Kiến trúc tổng thể flutter_base2 — folder structure, layer separation, file organization conventions. Đọc khi cần biết file gì nên ở đâu, layer nào trách nhiệm gì, hoặc tạo file mới chưa biết đặt vào folder nào.
---

# Architecture — flutter_base2

## 📂 Folder structure

```
lib/
├── app.dart                          # Root widget (MaterialApp.router)
├── main_common.dart                  # Entry chung — zone, error handler, AppInitializer.initialize()
├── main_dev.dart / stg / prod        # Per-flavor entry — set FlavorConfig → mainCommon()
│
├── config/                           # 🔧 App configuration
│   ├── app/
│   │   ├── flavor_config.dart        # FlavorConfig singleton (current.apiBaseUrl, isDev, etc.)
│   │   └── app_initializer.dart      # initialize() chạy ở main_common (Firebase + DI + modules)
│   ├── env/                          # @Envied — compile-time secrets per flavor
│   ├── observers/                    # AppObserver (lifecycle), AppRiverpodObserver (Riverpod log)
│   └── ui/                           # SystemUIManager (status bar, orientation)
│
├── core/                             # 🧱 Shared infrastructure (KHÔNG chứa business logic)
│   ├── base/
│   │   ├── di/                       # injection.dart + injection.config.dart (injectable + getIt)
│   │   ├── errors/                   # Failure (sealed), Result<T>, ErrorHandler
│   │   ├── riverpod/                 # BaseNotifier mixin + useAsyncValueChange hook
│   │   └── usecases/                 # BaseUseCase (optional — chỉ khi có Domain layer)
│   ├── common/
│   │   ├── constants/                # AppConstants, ApiEndpoints
│   │   ├── extensions/               # context/datetime/string/number/list/assets/widget/l10n
│   │   └── utils/                    # Validators, DeviceInfo, SafeCompleter, ImagePickerUtils
│   ├── data/
│   │   ├── network/                  # DioClient + 5 interceptors + ApiResponse + ApiPaginatedData
│   │   ├── storage/                  # LocalStorageService, SecureStorageService
│   │   └── cache/                    # CacheService
│   └── services/                     # Cross-feature services
│       ├── app_auth/                 # AppAuthNotifier (global auth state)
│       ├── notification/             # NotificationService (flutter_local_notifications)
│       ├── permission/               # PermissionService (permission_handler)
│       ├── app_version/              # AppVersionService (force update via Remote Config)
│       ├── quick_actions/            # QuickActionsService (home shortcuts)
│       └── utils/                    # Logger, NavigationService
│
├── design/                           # 🎨 Design system
│   ├── theme/
│   │   ├── app_theme.dart            # AppTheme.fromVariant(variant) → ThemeData
│   │   ├── app_component_themes.dart # Material component themes
│   │   ├── styles/                   # AppColorTokens (4 variants), AppDimensions, AppTextStyles
│   │   └── providers/                # ThemeNotifier (Riverpod, persist preference)
│   └── l10n/
│       ├── providers/                # LocaleNotifier
│       └── translations/             # ARB files (app_en.arb, app_vi.arb)
│
├── shared/                           # 🤝 Cross-feature reusable
│   ├── models/base/                  # BaseEntity, CommonParam (pagination params)
│   └── widgets/
│       ├── base/                     # AppScaffold, AppButton, AppTextField
│       ├── states/                   # LoadingWidget, EmptyWidget, ErrorRetry
│       ├── dialogs/                  # AppConfirmationDialog
│       └── lists/                    # (placeholder cho paginated list)
│
├── features/                         # 🎯 Business modules — feature-first
│   ├── _reference/voucher/           # ⭐ Pattern chuẩn — dev đọc trước khi viết feature mới
│   ├── auth/                         # Login flow (LoginPage + AuthNotifier + AuthService)
│   ├── home/                         # Home page
│   ├── main/                         # Bottom-nav shell
│   ├── settings/                     # Theme/locale picker
│   └── splash/                       # Splash screen + auth check
│
├── modules/                          # 📦 Optional feature modules
│   ├── ads/                          # AdMob (16 files — manager, handlers, models, widgets)
│   ├── iap/                          # RevenueCat (real + mock — env-aware DI)
│   ├── analytics/                    # Firebase Analytics
│   └── app_config/                   # Firebase Remote Config (notice banner, maintenance, etc.)
│
├── routes/
│   ├── base/                         # GoRouterRefreshStream, NotFoundPage
│   └── config/                       # AppRouter, AppRoutes (@TypedGoRoute), RouteNames, RouteGuards
│
└── gen/l10n/                         # 🤖 Generated AppLocalizations
```

## 🏗️ Layer pattern (per feature)

```
features/{name}/
├── data/
│   ├── models/                       # @freezed + json_serializable
│   │   └── {name}_model.dart
│   └── services/                     # @RestApi (Retrofit) — KHÔNG có business logic
│       └── {name}_service.dart
└── presentation/
    ├── providers/                    # @riverpod class + BaseNotifier<T> — orchestration
    │   └── {name}_notifier.dart
    └── pages/                        # HookConsumerWidget — UI consume state
        └── {name}_list_page.dart
```

**Optional**: `domain/` layer chỉ thêm khi feature có business rules phức tạp (UseCase + Repository abstraction). Default → bỏ qua.

## 📋 File organization rules

| File type | Path | Convention |
|---|---|---|
| Riverpod Notifier | `presentation/providers/` | `@riverpod class XxxNotifier extends _$XxxNotifier with BaseNotifier<T>` |
| Retrofit Service | `data/services/` | `@RestApi() abstract class XxxService { factory XxxService(Dio dio) = _XxxService; }` |
| Freezed Model | `data/models/` | `@freezed abstract class XxxModel with _$XxxModel { ... }` |
| Page | `presentation/pages/` | `class XxxPage extends HookConsumerWidget` |
| Constants | `core/common/constants/` | `abstract class XxxConstants` |
| Extension | `core/common/extensions/` | `extension XxxX on Type { ... }` |
| Util | `core/common/utils/` | `class Xxx { Xxx._(); static ... }` (private constructor) |

## 🎯 Layer separation rules

| Layer | Phép | KHÔNG |
|---|---|---|
| **data/** | Khai báo schema + I/O với network/storage | Business logic, UI |
| **presentation/providers/** | Orchestrate service calls, transform state | Direct UI rendering |
| **presentation/pages/** | UI consume state, navigation, user input | Network calls, business logic |
| **core/** | Shared infra, không feature-specific | Reference feature code |
| **shared/widgets/** | Reusable across 2+ features | Feature-specific UI |

## 📖 Reference feature

**LUÔN đọc `lib/features/_reference/voucher/`** trước khi viết feature mới — đó là pattern chuẩn v2:
- `voucher_model.dart` (23 LOC) — Freezed model với JsonKey naming
- `voucher_service.dart` (23 LOC) — Retrofit service
- `voucher_notifier.dart` (50 LOC) — Notifier với refresh + search
- `voucher_list_page.dart` (87 LOC) — Page với switch state pattern

## ❌ Anti-patterns

```
❌ lib/features/auth/widgets/         # Tạo folder widgets riêng — dùng shared/widgets/ hoặc inline
❌ lib/utils/, lib/helpers/           # Đặt sai chỗ — phải vào core/common/utils/ hoặc extensions/
❌ lib/screens/, lib/pages/           # Sai pattern — pages nằm trong features/{name}/presentation/
❌ Business logic trong service       # Service chỉ I/O — logic vào Notifier
❌ Direct ref.watch() trong service   # Service không biết Riverpod — Notifier inject service
```

## 🗺️ Skill index — đọc theo nhu cầu

| Bạn cần... | Skill |
|---|---|
| Hiểu app khởi động, error zones, env, observers | `app-boot` |
| Viết Notifier / handle async state | `state-management` |
| Tạo service Retrofit / handle error / interceptor | `network-error` |
| Tạo service GraphQL (codegen, type-safe) | `graphql` |
| Đăng ký DI | `dependency-injection` |
| Lưu data (token / prefs / cache / HTTP cache) | `storage-cache` |
| Theme / colors / i18n | `design-system` |
| Thêm route go_router | `routing` |
| Auth / Notification / Permission / AppVersion / Validators | `core-services` |
| Ads / IAP / Analytics / AppConfig | `modules` |
| Multi-flavor + Firebase + Android signing | `firebase-flavors` |
| Catalog shared widget + extensions + base model | `shared-ui-extensions` |
| Makefile / Mason / VSCode tasks / tools/ | `commands` |
| Scaffold feature mới (workflow 5 bước) | `new-feature` |
| Review checklist trước commit | `code-review` |

## 📚 docs/ (Markdown chi tiết hơn skills)

| File | Khi nào đọc |
|---|---|
| `docs/ARCHITECTURE.md` | Reasoning sâu hơn về layer separation, lý do design quyết định |
| `docs/CHECKLIST.md` | Checklist setup project lần đầu (Firebase, signing, env files) |
| `docs/CONTRIBUTING.md` | Quy tắc commit message, branch naming, PR review flow |
| `docs/FEATURES.md` | Danh sách feature đã port + status (Ads/IAP/Auth/...) |
| `README.md` (root) | Quick start, các flavor, commands phổ biến |
