---
name: state-management
description: Riverpod-only state management với BaseNotifier mixin. Đọc khi viết Notifier mới, gọi API trong app, handle loading/error/success state, search/filter/pagination. Cấm dùng BLoC/Cubit/GetX/setState cho async logic.
---

# State Management — Riverpod + BaseNotifier

## ⚠️ Quy tắc tuyệt đối

✅ **DÙNG**: Riverpod codegen (`@riverpod`) + `BaseNotifier<T>` mixin
❌ **KHÔNG DÙNG**: `flutter_bloc`, `Cubit`, `GetX`, `Provider`, `ChangeNotifier`, raw `StateNotifier`

## 🎯 BaseNotifier mixin

**Path**: `lib/core/base/riverpod/base_notifier.dart`

```dart
mixin BaseNotifier<T> on $AsyncNotifier<T> {
  Failure? get lastFailure;
  String? get pendingSuccessMessage;
  bool get isEmpty;

  Future<void> runAsync({...});
  Future<void> runUnwrap<R>({...});
  Future<void> runPagination<R>({...});
  Future<void> runResult<R>({...});
}
```

→ Mọi async logic phải đi qua 1 trong 4 method `run*`. Không gọi `state = ...` thủ công.

## 📋 Method selection — chọn theo service return type

| Service trả về | Method | Khi nào |
|---|---|---|
| `Future<T>` raw | `runAsync` | Service tự throw exception, action trả thẳng data |
| `Future<ApiResponse<R>>` | `runUnwrap` | Service trả wrapper — auto check `isSuccess` + extract `data` |
| `Future<ApiResponse<ApiPaginatedData<R>>>` | `runPagination` | Pagination — service trả page object |
| `Future<Result<R>>` | `runResult` | Repository trả Result (chỉ khi có Domain layer) |

## 🎨 Pattern chuẩn — viết Notifier mới

### List + refresh + search (case phổ biến nhất)

```dart
import 'package:flutter_base2/core/base/di/dio_provider.dart';
import 'package:flutter_base2/core/base/errors/failures.dart';
import 'package:flutter_base2/core/base/riverpod/base_notifier.dart';
import 'package:flutter_base2/features/product/data/models/product_model.dart';
import 'package:flutter_base2/features/product/data/services/product_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'product_notifier.g.dart';

@riverpod
class ProductNotifier extends _$ProductNotifier
    with BaseNotifier<List<ProductModel>> {
  late ProductService _service;

  @override
  Future<List<ProductModel>> build() async {
    _service = ProductService(ref.read(dioProvider));
    return _fetchList();
  }

  Future<List<ProductModel>> _fetchList() async {
    final response = await _service.getProducts();
    if (!response.isSuccess || response.data == null) {
      throw ServerFailure(response.message ?? 'Lỗi tải sản phẩm');
    }
    return response.data!;
  }

  Future<void> refresh() => runAsync(
        action: _fetchList,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> search(String query) => runAsync(
        action: () async {
          if (query.isEmpty) return _fetchList();
          final response = await _service.search(query);
          if (!response.isSuccess || response.data == null) {
            throw ServerFailure(response.message ?? 'Lỗi tìm kiếm');
          }
          return response.data!;
        },
        cancelPrevious: true,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );
}
```

### Form submit (POST/PUT — nullable state)

```dart
@riverpod
class LoginNotifier extends _$LoginNotifier with BaseNotifier<AuthResponse?> {
  late AuthService _service;

  @override
  Future<AuthResponse?> build() async {
    _service = AuthService(ref.read(dioProvider));
    return null; // initial state — null = chưa submit
  }

  Future<void> login(String email, String password) => runAsync(
        action: () async {
          final response = await _service.login(
            LoginRequest(email: email, password: password),
          );
          if (!response.isSuccess || response.data == null) {
            throw ServerFailure(response.message ?? 'Đăng nhập thất bại');
          }
          await ref.read(appAuthProvider.notifier).login(
                response.data!.accessToken,
              );
          return response.data;
        },
        successMessage: 'Đăng nhập thành công',
        errorMessage: 'Đăng nhập thất bại',
      );
}
```

### Pagination (load more)

```dart
@riverpod
class ProductListNotifier extends _$ProductListNotifier
    with BaseNotifier<List<ProductModel>> {
  late ProductService _service;
  int _page = 1;
  bool _hasMore = true;

  @override
  Future<List<ProductModel>> build() async {
    _service = ProductService(ref.read(dioProvider));
    return _fetchPage(reset: true);
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    await runPagination(
      action: () => _service.getList(page: _page),
      mapper: (page) {
        _hasMore = page.hasMore;
        _page = page.nextPage;
        return [...state.value ?? [], ...page.items];
      },
    );
  }
}
```

## 🚩 runAsync flags

| Flag | Default | Khi nào dùng |
|---|---|---|
| `cancelPrevious: true` | false | **Bắt buộc** cho search/filter (user gõ liên tục) |
| `keepPreviousOnLoading: true` | false | Refresh, search — giữ data cũ tránh flash trắng |
| `emitEmptyForEmptyList: true` | false | List có thể rỗng — UI dùng `notifier.isEmpty` |
| `successMessage: 'Done'` | null | Auto toast qua `useAsyncValueChange` hook |
| `errorMessage: 'Failed'` | null | Prefix cho error toast |
| `onError: (e, s) => _rollback()` | null | Optimistic update rollback |

## 🎭 Page pattern — consume state

```dart
class ProductListPage extends HookConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchCtl = useTextEditingController();
    final state = ref.watch(productProvider);
    final notifier = ref.read(productProvider.notifier);

    useAsyncValueChange(state); // ⚡ Auto toast success/error

    return AppScaffold(
      appBar: AppBar(title: const Text('Products')),
      body: Column(
        children: [
          AppTextField(
            controller: searchCtl,
            onChanged: notifier.search,
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: notifier.refresh,
              child: switch (state) {
                AsyncValue(:final value?, isLoading: true) => Stack(
                    children: [
                      _buildList(value),
                      const LinearProgressIndicator(),
                    ],
                  ),
                AsyncData(value: final list) when list.isEmpty =>
                  const EmptyWidget(),
                AsyncData(:final value) => _buildList(value),
                AsyncError(:final error) => ErrorRetry(
                    message: error.toString(),
                    onRetry: notifier.refresh,
                  ),
                _ => const LoadingWidget(),
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

## 🎣 useAsyncValueChange hook

**Path**: `lib/core/base/riverpod/riverpod_listeners.dart`

```dart
void useAsyncValueChange<T>(
  AsyncValue<T> state, {
  String? successMessage,
  String Function(Object error)? errorMessage,
})
```

→ Tự fire toast khi state transition:
- `AsyncError` → error toast với message từ `state.error.toString()`
- `AsyncData` (sau loading) → success toast nếu có `successMessage` ở runAsync

→ Gọi **1 dòng** ở đầu `build()` của HookConsumerWidget.

## ❌ Anti-patterns

```dart
// ❌ Gọi state = ... thủ công
state = AsyncValue.data(result);

// ✅ Dùng run* methods
await runAsync(action: () async => result);

// ❌ Try/catch trong notifier
try {
  final data = await _service.getList();
  state = AsyncValue.data(data);
} catch (e) {
  state = AsyncValue.error(e, st);
}

// ✅ runAsync tự handle
await runAsync(action: _service.getList);

// ❌ Search không cancelPrevious
Future<void> search(String q) => runAsync(action: () => _service.search(q));

// ✅ Search PHẢI cancelPrevious
Future<void> search(String q) => runAsync(
  action: () => _service.search(q),
  cancelPrevious: true,
  keepPreviousOnLoading: true,
);

// ❌ Service biết Riverpod
class ProductService {
  ProductService(Ref ref) { ... }
}

// ✅ Service chỉ I/O — Notifier inject
class ProductService {
  ProductService(Dio dio) { ... }
}
```

## 📂 Files cần đọc khi viết Notifier mới

1. `lib/core/base/riverpod/base_notifier.dart` — full signature các method
2. `lib/features/_reference/voucher/presentation/providers/voucher_notifier.dart` — pattern chuẩn
3. `lib/features/auth/presentation/providers/auth_notifier.dart` — pattern form submit
