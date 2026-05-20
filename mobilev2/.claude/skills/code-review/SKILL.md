---
name: code-review
description: Checklist review code Flutter theo chuẩn flutter_base2. Dùng khi user nói "review code", "check code", "kiểm tra file có đúng pattern không".
---

# Code Review — flutter_base2

## 🎯 Quy tắc vàng (CẤM vi phạm)

1. ❌ KHÔNG import legacy state management (`flutter_bloc`, `get`, `provider`, `ChangeNotifier`) trong feature mới
2. ❌ KHÔNG dùng `Map<String, dynamic>` cho request body — luôn tạo Freezed Request class
3. ❌ KHÔNG wrap `Result<>` ở service layer — chỉ wrap ở repository (khi có Domain)
4. ❌ KHÔNG hard-code màu/text/dimensions — dùng tokens/l10n
5. ❌ KHÔNG bypass `BaseNotifier.runAsync` (set `state =` thủ công)
6. ✅ LUÔN dùng `prefer_const_constructors` (lint enforce)
7. ✅ LUÔN chạy `make gen` sau khi sửa `@freezed`, `@RestApi`, `@riverpod`, `@injectable`, `@TypedGoRoute`, `@Envied`

## 📋 Service review

```dart
// File: features/{name}/data/services/{name}_service.dart
```

| Check | ✅ ĐÚNG | ❌ SAI |
|---|---|---|
| Constructor | `factory ProductService(Dio dio) = _ProductService;` | `ProductService() : _dio = Dio()` |
| Annotation | `@RestApi()` ở class | Quên annotation |
| Body type | `@Body() CreateProductRequest req` | `@Body() Map<String, dynamic> body` |
| Return type | `Future<ApiResponse<T>>` hoặc `Future<List<T>>` | `Future<Result<ApiResponse<T>>>` |
| Try/catch | KHÔNG có (interceptor handle) | Try/catch ở method |
| Business logic | KHÔNG có | Service tính toán |

## 📋 Model review

```dart
// File: features/{name}/data/models/{name}_model.dart
```

| Check | Pattern |
|---|---|
| Annotation | `@freezed abstract class XxxModel with _$XxxModel` |
| Factory | `const factory XxxModel({...}) = _XxxModel;` |
| fromJson | `factory XxxModel.fromJson(...) => _$XxxModelFromJson(json);` |
| Part files | `part 'xxx_model.freezed.dart'` + `part 'xxx_model.g.dart'` |
| Field name | snake_case JSON → camelCase Dart qua `@JsonKey(name: 'snake_case')` |
| Default | `@Default(0) int count` cho nullable optional |
| DateTime | Dùng `DateTime?` — Freezed/json_serializable auto convert |

```dart
// ✅ Đúng
@freezed
abstract class ProductModel with _$ProductModel {
  const factory ProductModel({
    required String id,
    required String name,
    @JsonKey(name: 'price_vnd') @Default(0) int priceVnd,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
}
```

## 📋 Notifier review

```dart
// File: features/{name}/presentation/providers/{name}_notifier.dart
```

| Check | ✅ ĐÚNG | ❌ SAI |
|---|---|---|
| Annotation | `@riverpod` | `@freezed`, `@injectable` |
| Extends | `extends _$XxxNotifier with BaseNotifier<T>` | `extends StateNotifier`, `extends Cubit` |
| Part file | `part 'xxx_notifier.g.dart';` | Quên |
| Service inject | `_service = XxxService(ref.read(dioProvider))` ở `build()` | Late khai báo bên ngoài |
| Async method | `runAsync`/`runUnwrap`/`runPagination` | `state = AsyncValue.data(...)` |
| Search | `cancelPrevious: true, keepPreviousOnLoading: true` | Quên flags |
| Try/catch | KHÔNG có | Wrap try/catch quanh `runAsync` |
| `successMessage` | Cho mutation (POST/PUT/DELETE) | Cho GET |

```dart
// ✅ Đúng
@riverpod
class ProductNotifier extends _$ProductNotifier with BaseNotifier<List<ProductModel>> {
  late ProductService _service;

  @override
  Future<List<ProductModel>> build() async {
    _service = ProductService(ref.read(dioProvider));
    return _fetchList();
  }

  Future<void> refresh() => runAsync(
        action: _fetchList,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> search(String q) => runAsync(
        action: () => _searchOrFetch(q),
        cancelPrevious: true,
        keepPreviousOnLoading: true,
      );
}
```

## 📋 Page review

```dart
// File: features/{name}/presentation/pages/{name}_page.dart
```

| Check | ✅ ĐÚNG | ❌ SAI |
|---|---|---|
| Base class | `extends HookConsumerWidget` | `StatelessWidget`, `StatefulWidget` (cho data binding) |
| State watch | `ref.watch(xxxProvider)` | `ref.read()` cho rebuild |
| Action call | `ref.read(xxxProvider.notifier).method()` | `ref.watch().method()` |
| Toast | `useAsyncValueChange(state)` (1 dòng) | Manual show snackbar |
| State render | `switch (state) { case AsyncValue(...) }` | If/else chain |
| Loading | `LoadingWidget()` | Inline CircularProgressIndicator |
| Empty | `EmptyWidget()` | Inline "Không có dữ liệu" |
| Error | `ErrorRetry(onRetry: notifier.refresh)` | Inline retry button |
| Text constants | `context.l10n.welcome` | Hard-code `'Welcome'` |
| Colors | `Theme.of(context).colorScheme.primary` | `Colors.blue` |
| Spacing | `AppDimensions.space16` hoặc `16.h` (screenutil) | Magic number `16` |

```dart
// ✅ Đúng
class ProductListPage extends HookConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productProvider);
    final notifier = ref.read(productProvider.notifier);
    useAsyncValueChange(state);

    return AppScaffold(
      appBar: AppBar(title: Text(context.l10n.products)),
      body: switch (state) {
        AsyncValue(:final value?, isLoading: true) =>
          Stack(children: [_list(value), const LinearProgressIndicator()]),
        AsyncData(value: final list) when list.isEmpty => const EmptyWidget(),
        AsyncData(:final value) => _list(value),
        AsyncError(:final error) => ErrorRetry(
          message: error.toString(),
          onRetry: notifier.refresh,
        ),
        _ => const LoadingWidget(),
      },
    );
  }
}
```

## 📋 Route review

```dart
// File: lib/routes/config/app_routes.dart
```

| Check | ✅ ĐÚNG | ❌ SAI |
|---|---|---|
| Annotation | `@TypedGoRoute<XxxRoute>(path: '/x')` | Manual `GoRoute(...)` |
| Mixin | `class XxxRoute extends GoRouteData with $XxxRoute` | Quên mixin |
| ShellRoute | KHÔNG có mixin (extension `$XxxRouteExtension`) | Thêm `with $MainShellRoute` (sai!) |
| Build override | `Widget build(BuildContext context, GoRouterState state)` | — |
| Navigate | `const XxxRoute().go(context)` | `context.go('/x')` (string) |

## 📋 Common pitfalls

### ❌ Quên `make gen` sau khi sửa annotation

```dart
@freezed
abstract class NewModel with _$NewModel { ... }
// → Lỗi "_$NewModel is not defined"
// Fix: make gen
```

### ❌ Hard-code màu

```dart
// ❌
Container(color: Colors.blue);

// ✅
Container(color: Theme.of(context).colorScheme.primary);
```

### ❌ Hard-code chiều

```dart
// ❌
const SizedBox(height: 16);

// ✅
SizedBox(height: AppDimensions.space16);
// hoặc:
SizedBox(height: 16.h);  // screenutil
```

### ❌ Hard-code text

```dart
// ❌
Text('Welcome');

// ✅
Text(context.l10n.welcome);
```

### ❌ Tạo Dio mới

```dart
// ❌
final dio = Dio();
final service = ProductService(dio);

// ✅
final service = ProductService(ref.read(dioProvider));
// hoặc
final service = getIt<ProductService>();
```

### ❌ Service biết Riverpod

```dart
// ❌
class ProductService {
  ProductService(Ref ref) { ... }
}

// ✅
class ProductService {
  factory ProductService(Dio dio) = _ProductService;
}
```

### ❌ Quên cancelPrevious cho search

```dart
// ❌ User gõ liên tục → request chồng chéo, kết quả lộn xộn
Future<void> search(String q) => runAsync(
  action: () => _service.search(q),
);

// ✅
Future<void> search(String q) => runAsync(
  action: () => _service.search(q),
  cancelPrevious: true,
  keepPreviousOnLoading: true,
);
```

### ❌ Hot reload không apply codegen change

Sau khi sửa `.freezed.dart` source → cần hot **RESTART** (không phải hot reload).

### ❌ Toast call trong build phase

```dart
// ❌ Crash "visitChildElements() called during build"
useEffect(() {
  toastification.show(...);
  return null;
}, [state]);

// ✅ Defer qua addPostFrameCallback (useAsyncValueChange đã làm sẵn)
WidgetsBinding.instance.addPostFrameCallback((_) {
  toastification.show(...);
});
```

## 🎯 Review workflow

1. **Read structure** — file ở đúng folder pattern?
2. **Read annotations** — đúng `@freezed`/`@riverpod`/`@RestApi`/`@LazySingleton`?
3. **Read service** — `Dio dio` constructor, KHÔNG try/catch, KHÔNG business logic?
4. **Read notifier** — `BaseNotifier<T>` mixin, `runAsync` flags đúng?
5. **Read page** — `HookConsumerWidget`, `useAsyncValueChange`, switch state?
6. **Read tokens** — màu/text/spacing đúng tokens?
7. **Run `make analyze`** — 0 errors
8. **Run `make gen`** — codegen update
