# flutter_base2

> Production-ready Flutter base template — **Riverpod + Clean Architecture + Multi-flavor**.
> Kế thừa & nâng cấp từ `flutter_base` (v1).

## ✨ Highlights

- 🎯 **Riverpod-only** state management (với `BaseNotifier` mixin)
- 🏗️ **Feature-first** Clean Architecture
- 🌍 **Multi-flavor**: dev / stg / prod
- 🔐 **Typed env** qua `envied`
- 🤖 **Code-gen** đầy đủ: freezed, json_serializable, retrofit, injectable, riverpod, go_router_builder
- 🎨 **Material 3** design system với token-based theming (4 variants: light/dark/red/green)
- 🌐 **i18n** chuẩn Flutter team (ARB + flutter_localizations) + auto-translate script
- 🔥 **Firebase**: Core, Analytics, Crashlytics, Remote Config
- 🧪 **Test scaffold** đầy đủ + golden tests
- 🚀 **CI/CD** GitHub Actions + Fastlane

## 📦 Built-in Services & Modules

| | |
|---|---|
| 📬 **NotificationService** | Local notification (`flutter_local_notifications`) |
| 🔐 **PermissionService** | Auto request + "Mở settings" dialog (`permission_handler`) |
| 🆙 **AppVersionService** | Force/optional update via Remote Config + dialog UI |
| ⚡ **QuickActionsService** | Home screen shortcuts (`quick_actions`) + Android XML / iOS imageset sẵn |
| 📷 **ImagePickerUtils** | Pick/compress ảnh với permission check |
| 📢 **AdManager** | AdMob full stack: Inter / AppOpen / Rewarded / Native / Banner |
| 💳 **IapService** | RevenueCat IAP — env-aware (real prod/stg, mock dev) |
| 📊 **AnalyticsService** | Firebase Analytics + Ad Revenue tracking |
| ⚙️ **AppConfigService** | Maintenance mode + notice banner + legal URLs (JSON Remote Config) |

→ Chi tiết cách dùng từng service: [`docs/FEATURES.md`](./docs/FEATURES.md)

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| State | flutter_riverpod 3.3 + hooks_riverpod + flutter_hooks |
| DI | get_it 9 + injectable 2.5 |
| Network | dio 5.8 + retrofit 4.9 |
| Routing | go_router 17 (typed) |
| Models | freezed 3 + json_serializable 6 |
| Storage | shared_preferences + flutter_secure_storage |
| UI | Material 3 + flutter_screenutil + cached_network_image |
| L10n | flutter_localizations + ARB |
| Test | mocktail + golden_toolkit |

## 🚀 Quick Start

```bash
# 1. Cài Flutter version đúng (xem .fvmrc)
fvm install

# 2. Cài dependencies
make get

# 3. Generate flavors (chỉ chạy 1 lần khi setup)
make gen-flavor

# 4. Đổi tên package
make rename-package name="your_app"
make rename-app name="Your App"

# 5. Generate code & l10n
make full-gen

# 6. Cấu hình env
cp .env.example .env.dev   # và .env.stg, .env.prod

# 7. Chạy app
make run-dev
```

## 📚 Documentation

- 📘 [PLAN.md](./PLAN.md) — Master plan & roadmap triển khai
- 🏛️ [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture deep-dive
- 📚 [docs/FEATURES.md](./docs/FEATURES.md) — **Cách dùng services / modules / extensions có sẵn**
- ✅ [docs/CHECKLIST.md](./docs/CHECKLIST.md) — Checklist khi clone project (+ AdMob/RevenueCat/iOS permission setup)
- 🤝 [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Code style & conventions
- 🤖 [CLAUDE.md](./CLAUDE.md) — Hướng dẫn AI assistant

## 📂 Cấu trúc

```
lib/
├── config/          # Flavor, env, initializer
├── core/            # DI, errors, network, storage, services
├── design/          # Theme, l10n
├── shared/          # Base models, shared widgets
├── features/        # Business modules (feature-first)
├── modules/         # Ads, Analytics, IAP, AppConfig
├── routes/          # GoRouter typed
├── gen/             # Generated (assets, l10n)
├── main_common.dart
├── main_dev.dart
├── main_stg.dart
├── main_prod.dart
└── app.dart
```

## 🧰 Lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `make get` | pub get |
| `make gen` | build_runner build |
| `make watch` | build_runner watch |
| `make l10n` | Generate localizations |
| `make full-gen` | clean + get + l10n + gen |
| `make analyze` | flutter analyze |
| `make format` | dart format |
| `make test` | flutter test |
| `make cov` | test + coverage HTML |
| `make run-dev` | Chạy flavor dev |
| `make apk-prod` | Build APK prod |
| `make aab-prod` | Build AAB prod |
| `make feature-lean name=foo` | Scaffold feature mới |
| `make help` | Xem tất cả lệnh |

## 📝 License

MIT
