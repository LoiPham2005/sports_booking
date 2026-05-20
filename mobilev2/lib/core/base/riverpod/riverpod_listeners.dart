import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:toastification/toastification.dart';

/// Hook lắng nghe transition của một `AsyncValue<T>` — tự hiện toast khi:
/// - `AsyncError` → toast lỗi
/// - `AsyncData` (sau khi loading) → toast success (nếu cung cấp)
///
/// Cách dùng (HookConsumerWidget):
/// ```dart
/// final state = ref.watch(authProvider);
/// useAsyncValueChange(state, successMessage: 'Đăng nhập thành công');
/// ```
void useAsyncValueChange<T>(
  AsyncValue<T> state, {
  String? successMessage,
  String Function(Object error)? errorMessage,
}) {
  final previousRef = useRef<AsyncValue<T>?>(null);

  useEffect(
    () {
      final previous = previousRef.value;
      if (previous != null) {
        if (state.hasError && !previous.hasError) {
          final err = state.error;
          final msg = err == null
              ? 'Đã xảy ra lỗi'
              : (errorMessage?.call(err) ?? err.toString());
          _showError(msg);
        } else if (state is AsyncData<T> &&
            previous is! AsyncData<T> &&
            successMessage != null) {
          _showSuccess(successMessage);
        }
      }
      previousRef.value = state;
      return null;
    },
    [state],
  );
}

void _showSuccess(String message) {
  // ⚡ useEffect chạy trong build phase → defer show toast về sau frame
  // để tránh "visitChildElements() called during build" exception.
  WidgetsBinding.instance.addPostFrameCallback((_) {
    toastification.show(
      type: ToastificationType.success,
      style: ToastificationStyle.flatColored,
      autoCloseDuration: const Duration(seconds: 3),
      description: Text(message),
      alignment: Alignment.topCenter,
    );
  });
}

void _showError(String message) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    toastification.show(
      type: ToastificationType.error,
      style: ToastificationStyle.flatColored,
      autoCloseDuration: const Duration(seconds: 4),
      description: Text(message),
      alignment: Alignment.topCenter,
    );
  });
}
