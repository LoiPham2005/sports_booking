import 'dart:async';

/// ✅ Học từ code mẫu — thêm vào base
/// Tránh lỗi "Future already completed" khi gọi complete() nhiều lần.
class SafeCompleter<T> {
  final _c = Completer<T>();

  Future<T> get future => _c.future;
  bool get isCompleted => _c.isCompleted;

  void complete([FutureOr<T>? value]) {
    if (!_c.isCompleted) _c.complete(value);
  }

  void completeError(Object e, [StackTrace? s]) {
    if (!_c.isCompleted) _c.completeError(e, s);
  }
}
