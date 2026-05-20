import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';

class StaffPricingPage extends StatefulWidget {
  const StaffPricingPage({super.key});

  @override
  State<StaffPricingPage> createState() => _StaffPricingPageState();
}

class _Override {
  final String id;
  final String court;
  final String date;
  final String timeRange;
  final int price;
  final String reason;
  final String expiresIn;
  const _Override({
    required this.id,
    required this.court,
    required this.date,
    required this.timeRange,
    required this.price,
    required this.reason,
    required this.expiresIn,
  });
}

class _StaffPricingPageState extends State<StaffPricingPage> {
  final _overrides = <_Override>[
    const _Override(
      id: 'o1',
      court: 'Sân VIP',
      date: 'Hôm nay',
      timeRange: '17:00–19:00',
      price: 600000,
      reason: 'Khung giờ cao điểm',
      expiresIn: '2 giờ',
    ),
    const _Override(
      id: 'o2',
      court: 'Tất cả sân',
      date: 'CN 18/05',
      timeRange: '06:00–08:00',
      price: 250000,
      reason: 'Giảm sốc sáng sớm',
      expiresIn: '3 ngày',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Giá tạm thời'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () => _showInfo(context),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreate(context),
        icon: const Icon(Icons.add),
        label: const Text('Tạo override'),
        backgroundColor: const Color(0xFF8B5CF6),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Manager badge
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.workspace_premium,
                        color: Color(0xFF7C3AED), size: 12),
                    SizedBox(width: 4),
                    Text(
                      'MANAGER',
                      style: TextStyle(
                        color: Color(0xFF7C3AED),
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border:
                  Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.warning_amber_outlined,
                    color: AppColors.warning, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Override này TẠM THỜI. Quy tắc giá gốc do Owner set sẽ không bị ảnh hưởng.',
                    style: TextStyle(fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          Text(
            'ĐANG ÁP DỤNG (${_overrides.length})',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          if (_overrides.isEmpty)
            _Empty(onCreate: () => _showCreate(context))
          else
            ..._overrides.map(_buildOverrideCard),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildOverrideCard(_Override o) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.local_offer_outlined,
                color: Color(0xFF8B5CF6), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        o.court,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      formatVND(o.price),
                      style: const TextStyle(
                          color: Color(0xFF7C3AED),
                          fontWeight: FontWeight.w800,
                          fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: [
                    _miniTag(o.date),
                    _miniTag(o.timeRange, mono: true),
                    _miniTag('hết hạn ${o.expiresIn}',
                        color: AppColors.warning),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  o.reason,
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _overrides.remove(o)),
            icon: const Icon(Icons.delete_outline,
                color: AppColors.danger, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _miniTag(String text, {Color? color, bool mono = false}) {
    final c = color ?? AppColors.textMuted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: c,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          fontFamily: mono ? 'monospace' : null,
        ),
      ),
    );
  }

  void _showCreate(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          16,
          20,
          20 + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  height: 4,
                  width: 40,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const Text('Tạo override giá',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
              const SizedBox(height: 16),
              const Text('Sân',
                  style:
                      TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: 'all',
                decoration: const InputDecoration(isDense: true),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('Tất cả sân')),
                  DropdownMenuItem(value: 'c1', child: Text('Sân 1')),
                  DropdownMenuItem(value: 'c2', child: Text('Sân 2')),
                  DropdownMenuItem(value: 'c3', child: Text('Sân VIP')),
                ],
                onChanged: (_) {},
              ),
              const SizedBox(height: 12),
              const Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Từ giờ',
                            style: TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w700)),
                        SizedBox(height: 6),
                        TextField(
                          decoration:
                              InputDecoration(hintText: '17:00', isDense: true),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Đến giờ',
                            style: TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w700)),
                        SizedBox(height: 6),
                        TextField(
                          decoration:
                              InputDecoration(hintText: '19:00', isDense: true),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text('Giá mới (₫/h)',
                  style:
                      TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              const TextField(
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: '600000',
                  isDense: true,
                  prefixIcon: Icon(Icons.payments_outlined, size: 18),
                ),
              ),
              const SizedBox(height: 12),
              const Text('Lý do',
                  style:
                      TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              const TextField(
                decoration: InputDecoration(
                    hintText: 'Khung giờ cao điểm cuối tuần', isDense: true),
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: () {
                  setState(() {
                    _overrides.insert(
                      0,
                      _Override(
                        id: 'o${_overrides.length + 1}',
                        court: 'Sân VIP',
                        date: 'Hôm nay',
                        timeRange: '17:00–19:00',
                        price: 600000,
                        reason: 'Khung giờ cao điểm',
                        expiresIn: '2 giờ',
                      ),
                    );
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã tạo override giá')),
                  );
                },
                child: const Text('Tạo'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        icon: const Icon(Icons.info_outline, color: Color(0xFF7C3AED)),
        title: const Text('Override giá là gì?'),
        content: const Text(
          'Bạn có thể tạo giá tạm thời cho khung giờ cụ thể (vd: cao điểm cuối tuần, giảm giá sáng sớm). '
          'Override này áp dụng song song với bảng giá gốc và sẽ hết hiệu lực khi hết khoảng thời gian.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  final VoidCallback onCreate;
  const _Empty({required this.onCreate});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          const Icon(Icons.local_offer_outlined,
              size: 48, color: AppColors.textMuted),
          const SizedBox(height: 8),
          const Text('Chưa có override nào',
              style: TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          const Text(
            'Tạo giá tạm thời cho khung giờ cụ thể',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: onCreate,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Tạo override'),
          ),
        ],
      ),
    );
  }
}
