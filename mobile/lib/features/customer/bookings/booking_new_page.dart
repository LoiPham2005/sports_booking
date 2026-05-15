import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';
import '../../../shared/widgets/payment_method_tile.dart';

class BookingNewPage extends StatefulWidget {
  const BookingNewPage({super.key});

  @override
  State<BookingNewPage> createState() => _BookingNewPageState();
}

class _BookingNewPageState extends State<BookingNewPage> {
  int _step = 0; // 0: review, 1: payment
  PaymentMethod _method = PaymentMethod.vnpay;

  final venue = MockData.venues.first;
  final court = MockData.courts.first;
  final slots = ['18:00', '19:00'];

  int get _total => slots.length * court.pricePerHour;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_step == 1) {
              setState(() => _step = 0);
            } else {
              context.pop();
            }
          },
        ),
        title: const Text('Đặt sân'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Row(
              children: [
                _StepDot(index: 1, active: _step >= 0, done: _step > 0),
                _StepLine(active: _step > 0),
                _StepDot(index: 2, active: _step >= 1, done: false),
                const Spacer(),
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.timer_outlined, size: 14, color: AppColors.accent),
                    SizedBox(width: 4),
                    Text(
                      '09:43',
                      style: TextStyle(
                          color: AppColors.accent, fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
      body: _step == 0 ? _buildReview() : _buildPayment(),
      bottomNavigationBar: _bottomBar(),
    );
  }

  Widget _buildReview() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Xem lại đặt sân', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  height: 70,
                  width: 90,
                  child: CachedNetworkImage(imageUrl: venue.image, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(venue.name,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(
                      '${venue.district}, ${venue.city}',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12),
                    ),
                    Container(
                      margin: const EdgeInsets.only(top: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${court.name} · ${court.surface}',
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                            fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _DetailRow(label: 'Ngày', value: 'Thứ 5, 19/05/2026'),
        _DetailRow(label: 'Khung giờ', value: '${slots.first} – ${_addHour(slots.last)} (${slots.length} giờ)'),
        _DetailRow(label: 'Sân', value: '${court.name} · ${formatVND(court.pricePerHour)}/h'),
        const SizedBox(height: 16),
        const Text('Ghi chú cho chủ sân (tuỳ chọn)',
            style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        const TextField(
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'VD: cần mượn thêm 2 chiếc vợt, đội 6 người...',
          ),
        ),
        const SizedBox(height: 16),
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(width: 4, color: AppColors.primary),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Chính sách huỷ',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      SizedBox(height: 4),
                      Text('• Huỷ trước 24h: hoàn 100%',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      Text('• Huỷ trước 12h: hoàn 50%',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      Text('• Huỷ dưới 12h: không hoàn tiền',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPayment() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Chọn phương thức thanh toán', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        for (final m in PaymentMethodInfo.all)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: PaymentMethodTile(
              info: m,
              selected: _method == m.key,
              onTap: () => setState(() => _method = m.key),
            ),
          ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.verified_user_outlined, color: AppColors.success),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Thanh toán bảo mật',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(
                      'Bạn sẽ được chuyển sang ${_method.name.toUpperCase()} để hoàn tất. Số tiền chính xác là ${formatVND(_total)}.',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12, height: 1.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _bottomBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          border: const Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Tổng cộng',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                Text(formatVND(_total),
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 20)),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: () {
                  if (_step == 0) {
                    setState(() => _step = 1);
                  } else {
                    context.go('${RoutePaths.bookingResult}?status=success&method=${_method.name}');
                  }
                },
                child: Text(_step == 0 ? 'Tiếp tục' : 'Thanh toán'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _addHour(String s) {
    final h = int.parse(s.split(':')[0]);
    return '${(h + 1).toString().padLeft(2, '0')}:00';
  }
}

class _StepDot extends StatelessWidget {
  final int index;
  final bool active, done;
  const _StepDot({required this.index, required this.active, required this.done});
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active ? AppColors.primary : AppColors.surfaceAlt,
        border: active
            ? Border.all(color: AppColors.primary.withValues(alpha: 0.25), width: 3)
            : Border.all(color: AppColors.border),
      ),
      alignment: Alignment.center,
      child: done
          ? const Icon(Icons.check, color: Colors.white, size: 14)
          : Text(
              '$index',
              style: TextStyle(
                color: active ? Colors.white : AppColors.textMuted,
                fontWeight: FontWeight.w800,
                fontSize: 11,
              ),
            ),
    );
  }
}

class _StepLine extends StatelessWidget {
  final bool active;
  const _StepLine({required this.active});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: active ? AppColors.primary : AppColors.border,
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label, value;
  const _DetailRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
        ],
      ),
    );
  }
}
