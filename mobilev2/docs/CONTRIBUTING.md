# 🤝 Contributing Guide

## Quy ước Commit (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | Khi dùng |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Tái cấu trúc code (không thay đổi behaviour) |
| `perf` | Tối ưu hiệu năng |
| `style` | Format, lint (không thay đổi logic) |
| `test` | Thêm/sửa test |
| `docs` | Tài liệu |
| `chore` | Build, deps, tools |
| `ci` | CI/CD config |

**Ví dụ:**
```
feat(auth): add OTP login flow
fix(network): retry on 401 should not loop infinitely
refactor(core): extract DioClient interceptor order
```

---

## Branch naming

```
feature/<ticket>-<short-desc>
fix/<ticket>-<short-desc>
hotfix/<ticket>-<short-desc>
refactor/<short-desc>
```

---

## PR checklist

- [ ] Code đã pass `make analyze && make format`
- [ ] Tests added/updated nếu cần
- [ ] `make gen` đã chạy nếu sửa freezed / retrofit / riverpod / route / envied
- [ ] Không có `print()` / `debugPrint()` để lại
- [ ] Commit messages theo Conventional Commits
- [ ] Đã rebase với `main`
- [ ] PR title ≤ 70 ký tự
- [ ] PR description mô tả: **What / Why / How tested**

---

## Code style — Quy ước project

### 1. Import order
```dart
// 1. Dart SDK
import 'dart:async';

// 2. Flutter SDK
import 'package:flutter/material.dart';

// 3. Third-party packages
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 4. Project (always_use_package_imports)
import 'package:your_app/core/...';
import 'package:your_app/features/...';

// 5. Relative (last resort — only within same feature)
import 'models/voucher_model.dart';
```

### 2. File naming
- `snake_case.dart` cho tất cả file Dart
- `feature_name_page.dart`, `feature_name_notifier.dart`, `feature_name_service.dart`
- Generated file: tự động bởi codegen — KHÔNG sửa tay

### 3. Class naming
- `NamePage` (widget)
- `NameNotifier` (riverpod)
- `NameService` (retrofit)
- `NameModel` (data model)
- `NameRequest` / `NameResponse` (API DTO)

### 4. Avoid these patterns

```dart
// ❌ KHÔNG: Map<String, dynamic> cho request body
@POST('/login')
Future<Response> login(@Body() Map<String, dynamic> body);

// ✅ NÊN: Freezed Request class
@POST('/login')
Future<ApiResponse<AuthResponse>> login(@Body() LoginRequest request);

// ❌ KHÔNG: BLoC/Cubit/GetX trong feature mới
class AuthCubit extends Cubit<AuthState> { ... }

// ✅ NÊN: Riverpod Notifier
@riverpod
class AuthNotifier extends _$AuthNotifier with BaseNotifier<User?> { ... }

// ❌ KHÔNG: try-catch khắp nơi
try {
  final r = await service.get();
  emit(state.copyWith(data: r));
} catch (e) { emit(...); }

// ✅ NÊN: dùng runAsync (BaseNotifier tự handle)
Future<void> refresh() => runAsync(action: service.get);
```

### 5. Comments
- KHÔNG viết comment giải thích "code làm gì" — đặt tên rõ ràng là đủ
- CHỈ viết comment khi "tại sao" non-obvious:
  - Workaround bug specific
  - Hidden constraint
  - Subtle invariant

---

## Khi sửa code-gen target

| Sửa | Chạy sau |
|---|---|
| `@freezed`, `@JsonSerializable` | `make gen` |
| `@RestApi` | `make gen` |
| `@riverpod` | `make gen` |
| `@injectable`, `@LazySingleton`, `@module` | `make gen` |
| `@TypedGoRoute` | `make gen` |
| `@Envied` | `make gen` |
| `.arb` files | `make l10n` |
| `pubspec.yaml` deps | `make get` |

Hoặc 1 phát: `make full-gen`

---

## Test convention

```dart
// test/unit/features/auth/auth_notifier_test.dart
void main() {
  group('AuthNotifier', () {
    late ProviderContainer container;
    late MockAuthService service;

    setUp(() {
      service = MockAuthService();
      container = ProviderContainer(overrides: [
        authServiceProvider.overrideWithValue(service),
      ]);
      addTearDown(container.dispose);
    });

    test('login success emits user', () async {
      when(() => service.login(any())).thenAnswer((_) async => fakeUser);

      await container.read(authProvider.notifier).login(req);
      expect(container.read(authProvider).value, fakeUser);
    });
  });
}
```

---

## Khi nào cần Domain layer?

| Tình huống | Có Domain layer? |
|---|---|
| CRUD đơn giản, ánh xạ 1-1 từ API | ❌ Không cần |
| Cần combine nhiều data source | ✅ Có (Repository) |
| Business rules phức tạp (calculation, validation chain) | ✅ Có (UseCase) |
| Cần test logic isolated khỏi UI & network | ✅ Có |

→ Mặc định **lean** (không có Domain). Add khi cần.
