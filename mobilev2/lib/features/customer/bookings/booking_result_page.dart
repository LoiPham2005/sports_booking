import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';

class BookingResultPage extends StatelessWidget {
  final String status;
  final String method;
  const BookingResultPage({super.key, required this.status, required this.method});

  bool get _success => status == 'success';

  @override
  Widget build(BuildContext context) {
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
                  color: (_success ? AppColors.success : AppColors.danger).withValues(alpha: 0.15),
                ),
                child: Icon(
                  _success ? Icons.check_rounded : Icons.close_rounded,
                  size: 56,
                  color: _success ? AppColors.success : AppColors.danger,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                _success ? 'Đặt sân thành công!' : 'Thanh toán thất bại',
                style: Theme.of(context).textTheme.displaySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                _success
                    ? 'Giao dịch ${method.toUpperCase()} đã hoàn tất. Mã QR check-in đã được gửi tới bạn.'
                    : 'Giao dịch không thành công. Bạn có thể thử lại với phương thức khác.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              if (_success) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Text('Mã đặt sân',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        '20250547',
                        style: TextStyle(
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
              if (_success) ...[
                FilledButton.icon(
                  onPressed: () => context.go(RoutePaths.bookingDetail('b1')),
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
