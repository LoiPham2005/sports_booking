import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/data/network/api_paginated_data.dart';
import 'package:sports_booking_mobile/core/data/network/api_response.dart';
import 'package:sports_booking_mobile/features/{{name.snakeCase()}}/data/models/{{name.snakeCase()}}_model.dart';
import 'package:retrofit/retrofit.dart';

part '{{name.snakeCase()}}_service.g.dart';

/// 🔌 Retrofit service cho {{name.titleCase()}}.
///
/// ⚠️ Sửa endpoint path theo API thực của bạn:
///   - `/{{name.snakeCase()}}s` cho list
///   - `/{{name.snakeCase()}}s/{id}` cho detail
@RestApi()
abstract class {{name.pascalCase()}}Service {
  factory {{name.pascalCase()}}Service(Dio dio) = _{{name.pascalCase()}}Service;

  /// Get paginated list.
  @GET('/{{name.snakeCase()}}s')
  Future<ApiResponse<ApiPaginatedData<{{name.pascalCase()}}Model>>> getList({
    @Query('page') int page = 1,
    @Query('per_page') int perPage = 20,
    @Query('q') String? query,
  });

  /// Get detail by id.
  @GET('/{{name.snakeCase()}}s/{id}')
  Future<ApiResponse<{{name.pascalCase()}}Model>> getDetail(
    @Path('id') String id,
  );

  // TODO: thêm @POST, @PUT, @DELETE khi cần.
}
