import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/safe_pop.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/revenue_sparkline.dart';

class OwnerReportsPage extends StatefulWidget {
  const OwnerReportsPage({super.key});

  @override
  State<OwnerReportsPage> createState() => _OwnerReportsPageState();
}

class _OwnerReportsPageState extends State<OwnerReportsPage> {
  int _range = 7; // 7 / 30

  @override
  Widget build(BuildContext context) {
    final total = MockData.revenueLast7Days.reduce((a, b) => a + b);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Báo cáo'),
        actions: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.download_outlined, size: 18),
            label: const Text('CSV'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Range tabs
          Row(
            children: [
              _RangeTab(label: '7 ngày', active: _range == 7, onTap: () => setState(() => _range = 7)),
              const SizedBox(width: 8),
              _RangeTab(label: '30 ngày', active: _range == 30, onTap: () => setState(() => _range = 30)),
              const SizedBox(width: 8),
              _RangeTab(label: 'Tuỳ chỉnh', active: false, onTap: () {}),
            ],
          ),

          const SizedBox(height: 16),

          // Big chart card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Tổng doanh thu',
                    style: TextStyle(
                        color: AppColors.textMuted, fontSize: 12)),
                const SizedBox(height: 4),
                Text(formatVND(total),
                    style: const TextStyle(
                        fontSize: 26, fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                const Text('+12.4% so với kỳ trước',
                    style: TextStyle(
                        color: AppColors.success,
                        fontSize: 12,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                RevenueSparkline(
                  data: MockData.revenueLast7Days,
                  height: 130,
                ),
                const SizedBox(height: 6),
                Row(
                  children: const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                      .map((d) => Expanded(
                            child: Center(
                              child: Text(d,
                                  style: const TextStyle(
                                      color: AppColors.textMuted, fontSize: 10)),
                            ),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),
          const _Section('Phân bố theo khung giờ'),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                for (final r in const [
                  ('Sáng (6–12h)', 18, AppColors.info),
                  ('Trưa (12–17h)', 28, AppColors.accent),
                  ('Tối (17–22h)', 54, AppColors.primary),
                ])
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 130,
                          child: Text(r.$1,
                              style: const TextStyle(fontSize: 12)),
                        ),
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: LinearProgressIndicator(
                              value: r.$2 / 100,
                              minHeight: 8,
                              backgroundColor:
                                  AppColors.surfaceAlt,
                              valueColor: AlwaysStoppedAnimation(r.$3),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          width: 32,
                          child: Text('${r.$2}%',
                              textAlign: TextAlign.end,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12)),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 16),
          const _Section('Phân bố theo cổng thanh toán'),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                for (final p in const [
                  ('VNPay', 52, AppColors.vnpay),
                  ('MoMo', 30, AppColors.momo),
                  ('ZaloPay', 18, AppColors.zalopay),
                ])
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: p.$3,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(child: Text(p.$1)),
                        Text('${p.$2}%',
                            style:
                                const TextStyle(fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _RangeTab extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _RangeTab({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
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
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(text,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
      );
}
