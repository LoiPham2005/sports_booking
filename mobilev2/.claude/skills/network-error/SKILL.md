---
name: network-error
description: DioClient + Retrofit service pattern + Failure/Result error handling. Đọc khi viết service gọi API, define Request/Response model, throw exception trong notifier, hoặc add interceptor.
---

# Network + Error Handling

## 🌐 DioClient setup

**Path**: `lib/core/data/network/dio_client.dart`

```dart
@LazySingleton()
class DioClient {
  DioClient(NetworkInfo info, SecureStorageService secureStorage) {
    dio = Dio(BaseOptions(
      baseUrl: FlavorConfig.current.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ));

    dio.interceptors.addAll([
      SmartCacheInterceptor(),       // 1. Cache response theo strategy
      AuthInterceptor(secureStorage), // 2. Attach token tự động
      RetryInterceptor(),             // 3. Retry timeout / 5xx
      NetworkCheckInterceptor(info),  // 4. Check internet trước
      LoggingInterceptor(),           // 5. Log request/response
    ]);
  }

  late final Dio dio;
}
```

→ **Không tạo Dio mới ở service**. Inject `dioProvider` qua Riverpod hoặc `getIt<Dio>()`.

## 📡 Retrofit service pattern

### ✅ ĐÚNG — service chỉ I/O

```dart
import 'package:dio/dio.dart';
import 'package:flutter_base2/core/common/constants/api_endpoints.dart';
import 'package:flutter_base2/core/data/network/api_response.dart';
import 'package:flutter_base2/core/data/network/api_paginated_data.dart';
import 'package:flutter_base2/features/product/data/models/product_model.dart';
import 'package:retrofit/retrofit.dart';

part 'product_service.g.dart';

@RestApi()
abstract class ProductService {
  factory ProductService(Dio dio) = _ProductService;

  @GET(ApiEndpoints.products)
  Future<ApiResponse<List<ProductModel>>> getList();

  @GET('${ApiEndpoints.products}/{id}')
  Future<ApiResponse<ProductModel>> getDetail(@Path('id') String id);

  @GET('${ApiEndpoints.products}/search')
  Future<ApiResponse<List<ProductModel>>> search(@Query('q') String query);

  @POST(ApiEndpoints.products)
  Future<ApiResponse<ProductModel>> create(@Body() CreateProductRequest request);

  @PUT('${ApiEndpoints.products}/{id}')
  Future<ApiResponse<ProductModel>> update(
    @Path('id') String id,
    @Body() UpdateProductRequest request,
  );

  @DELETE('${ApiEndpoints.products}/{id}')
  Future<void> delete(@Path('id') String id);
}
```

### ❌ SAI — Map<String, dynamic> cho body

```dart
// ❌ KHÔNG dùng Map cho body
@POST('/products')
Future<ApiResponse<ProductModel>> create(@Body() Map<String, dynamic> body);

// ✅ LUÔN tạo Request class với @freezed
@freezed
abstract class CreateProductRequest with _$CreateProductRequest {
  const factory CreateProductRequest({
    required String name,
    required double price,
    String? description,
  }) = _CreateProductRequest;

  factory CreateProductRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateProductRequestFromJson(json);
}
```

## 📦 ApiResponse<T>

**Path**: `lib/core/data/network/api_response.dart`

```dart
@Freezed(genericArgumentFactories: true)
abstract class ApiResponse<T> with _$ApiResponse<T> {
  const factory ApiResponse({
    @JsonKey(name: 'success') @Default(true) bool isSuccess,
    T? data,
    String? message,
    @JsonKey(name: 'meta') Map<String, dynamic>? meta,
  }) = _ApiResponse<T>;

  factory ApiResponse.fromJson(...);
}
```

→ Server response format:
```json
{
  "success": true,
  "data": {...},
  "message": "OK",
  "meta": { "total": 100 }
}
```

## 📄 ApiPaginatedData<T> — pagination

**Path**: `lib/core/data/network/api_paginated_data.dart`

```dart
@Freezed(genericArgumentFactories: true)
abstract class ApiPaginatedData<T> with _$ApiPaginatedData<T> {
  const factory ApiPaginatedData({
    @Default([]) List<T> items,
    @JsonKey(name: 'current_page') @Default(1) int currentPage,
    @JsonKey(name: 'total_pages') @Default(1) int totalPages,
    @JsonKey(name: 'total_items') @Default(0) int totalItems,
    @JsonKey(name: 'per_page') @Default(20) int perPage,
  }) = _ApiPaginatedData<T>;

  bool get hasMore => currentPage < totalPages;
  bool get isEmpty => items.isEmpty;
  int get nextPage => currentPage + 1;
}
```

Service trả về:
```dart
@GET('/products')
Future<ApiResponse<ApiPaginatedData<ProductModel>>> getList(
  @Query('page') int page,
  @Query('per_page') int perPage,
);
```

## ❌ Error handling — Failure types

**Path**: `lib/core/base/errors/failures.dart`

```dart
sealed class Failure extends Equatable {
  const Failure(this.message, {this.code});
  final String message;
  final int? code;
}

class NetworkFailure extends Failure        // Mất mạng / timeout
class ServerFailure extends Failure         // 5xx
class UnauthorizedFailure extends Failure   // 401
class ValidationFailure extends Failure {   // 422 — field errors
  final Map<String, List<String>> errors;
}
class CacheFailure extends Failure          // Cache miss / expire
class UnknownFailure extends Failure        // Default fallback
```

## 🔄 Result<T> (chỉ dùng khi có Domain layer)

**Path**: `lib/core/base/errors/result.dart`

```dart
sealed class Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(Failure failure) = FailureResult<T>;

  bool get isSuccess;
  T? get dataOrNull;
  Failure? get failureOrNull;

  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(Failure failure) onFailure,
  });
}
```

→ **Service KHÔNG dùng Result** — chỉ Repository (Domain layer optional) dùng.

## 🛡️ ErrorHandler — auto convert exception → Failure

**Path**: `lib/core/base/errors/error_handler.dart`

```dart
abstract class ErrorHandler {
  static Failure handle(Object error) {
    if (error is DioException) return _fromDio(error);
    if (error is ServerException) return ServerFailure(error.message);
    if (error is SocketException) return NetworkFailure('Mất kết nối');
    if (error is Failure) return error;
    return UnknownFailure(error.toString());
  }
}
```

→ `BaseNotifier.runAsync()` tự gọi `ErrorHandler.handle()` khi catch exception → set `lastFailure`.

## 🎯 Pattern throw trong Notifier

```dart
@riverpod
class ProductNotifier extends _$ProductNotifier with BaseNotifier<List<ProductModel>> {
  late ProductService _service;

  @override
  Future<List<ProductModel>> build() async {
    _service = ProductService(ref.read(dioProvider));
    return _fetchList();
  }

  Future<List<ProductModel>> _fetchList() async {
    final response = await _service.getList();

    // ✅ ĐÚNG — throw Failure khi response sai
    if (!response.isSuccess || response.data == null) {
      throw ServerFailure(response.message ?? 'Lỗi tải dữ liệu');
    }
    return response.data!;
  }
}
```

→ `runAsync` catch exception → set state.error → `useAsyncValueChange` hiện toast.

## 📋 Service return types — quy tắc

```dart
// ✅ ĐÚNG
Future<List<T>>                             // raw — runAsync
Future<ApiResponse<T>>                      // wrapped — runUnwrap
Future<ApiResponse<ApiPaginatedData<T>>>    // pagination — runPagination
Future<void>                                // side-effect (DELETE, logout)

// ❌ SAI — KHÔNG wrap Result ở service layer
Future<Result<ApiResponse<T>>>
Future<Result<T>>
```

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `lib/core/data/network/dio_client.dart` | DioClient + 5 interceptors |
| `lib/core/data/network/api_response.dart` | ApiResponse<T> freezed |
| `lib/core/data/network/api_paginated_data.dart` | Pagination wrapper |
| `lib/core/base/errors/failures.dart` | Failure sealed class |
| `lib/core/base/errors/error_handler.dart` | Exception → Failure |
| `lib/core/base/di/dio_provider.dart` | Riverpod provider cho Dio |
| `lib/core/common/constants/api_endpoints.dart` | URL path constants |

## ❌ Anti-patterns

```dart
// ❌ Tạo Dio mới trong service
class ProductService {
  ProductService() : _dio = Dio() {...}
}

// ✅ Inject Dio qua factory constructor (Retrofit pattern)
class ProductService {
  factory ProductService(Dio dio) = _ProductService;
}

// ❌ Map<String, dynamic> body
@POST('/login')
Future<...> login(@Body() Map<String, dynamic> body);

// ✅ Freezed Request class
@POST('/login')
Future<...> login(@Body() LoginRequest request);

// ❌ Try/catch ở service
class ProductService {
  Future<...> getList() async {
    try { return await _dio.get('/products'); }
    catch (e) { return ApiResponse.error(...); }
  }
}

// ✅ Service THROW exception — interceptor + ErrorHandler xử lý
@GET('/products')
Future<ApiResponse<List<ProductModel>>> getList();
```
