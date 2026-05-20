---
name: commands
description: Makefile targets + Mason bricks + tools/ Dart scripts + VSCode tasks. Đọc khi cần biết "lệnh nào để làm X" — build, gen, test, scaffold, rename package, format.
---

# Commands — Makefile + Mason + Tools

## 🔨 Makefile (`Makefile`)

### Dependencies
```bash
make get                    # fvm flutter pub get
make clean                  # fvm flutter clean
make upgrade                # fvm flutter pub upgrade --major-versions
```

### Code generation
```bash
make gen                    # build_runner build (freezed, json, retrofit, riverpod, injectable, go_router_builder, envied)
make watch                  # build_runner watch (incremental, dev mode)
make l10n                   # flutter gen-l10n (sinh app_localizations.dart)
make l10n-sync              # Sync missing ARB keys (copy en → vi placeholder)
make l10n-sync-translate    # Sync + auto-translate Google + gen-l10n
make full-gen               # clean + get + l10n + gen (1 lệnh tổng)

make gen-flavor             # flutter_flavorizr (chỉ google:firebase nhờ instructions block)
make gen-icons              # flutter_launcher_icons (generate launcher icon từ assets)
make gen-splash             # flutter_native_splash (generate native splash)
```

### Quality
```bash
make analyze                # flutter analyze
make format                 # dart format .
make fix                    # dart fix --apply
```

### Testing
```bash
make test                   # flutter test
make cov                    # test --coverage + genhtml (cần `brew install lcov`)
```

### Run per flavor
```bash
make run-dev | run-stg | run-prod
```

### Build APK / AAB
```bash
make apk-dev | apk-stg | apk-prod     # APK release per flavor
make aab-prod                          # AAB cho Play Store

# Output: build/app/outputs/apk/{flavor}/release/myapp-{flavor}-release-v1.0.0(1).apk
# Tự rename qua rename-outputs.gradle.kts
# Tự mở Finder qua open-folder.gradle.kts
```

### Scaffold (Mason)
```bash
make feature-lean name=product
# → sinh lib/features/product/{data/{models,services},presentation/{providers,pages}}
```

### Rename
```bash
make rename-package name=new_pkg_name      # đổi package name trong pubspec + imports
make rename-app name="App Name"            # đổi display name
make rename-bundle-id name=com.x.y         # đổi bundle ID toàn dự án
```

## 🎨 VSCode Tasks (`.vscode/tasks.json`)

| Task | Lệnh |
|---|---|
| ⚡ Build Runner: Build | `make gen` |
| ⚡ Build Runner: Watch | `make watch` |
| 🌐 Generate Localizations | `make l10n` |
| 🔥 Full Generate | `make full-gen` |
| 🔍 Analyze | `make analyze` |
| 🎨 Format | `make format` |
| 🧪 Test | `make test` |
| 📈 Coverage | `make cov` |

→ Trigger qua `Cmd+Shift+P` → "Tasks: Run Task".

## 🧱 Mason bricks (`bricks/`)

### feature_lean — Scaffold feature mới

```bash
make feature-lean name=product
# hoặc
mason make feature_lean --name product
```

→ Sinh 4 files trong `lib/features/product/`:
- `data/models/product_model.dart` (@freezed)
- `data/services/product_service.dart` (@RestApi với paginated list)
- `presentation/providers/product_notifier.dart` (BaseNotifier + refresh/search/loadMore)
- `presentation/pages/product_list_page.dart` (HookConsumerWidget switch state pattern)

### Setup Mason lần đầu

```bash
dart pub global activate mason_cli
mason get   # sync brick từ mason.yaml (bricks/feature_lean)
```

### Sau scaffold

```bash
make gen   # build_runner sinh .g.dart + .freezed.dart cho files mới
```

## 🛠️ Dart tools (`tools/`)

### l10n_sync.dart — Sync ARB keys

```bash
make l10n-sync                # copy keys thiếu từ en → vi (giữ raw)
make l10n-sync-translate      # auto-translate qua Google + gen-l10n
```

→ Phù hợp khi thêm key vào `app_vi.arb` mà `app_en.arb` chưa có (hoặc ngược lại).

## ⚡ Workflow phổ biến

### Setup project lần đầu
```bash
fvm install                          # cài Flutter version trong .fvmrc
make get                             # pub get
make gen-flavor                      # generate Android/iOS multi-flavor (lần đầu)
make rename-package name="my_app"    # rename package
make rename-app name="My App"
make rename-bundle-id name=com.my.app
make full-gen                        # generate code + l10n
make run-dev                         # chạy thử
```

### Workflow daily
```bash
make watch &                         # background: build_runner watch
# Edit code...
make analyze                          # check lỗi
make run-dev                         # hot reload
```

### Tạo feature mới
```bash
make feature-lean name=order
# Edit model fields trong order_model.dart
# Edit endpoint trong order_service.dart
make gen                             # regenerate
# Thêm route vào app_routes.dart → make gen
```

### Release build
```bash
make gen-icons                       # update launcher icon
make gen-splash                      # update native splash
make aab-prod                        # AAB cho Play Store
make apk-prod                        # APK cho QA / sideload
```

### Update deps
```bash
make upgrade                          # upgrade major versions
# Test kỹ trước khi commit
fvm flutter pub outdated             # xem deps có version mới
```

## 🌍 Cross-platform

### macOS / Linux
```bash
make <target>      # native bash
```

### Windows
- Cài Git Bash (có sẵn nếu cài Git)
- VSCode `.vscode/settings.json` đã set Git Bash là default terminal cho Windows
- `make` chạy được trong Git Bash

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `Makefile` | Tất cả lệnh — Mac/Linux/WindowsGitBash |
| `.vscode/tasks.json` | VSCode task UI shortcuts |
| `.run/*.run.xml` | Android Studio / IntelliJ run configs |
| `mason.yaml` | Mason bricks registry |
| `bricks/feature_lean/` | Mason brick template |
| `tools/l10n_sync.dart` | CLI ARB sync tool |

## ❌ Common mistakes

```bash
# ❌ Gọi flutter trực tiếp (không qua FVM)
flutter pub get          # → có thể dùng wrong Flutter version

# ✅ Qua FVM (đảm bảo đúng Flutter 3.44.0 theo .fvmrc)
fvm flutter pub get
make get

# ❌ Forget `make gen` sau khi sửa @freezed/@riverpod/@RestApi/@injectable/@TypedGoRoute/@Envied
# → Lỗi "_$Xxx is not defined"

# ✅ Sau MỌI thay đổi annotation:
make gen

# ❌ Chạy gen-flavor nhiều lần
# → Mỗi lần overwrite app.dart/Info.plist/build.gradle.kts!

# ✅ Chỉ chạy gen-flavor 1 lần ban đầu hoặc khi cần re-init
# (instructions block trong flavorizr.yaml đã bảo vệ — chỉ chạy google:firebase)
```
