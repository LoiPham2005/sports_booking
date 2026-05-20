import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/safe_pop.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/slot_grid.dart';

class OwnerWalkInPage extends StatefulWidget {
  const OwnerWalkInPage({super.key});

  @override
  State<OwnerWalkInPage> createState() => _OwnerWalkInPageState();
}

class _OwnerWalkInPageState extends State<OwnerWalkInPage> {
  String _courtId = MockData.courts.first.id;
  DateTime _date = DateTime.now();
  List<String> _slots = [];
  String _payMethod = 'cash';

  Court get _court => MockData.courts.firstWhere((c) => c.id == _courtId);
  int get _total => _slots.length * _court.pricePerHour;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Booking thủ công'),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Tổng',
                      style: TextStyle(
                          fontSize: 11, color: AppColors.textMuted)),
                  Text(formatVND(_total),
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 20,
                          fontWeight: FontWeight.w800)),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: FilledButton(
                  onPressed: _slots.isEmpty
                      ? null
                      : () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Đã tạo booking thủ công.')),
                          );
                          context.pop();
                        },
                  child: const Text('Tạo booking'),
                ),
              ),
            ],
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Customer info
          const _Section('Khách hàng'),
          const TextField(
            decoration: InputDecoration(
              labelText: 'Tên khách',
              hintText: 'Vd: Trần Minh',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 10),
          const TextField(
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(
              labelText: 'Số điện thoại',
              hintText: '09xxxxxxxx',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
          ),

          const SizedBox(height: 20),
          const _Section('Sân'),
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
                          color:
                              selected ? AppColors.primary : AppColors.border,
                          width: selected ? 1.5 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(c.name,
                              style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
                          Text('${(c.pricePerHour / 1000).toInt()}k/h',
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 20),
          const _Section('Ngày & giờ'),
          SizedBox(
            height: 70,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 7,
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
                    width: 52,
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color:
                              selected ? AppColors.primary : AppColors.border),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(dows[(day.weekday - 1) % 7],
                            style: TextStyle(
                                fontSize: 11,
                                color: selected
                                    ? Colors.white70
                                    : AppColors.textMuted)),
                        Text('${day.day}',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: selected
                                    ? Colors.white
                                    : AppColors.textPrimary)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          SlotGrid(
            selected: _slots,
            onChanged: (s) => setState(() => _slots = s),
          ),

          const SizedBox(height: 20),
          const _Section('Thanh toán'),
          for (final m in const [
            ('cash', 'Tiền mặt', Icons.payments_outlined),
            ('transfer', 'Chuyển khoản', Icons.account_balance),
            ('vnpay', 'VNPay (QR)', Icons.qr_code_2),
          ])
            RadioListTile<String>(
              contentPadding: EdgeInsets.zero,
              activeColor: AppColors.primary,
              value: m.$1,
              groupValue: _payMethod,
              onChanged: (v) => setState(() => _payMethod = v ?? 'cash'),
              title: Row(
                children: [
                  Icon(m.$3, size: 18, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(m.$2),
                ],
              ),
            ),

          const SizedBox(height: 12),
          const TextField(
            maxLines: 3,
            decoration: InputDecoration(
              labelText: 'Ghi chú (tuỳ chọn)',
              hintText: 'Vd: Khách quen, miễn phí nước...',
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _Section(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
      );
}
