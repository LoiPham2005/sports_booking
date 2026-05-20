import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../payments/presentation/providers/payments_notifier.dart';

/// Trang kết quả thanh toán.
///
/// 2 mode:
///   1. `paymentId` truyền vào → poll `paymentDetailProvider(id)` mỗi 3s
///      tối đa 60s đợi webhook về (status PENDING → SUCCESS/FAILED).
///   2. Không có `paymentId` (legacy) → fallback dùng `status` query param
///      (cho luồng cũ mock).
class BookingResultPage extends HookConsumerWidget {
  final String status;
  final String method;
  final String? paymentId;

  const BookingResultPage({
    super.key,
    required this.status,
    required this.method,
    this.paymentId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Nếu không có paymentId → render theo `status` query (legacy mock).
    if (paymentId == null) {
      return _build(
        context,
        success: status == 'success',
        bookingId: 'b1',
        bookingCode: '20250547',
      );
    }

    // Poll mỗi 3s, max 60s, sau đó vẫn cho refresh thủ công.
    final pollCount = useState(0);
    const maxPolls = 20; // 20 × 3s = 60s

    useEffect(() {
      Timer? timer;
      timer = Timer.periodic(const Duration(seconds: 3), (t) {
        if (pollCount.value >= maxPolls) {
          t.cancel();
          return;
        }
        pollCount.value++;
        ref.invalidate(paymentDetailProvider(paymentId!));
      });
      return timer.cancel;
    }, const []);

    final asyncPayment = ref.watch(paymentDetailProvider(paymentId!));
    return asyncPayment.when(
      loading: () => _loading(),
      error: (e, _) => _build(
        context,
        success: false,
        errorMessage: 'Lỗi: $e',
      ),
      data: (p) {
        final isSuccess = p.status == 'SUCCESS';
        final isFinal = isSuccess ||
            p.status == 'FAILED' ||
            p.status == 'CANCELLED' ||
            p.status == 'EXPIRED';

        if (!isFinal) {
          // Còn PENDING / REFUND_PENDING → hiển thị spinner + cho refresh.
          return _pending(context, ref, polls: pollCount.value);
        }

        return _build(
          context,
          success: isSuccess,
          bookingId: p.bookingId ?? 'b1',
          bookingCode: p.providerRef,
          errorMessage:
              isSuccess ? null : (p.failedReason ?? 'Thanh toán thất bại'),
        );
      },
    );
  }

  Widget _loading() => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );

  Widget _pending(BuildContext context, WidgetRef ref, {required int polls}) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 100,
                width: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.info.withValues(alpha: 0.15),
                ),
                child: const Icon(Icons.hourglass_top_rounded,
                    size: 56, color: AppColors.info),
              ),
              const SizedBox(height: 24),
              Text('Đang xác nhận thanh toán...',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center),
              const SizedBox(height: 8),
              const Text(
                'Đang đợi xác nhận từ cổng thanh toán. Quá trình này có thể mất tới 1 phút.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 16),
              const CircularProgressIndicator(),
              const SizedBox(height: 8),
              Text('Lần kiểm tra: $polls/20',
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 12)),
              const Spacer(),
              OutlinedButton.icon(
                onPressed: () =>
                    ref.invalidate(paymentDetailProvider(paymentId!)),
                icon: const Icon(Icons.refresh),
                label: const Text('Làm mới'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => context.go(RoutePaths.main),
                child: const Text('Về trang chủ'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _build(
    BuildContext context, {
    required bool success,
    String? bookingId,
    String? bookingCode,
    String? errorMessage,
  }) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 100,
                width: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (success ? AppColors.success : AppColors.danger)
                      .withValues(alpha: 0.15),
                ),
                child: Icon(
                  success ? Icons.check_rounded : Icons.close_rounded,
                  size: 56,
                  color: success ? AppColors.success : AppColors.danger,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                success ? 'Đặt sân thành công!' : 'Thanh toán thất bại',
                style: Theme.of(context).textTheme.displaySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                success
                    ? 'Giao dịch ${method.toUpperCase()} đã hoàn tất. Mã QR check-in đã được gửi tới bạn.'
                    : (errorMessage ??
                        'Giao dịch không thành công. Bạn có thể thử lại với phương thức khác.'),
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              if (success && bookingCode != null) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Text('Mã đặt sân',
                          style: TextStyle(
                              color: AppColors.textMuted, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        bookingCode,
                        style: const TextStyle(
                          fontSize: 28,
                          letterSpacing: 4,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const Spacer(),
              if (success) ...[
                FilledButton.icon(
                  onPressed: () =>
                      context.go(RoutePaths.bookingDetail(bookingId ?? 'b1')),
                  icon: const Icon(Icons.event_note),
                  label: const Text('Xem booking'),
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () => context.go(RoutePaths.main),
                  child: const Text('Về trang chủ'),
                ),
              ] else ...[
                FilledButton.icon(
                  onPressed: () => context.go(RoutePaths.bookingNew),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Thử lại'),
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () => context.go(RoutePaths.main),
                  child: const Text('Về trang chủ'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
