import 'package:sports_booking_mobile/core/base/errors/failures.dart';

sealed class Result<T> {
  const Result();

  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(Failure failure) = FailureResult<T>;

  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is FailureResult<T>;

  T? get dataOrNull => switch (this) {
        Success<T>(:final data) => data,
        _ => null,
      };

  Failure? get failureOrNull => switch (this) {
        FailureResult<T>(:final failure) => failure,
        _ => null,
      };

  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(Failure failure) onFailure,
  }) =>
      switch (this) {
        Success<T>(:final data) => onSuccess(data),
        FailureResult<T>(:final failure) => onFailure(failure),
      };
}

final class Success<T> extends Result<T> {
  const Success(this.data);
  final T data;
}

final class FailureResult<T> extends Result<T> {
  const FailureResult(this.failure);
  final Failure failure;
}
