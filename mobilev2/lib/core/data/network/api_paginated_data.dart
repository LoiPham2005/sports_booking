import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_paginated_data.freezed.dart';
part 'api_paginated_data.g.dart';

@Freezed(genericArgumentFactories: true)
abstract class ApiPaginatedData<T> with _$ApiPaginatedData<T> {
  const factory ApiPaginatedData({
    @Default([]) List<T> items,
    @JsonKey(name: 'current_page') @Default(1) int currentPage,
    @JsonKey(name: 'total_pages') @Default(1) int totalPages,
    @JsonKey(name: 'total_items') @Default(0) int totalItems,
    @JsonKey(name: 'per_page') @Default(20) int perPage,
  }) = _ApiPaginatedData<T>;

  factory ApiPaginatedData.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) =>
      _$ApiPaginatedDataFromJson<T>(json, fromJsonT);
}

extension ApiPaginatedDataX<T> on ApiPaginatedData<T> {
  bool get hasMore => currentPage < totalPages;
  bool get isEmpty => items.isEmpty;
  int get nextPage => currentPage + 1;
}
