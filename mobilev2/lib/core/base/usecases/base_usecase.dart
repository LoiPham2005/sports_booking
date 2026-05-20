import 'package:sports_booking_mobile/core/base/errors/result.dart';

abstract class UseCase<T, Params> {
  const UseCase();
  Future<Result<T>> call(Params params);
}

abstract class NoParamUseCase<T> {
  const NoParamUseCase();
  Future<Result<T>> call();
}

class NoParams {
  const NoParams();
}
