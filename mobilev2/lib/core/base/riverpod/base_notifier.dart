import 'dart:async';

import 'package:sports_booking_mobile/core/base/errors/error_handler.dart';
import 'package:sports_booking_mobile/core/base/errors/failures.dart';
import 'package:sports_booking_mobile/core/base/errors/result.dart';
import 'package:sports_booking_mobile/core/data/network/api_paginated_data.dart';
import 'package:sports_booking_mobile/core/data/network/api_response.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
// `$AsyncNotifier` (codegen base) is only exposed via riverpod_annotation.
import 'package:riverpod_annotation/riverpod_annotation.dart';

/// Mixin gom logic xử lý async cho mọi Riverpod Notifier.
///
/// Cách dùng:
/// ```dart
/// @riverpod
/// class VoucherNotifier extends _$VoucherNotifier
///     with BaseNotifier<List<VoucherModel>> {
///   @override
///   Future<List<VoucherModel>> build() async => _service.getList();
///
///   Future<void> refresh() => runAsync(
///     action: _service.getList,
///     keepPreviousOnLoading: true,
///   );
/// }
/// ```
// ignore: invalid_use_of_internal_member
mixin BaseNotifier<T> on $AsyncNotifier<T> {
  CancelableOperation<T>? _current;
  Failure? _lastFailure;
  String? _pendingSuccess;

  Failure? get lastFailure => _lastFailure;
  String? get pendingSuccessMessage => _pendingSuccess;

  bool _empty = false;
  bool get isEmpty => _empty;

  /// Service trả `Future<T>` raw.
  Future<void> runAsync({
    required Future<T> Function() action,
    bool cancelPrevious = false,
    bool keepPreviousOnLoading = false,
    bool emitEmptyForEmptyList = false,
    String? successMessage,
    String? errorMessage,
    void Function(Object error, StackTrace stackTrace)? onError,
  }) async {
    if (cancelPrevious) await _current?.cancel();
    _lastFailure = null;
    _pendingSuccess = null;

    if (keepPreviousOnLoading && state.hasValue) {
      // ignore: invalid_use_of_internal_member
      state = AsyncValue<T>.loading().copyWithPrevious(state);
    } else {
      state = AsyncValue<T>.loading();
    }

    _current = CancelableOperation<T>.fromFuture(action());

    try {
      final data = await _current!.value;
      if (emitEmptyForEmptyList && data is List && data.isEmpty) {
        _empty = true;
      } else {
        _empty = false;
      }
      if (successMessage != null) _pendingSuccess = successMessage;
      state = AsyncValue<T>.data(data);
    } catch (e, s) {
      final failure = ErrorHandler.handle(e);
      _lastFailure = failure;
      Logger.error('runAsync failed', error: e, stackTrace: s);
      onError?.call(e, s);
      final message = errorMessage != null
          ? '$errorMessage: ${failure.message}'
          : failure.message;
      state = AsyncValue<T>.error(_FailureError(failure, message), s);
    }
  }

  /// Service trả `Future<ApiResponse<R>>` — unwrap data sang T.
  Future<void> runUnwrap<R>({
    required Future<ApiResponse<R>> Function() action,
    required T Function(R data) mapper,
    bool keepPreviousOnLoading = false,
    String? successMessage,
    String? errorMessage,
    void Function(Object error, StackTrace stackTrace)? onError,
  }) =>
      runAsync(
        action: () async {
          final response = await action();
          if (!response.isSuccess || response.data == null) {
            throw ServerFailure(response.message ?? 'Unknown error');
          }
          return mapper(response.data as R);
        },
        keepPreviousOnLoading: keepPreviousOnLoading,
        successMessage: successMessage,
        errorMessage: errorMessage,
        onError: onError,
      );

  /// Service trả `Future<ApiResponse<ApiPaginatedData<R>>>` — phân trang.
  Future<void> runPagination<R>({
    required Future<ApiResponse<ApiPaginatedData<R>>> Function() action,
    required T Function(ApiPaginatedData<R> page) mapper,
    bool keepPreviousOnLoading = true,
    String? errorMessage,
  }) =>
      runAsync(
        action: () async {
          final response = await action();
          if (!response.isSuccess || response.data == null) {
            throw ServerFailure(response.message ?? 'Unknown error');
          }
          return mapper(response.data as ApiPaginatedData<R>);
        },
        keepPreviousOnLoading: keepPreviousOnLoading,
        errorMessage: errorMessage,
      );

  /// Repository trả `Future<Result<R>>`.
  Future<void> runResult<R>({
    required Future<Result<R>> Function() action,
    required T Function(R data) mapper,
    bool keepPreviousOnLoading = false,
    String? successMessage,
    String? errorMessage,
  }) =>
      runAsync(
        action: () async {
          final result = await action();
          return result.fold(
            onSuccess: mapper,
            onFailure: (f) => throw f,
          );
        },
        keepPreviousOnLoading: keepPreviousOnLoading,
        successMessage: successMessage,
        errorMessage: errorMessage,
      );
}

class _FailureError implements Exception {
  _FailureError(this.failure, this.message);
  final Failure failure;
  final String message;

  @override
  String toString() => message;
}

class CancelableOperation<T> {
  CancelableOperation.fromFuture(Future<T> future) : _future = future;

  final Future<T> _future;
  bool _canceled = false;

  Future<T> get value async {
    final result = await _future;
    if (_canceled) throw _CanceledError();
    return result;
  }

  Future<void> cancel() async {
    _canceled = true;
  }
}

class _CanceledError implements Exception {
  @override
  String toString() => 'Operation canceled';
}
