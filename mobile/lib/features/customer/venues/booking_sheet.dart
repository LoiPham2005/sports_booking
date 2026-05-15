import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';
import '../../../shared/widgets/slot_grid.dart';

class BookingSheet extends StatefulWidget {
  final Venue venue;
  const BookingSheet({super.key, required this.venue});

  @override
  State<BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends State<BookingSheet> {
  String _courtId = MockData.courts.first.id;
  DateTime _date = DateTime.now();
  List<String> _slots = [];
  final _voucherCtrl = TextEditingController();

  Court get _court => MockData.courts.firstWhere((c) => c.id == _courtId);

  int get _subtotal => _slots.length * _court.pricePerHour;
  int get _discount =>
      _voucherCtrl.text.trim().toLowerCase() == 'sport20' && _subtotal > 0
          ? (_subtotal * 0.2).toInt().clamp(0, 50000)
          : 0;
  int get _total => (_subtotal - _discount).clamp(0, 99999999);

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.92,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              height: 4,
              width: 40,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Đặt sân',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 2),
                        Text(
                          widget.venue.name,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: const EdgeInsets.all(20),
                children: [
                  const _Section(title: 'Chọn sân'),
                  const SizedBox(height: 8),
                  Row(
                    children: MockData.courts.map((c) {
                      final selected = c.id == _courtId;
                      return Expanded(
                        child: Padding(
                          padding:
                              EdgeInsets.only(right: c == MockData.courts.last ? 0 : 8),
                          child: InkWell(
                            onTap: () => setState(() => _courtId = c.id),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: selected
                                    ? AppColors.primary.withValues(alpha: 0.05)
                                    : null,
                                border: Border.all(
                                  color: selected ? AppColors.primary : AppColors.border,
                                  width: selected ? 1.5 : 1,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(c.name,
                                      style: const TextStyle(
                                          fontSize: 13, fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${(c.pricePerHour / 1000).toInt()}k/h',
                                    style: const TextStyle(
                                        fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 20),
                  const _Section(title: 'Ngày chơi'),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 80,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: 14,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (_, i) {
                        final day = DateTime.now().add(Duration(days: i));
                        final selected = day.day == _date.day &&
                            day.month == _date.month &&
                            day.year == _date.year;
                        const dows = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                        return InkWell(
                          onTap: () => setState(() => _date = day),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 56,
                            decoration: BoxDecoration(
                              color: selected ? AppColors.primary : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: selected ? AppColors.primary : AppColors.border,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  dows[(day.weekday - 1) % 7],
                                  style: TextStyle(
                                    fontSize: 11,
                                    color:
                                        selected ? Colors.white70 : AppColors.textMuted,
                                  ),
                                ),
                                Text(
                                  '${day.day}',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: selected ? Colors.white : AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 20),
                  const _Section(title: 'Khung giờ'),
                  const SizedBox(height: 10),
                  SlotGrid(
                    selected: _slots,
                    onChanged: (s) => setState(() => _slots = s),
                  ),

                  const SizedBox(height: 20),
                  const _Section(title: 'Mã giảm giá'),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _voucherCtrl,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Nhập mã (vd: SPORT20)',
                      prefixIcon: Icon(Icons.local_offer_outlined),
                    ),
                  ),

                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _Row(label: 'Tạm tính (${_slots.length}h)', value: formatVND(_subtotal)),
                        if (_discount > 0) ...[
                          const SizedBox(height: 6),
                          _Row(
                            label: 'Giảm giá',
                            value: '−${formatVND(_discount)}',
                            highlight: AppColors.success,
                          ),
                        ],
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Tổng cộng',
                                style:
                                    TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            Text(
                              formatVND(_total),
                              style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 20),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: FilledButton(
                  onPressed: _slots.isEmpty
                      ? null
                      : () {
                          Navigator.pop(context);
                          context.push(RoutePaths.bookingNew);
                        },
                  child: const Text('Tiếp tục thanh toán'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  const _Section({required this.title});
  @override
  Widget build(BuildContext context) =>
      Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14));
}

class _Row extends StatelessWidget {
  final String label, value;
  final Color? highlight;
  const _Row({required this.label, required this.value, this.highlight});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        Text(
          value,
          style: TextStyle(
              fontWeight: FontWeight.w600, fontSize: 13, color: highlight),
        ),
      ],
    );
  }
}
