---
name: new-feature
description: Workflow hoàn chỉnh tạo feature mới (Mason scaffold + customize + register route + test). Dùng khi user nói "tạo feature/màn hình/module mới" hoặc bắt đầu 1 phần UI nghiệp vụ mới.
---

# New Feature Workflow

## 🎯 Pattern

V2 dùng **Feature-first + Riverpod-only** pattern. Mỗi feature 1 folder độc lập với 4 files cơ bản (lean) hoặc 6+ (full với Domain).

## 🚀 5 bước

### Bước 1: Scaffold qua Mason brick

```bash
make feature-lean name=product
```

→ Sinh `lib/features/product/`:
```
data/
├── models/product_model.dart           # @freezed
└── services/product_service.dart       # @RestApi paginated
presentation/
├── providers/product_notifier.dart    # BaseNotifier với refresh/search/loadMore
└── pages/product_list_page.dart       # HookConsumerWidget switch state
```

### Bước 2: Customize model

`lib/features/product/data/models/product_model.dart`:

```dart
@freezed
abstract class ProductModel with _$ProductModel {
  const factory ProductModel({
    required String id,
    required String name,
    String? description,
    @JsonKey(name: 'price_vnd') @Default(0) int priceVnd,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'category_id') String? categoryId,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
}
```

→ Field theo schema API thật. Dùng `@JsonKey(name: 'snake_case')` cho key khác camelCase.

### Bước 3: Customize service endpoints

`lib/features/product/data/services/product_service.dart`:

```dart
@RestApi()
abstract class ProductService {
  factory ProductService(Dio dio) = _ProductService;

  @GET('/api/v1/products')                    // ← đổi path thật
  Future<ApiResponse<ApiPaginatedData<ProductModel>>> getList({
    @Query('page') int page = 1,
    @Query('per_page') int perPage = 20,
    @Query('q') String? query,
    @Query('category_id') String? categoryId,  // ← thêm filter
  });

  @GET('/api/v1/products/{id}')
  Future<ApiResponse<ProductModel>> getDetail(@Path('id') String id);

  // Thêm endpoints nếu cần
  @POST('/api/v1/products')
  Future<ApiResponse<ProductModel>> create(@Body() CreateProductRequest request);

  @PUT('/api/v1/products/{id}')
  Future<ApiResponse<ProductModel>> update(
    @Path('id') String id,
    @Body() UpdateProductRequest request,
  );

  @DELETE('/api/v1/products/{id}')
  Future<void> delete(@Path('id') String id);
}
```

→ Nếu POST/PUT, tạo Request classes (Freezed) tương tự.

### Bước 4: Thêm route

`lib/routes/config/app_routes.dart`:

```dart
// Thêm vào ShellRoute children (nếu là bottom nav child)
@TypedShellRoute<MainShellRoute>(
  routes: [
    TypedGoRoute<HomeRoute>(path: '/'),
    TypedGoRoute<SettingsRoute>(path: '/settings'),
    TypedGoRoute<VoucherListRoute>(path: '/vouchers'),
    TypedGoRoute<ProductListRoute>(path: '/products'),  // ← thêm
  ],
)
class MainShellRoute extends ShellRouteData { ... }

class ProductListRoute extends GoRouteData with $ProductListRoute {
  const ProductListRoute();
  @override
  Widget build(BuildContext context, GoRouterState state) =>
      const ProductListPage();
}

// Detail route (top-level)
@TypedGoRoute<ProductDetailRoute>(path: '/products/:id')
class ProductDetailRoute extends GoRouteData with $ProductDetailRoute {
  const ProductDetailRoute({required this.id});
  final String id;

  @override
  Widget build(BuildContext context, GoRouterState state) =>
      ProductDetailPage(id: id);
}
```

`lib/routes/config/route_names.dart` (optional — convenience):

```dart
static const String productList = '/products';
static const String productDetail = '/products/:id';
static String productDetailPath(String id) => '/products/$id';
```

### Bước 5: Generate + test

```bash
make gen        # build_runner sinh .g.dart + .freezed.dart cho 4 files mới
make analyze    # 0 errors
make run-dev    # test
```

## 🎨 Customize Notifier nâng cao

Brick scaffold đã có sẵn `refresh()`, `search()`, `loadMore()`. Mở rộng tuỳ feature:

### Filter theo category

```dart
String? _categoryId;

Future<void> filterByCategory(String? categoryId) => runAsync(
      action: () {
        _categoryId = categoryId;
        _page = 1;
        return _fetchPage(reset: true);
      },
      cancelPrevious: true,
      keepPreviousOnLoading: true,
    );
```

### CRUD optimistic update

```dart
Future<void> delete(String id) async {
  final current = state.value ?? [];

  // Optimistic remove
  state = AsyncValue.data(current.where((p) => p.id != id).toList());

  await runAsync(
    action: () async {
      await _service.delete(id);
      return state.value!; // giữ list hiện tại
    },
    onError: (e, s) {
      // Rollback nếu fail
      state = AsyncValue.data(current);
    },
  );
}

Future<void> create(CreateProductRequest request) => runAsync(
      action: () async {
        final response = await _service.create(request);
        if (!response.isSuccess || response.data == null) {
          throw ServerFailure(response.message ?? 'Failed');
        }
        final current = state.value ?? [];
        return [response.data!, ...current];
      },
      successMessage: 'Tạo thành công',
      keepPreviousOnLoading: true,
    );
```

## 🎯 Page navigate

```dart
// Vào detail
const ProductDetailRoute(id: '123').push(context);
// hoặc string-based
context.go(RouteNames.productDetailPath('123'));

// Back
context.pop();
```

## 📋 Checklist sau khi tạo

| Item | Kiểm tra |
|---|---|
| Model | `@freezed`, `fromJson` factory, `@JsonKey` đúng tên server |
| Service | `@RestApi`, factory constructor, path đúng, Request class (KHÔNG Map) |
| Notifier | `extends _$XxxNotifier with BaseNotifier<T>`, `@riverpod` annotation |
| Page | `extends HookConsumerWidget`, `useAsyncValueChange(state)` |
| Route | `@TypedGoRoute` + `with $XxxRoute` mixin, register vào ShellRoute nếu cần |
| Codegen | `.g.dart` + `.freezed.dart` sinh ra sau `make gen` |
| Test | `make analyze` 0 errors, `make run-dev` UI render |

## 🌳 Khi nào dùng Domain layer (Full feature)?

**KHÔNG mặc định**. Chỉ thêm `domain/` layer khi:
- Business rules phức tạp (vd. tính giá có VAT + discount + voucher chồng chéo)
- Cần Repository pattern để swap data source (REST → GraphQL mocking)
- Có Use Cases tái sử dụng giữa nhiều Notifiers

Cấu trúc full feature (rare):
```
features/product/
├── data/
│   ├── models/
│   ├── services/
│   ├── repositories/             # ProductRepositoryImpl
│   └── mappers/                  # DTO ↔ Entity
├── domain/
│   ├── entities/                 # ProductEntity (pure Dart)
│   ├── repositories/             # abstract ProductRepository
│   └── usecases/                 # GetProductsUseCase, BuyProductUseCase
└── presentation/
```

→ 90% feature dùng lean. Chỉ promote sang full khi cần thiết.

## 📂 Files tham khảo

| Pattern | File |
|---|---|
| Reference feature (lean) | `lib/features/_reference/voucher/` |
| Auth flow (form submit) | `lib/features/auth/` |
| Shared widgets có sẵn | `lib/shared/widgets/base/` |
| State widgets (loading/empty/error) | `lib/shared/widgets/states/` |
| Brick template | `bricks/feature_lean/__brick__/` |

## ❌ Anti-patterns

```dart
// ❌ Tạo widget folder trong feature
lib/features/product/widgets/

// ✅ Inline trong page hoặc shared/widgets/ nếu tái dùng
lib/features/product/presentation/pages/product_list_page.dart  // inline
lib/shared/widgets/product_card.dart                              // reusable

// ❌ Tạo screens/ folder thay vì features/{name}/presentation/pages/
lib/screens/product_list.dart

// ✅ Theo pattern v2
lib/features/product/presentation/pages/product_list_page.dart

// ❌ Service biết Riverpod
class ProductService {
  ProductService(Ref ref);
}

// ✅ Service chỉ I/O — Notifier inject service
class ProductService {
  factory ProductService(Dio dio) = _ProductService;
}
```
