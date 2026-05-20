import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';
import '../customer/venues/presentation/providers/venue_detail_notifier.dart';
import '../staff_portal/data/models/staff_portal_dtos.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffPricingPage extends ConsumerWidget {
  const StaffPricingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memberships = ref.watch(staffMembershipsProvider).value ?? const [];
    if (memberships.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => safePop(context),
          ),
          title: const Text('Giá tạm thời'),
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'Chưa có venue được gán. Liên hệ Owner để được phân quyền.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted),
            ),
          ),
        ),
      );
    }

    final venueId = memberships.first.venueId;
    final asyncOverrides =
        ref.watch(staffOverridesProvider(venueId: venueId));
    final overrides = asyncOverrides.value ?? const <PriceOverrideDto>[];

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
        onPressed: () => _showCreate(context, ref, venueId),
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
            'ĐANG ÁP DỤNG (${overrides.length})',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          if (overrides.isEmpty)
            _Empty(onCreate: () => _showCreate(context, ref, venueId))
          else
            ...overrides.map((o) => _OverrideCard(
                  item: o,
                  onDelete: () => ref
                      .read(
                          staffOverridesProvider(venueId: venueId).notifier)
                      .remove(o.id, venueId: venueId),
                )),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _showCreate(BuildContext context, WidgetRef ref, String venueId) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _CreateOverrideSheet(venueId: venueId),
    );
  }

  void _showInfo(BuildContext context) {
    showDialog<void>(
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

class _OverrideCard extends StatelessWidget {
  final PriceOverrideDto item;
  final VoidCallback onDelete;
  const _OverrideCard({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) {
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
                        item.court.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      formatVND(item.price),
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
                    _miniTag(item.date),
                    _miniTag('${item.startTime}–${item.endTime}', mono: true),
                  ],
                ),
                if (item.reason != null && item.reason!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.reason!,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: onDelete,
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
}

class _CreateOverrideSheet extends ConsumerStatefulWidget {
  final String venueId;
  const _CreateOverrideSheet({required this.venueId});

  @override
  ConsumerState<_CreateOverrideSheet> createState() =>
      _CreateOverrideSheetState();
}

class _CreateOverrideSheetState extends ConsumerState<_CreateOverrideSheet> {
  final _startCtl = TextEditingController(text: '17:00');
  final _endCtl = TextEditingController(text: '19:00');
  final _priceCtl = TextEditingController();
  final _reasonCtl = TextEditingController();
  String? _courtId;
  DateTime _date = DateTime.now();
  bool _submitting = false;

  @override
  void dispose() {
    _startCtl.dispose();
    _endCtl.dispose();
    _priceCtl.dispose();
    _reasonCtl.dispose();
    super.dispose();
  }

  String _yyyymmdd(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-'
      '${d.month.toString().padLeft(2, '0')}-'
      '${d.day.toString().padLeft(2, '0')}';

  Future<void> _submit() async {
    final price = int.tryParse(_priceCtl.text.trim());
    if (_courtId == null || price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chọn sân và nhập giá hợp lệ')),
      );
      return;
    }
    setState(() => _submitting = true);
    await ref
        .read(staffOverridesProvider(venueId: widget.venueId).notifier)
        .create(CreatePriceOverrideRequest(
          courtId: _courtId!,
          date: _yyyymmdd(_date),
          startTime: _startCtl.text.trim(),
          endTime: _endCtl.text.trim(),
          price: price,
          reason:
              _reasonCtl.text.trim().isEmpty ? null : _reasonCtl.text.trim(),
        ));
    if (!mounted) return;
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(venueDetailProvider(widget.venueId)).value;
    final courts = detail?.courts ?? const [];
    _courtId ??= courts.isNotEmpty ? courts.first.id : null;

    return Padding(
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
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _courtId,
              decoration: const InputDecoration(isDense: true),
              items: courts
                  .map((c) =>
                      DropdownMenuItem(value: c.id, child: Text(c.name)))
                  .toList(),
              onChanged: (v) => setState(() => _courtId = v),
            ),
            const SizedBox(height: 12),
            const Text('Ngày',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 90)),
                );
                if (picked != null) setState(() => _date = picked);
              },
              child: InputDecorator(
                decoration: const InputDecoration(
                  isDense: true,
                  suffixIcon: Icon(Icons.calendar_today, size: 18),
                ),
                child: Text(_yyyymmdd(_date)),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Từ giờ',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _startCtl,
                        decoration: const InputDecoration(
                            hintText: '17:00', isDense: true),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Đến giờ',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _endCtl,
                        decoration: const InputDecoration(
                            hintText: '19:00', isDense: true),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Giá mới (₫/h)',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            TextField(
              controller: _priceCtl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: '600000',
                isDense: true,
                prefixIcon: Icon(Icons.payments_outlined, size: 18),
              ),
            ),
            const SizedBox(height: 12),
            const Text('Lý do',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            TextField(
              controller: _reasonCtl,
              decoration: const InputDecoration(
                  hintText: 'Khung giờ cao điểm cuối tuần', isDense: true),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Tạo'),
            ),
          ],
        ),
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
