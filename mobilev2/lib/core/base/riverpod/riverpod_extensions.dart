import 'package:flutter_riverpod/flutter_riverpod.dart';

extension AsyncValueX<T> on AsyncValue<T> {
  bool get isData => this is AsyncData<T>;
  bool get isError => this is AsyncError<T>;
  bool get isLoading => this is AsyncLoading<T>;
  bool get hasData => value != null;

  R when2<R>({
    required R Function(T data) data,
    required R Function() loading,
    required R Function(Object error, StackTrace stack) error,
    R Function(T data)? refreshing,
  }) {
    if (isLoading && hasData && refreshing != null) {
      return refreshing(value as T);
    }
    return when(data: data, loading: loading, error: error);
  }
}
