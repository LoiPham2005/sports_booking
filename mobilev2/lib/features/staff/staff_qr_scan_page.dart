import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../shared/routing/safe_pop.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/qr_scanner_placeholder.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffQrScanPage extends ConsumerStatefulWidget {
  const StaffQrScanPage({super.key});

  @override
  ConsumerState<StaffQrScanPage> createState() => _StaffQrScanPageState();
}

class _StaffQrScanPageState extends ConsumerState<StaffQrScanPage> {
  bool _scanning = false;

  Future<void> _simulateScan() async {
    if (_scanning) return;
    setState(() => _scanning = true);

    // Demo: pick a confirmed booking + use its id as fake token.
    final fallback = MockData.staffBookingsToday.firstWhere(
      (b) => b.status == BookingStatus.confirmed,
      orElse: () => MockData.staffBookingsToday.first,
    );
    final list = ref.read(staffTodayProvider).value ??
        MockData.staffBookingsToday;
    final b = list.firstWhere(
      (x) => x.status == BookingStatus.confirmed,
      orElse: () => fallback,
    );

    // Trigger real check-in flow (mock mode no-ops the API).
    await ref.read(staffTodayProvider.notifier).checkIn(b.id);

    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _SuccessSheet(booking: b),
    );
    if (mounted) setState(() => _scanning = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Material(
                    color: Colors.white.withValues(alpha: 0.12),
                    shape: const CircleBorder(),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: () => safePop(context),
                      child: const SizedBox(
                        height: 40,
                        width: 40,
                        child: Icon(Icons.close, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Quét QR khách',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800)),
                        Text('Mã sẽ tự nhận dạng',
                            style:
                                TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: const QrScannerPlaceholder(),
            ),

            const SizedBox(height: 24),
            const Text(
              'Đưa mã QR của khách vào khung',
              style: TextStyle(color: Colors.white, fontSize: 14),
            ),
            const SizedBox(height: 16),

            // Demo: tap to simulate a scan
            FilledButton.icon(
              onPressed: _simulateScan,
              icon: const Icon(Icons.check_circle_outline, size: 18),
              label: const Text('Demo: giả lập quét thành công'),
            ),

            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }
}

class _SuccessSheet extends StatelessWidget {
  final Booking booking;
  const _SuccessSheet({required this.booking});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 4,
              width: 40,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              height: 64,
              width: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.success.withValues(alpha: 0.15),
              ),
              child: const Icon(Icons.check,
                  color: AppColors.success, size: 40),
            ),
            const SizedBox(height: 12),
            const Text('Check-in thành công!',
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Mã ${booking.code}',
                style: const TextStyle(color: AppColors.textMuted)),

            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _Row(label: 'Khách', value: 'Trần Minh'),
                  const Divider(height: 16),
                  _Row(label: 'Sân', value: booking.courtName),
                  const Divider(height: 16),
                  _Row(
                    label: 'Giờ chơi',
                    value:
                        '${formatTime(booking.startsAt)} – ${formatTime(booking.endsAt)}',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Xong'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  const _Row({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13)),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
        ],
      );
}
