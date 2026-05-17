import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class OwnerVenueCreatePage extends StatefulWidget {
  const OwnerVenueCreatePage({super.key});

  @override
  State<OwnerVenueCreatePage> createState() => _OwnerVenueCreatePageState();
}

class _OwnerVenueCreatePageState extends State<OwnerVenueCreatePage> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _description = TextEditingController();
  final _address = TextEditingController();
  final _ward = TextEditingController();
  final _district = TextEditingController();
  String _city = 'Hồ Chí Minh';
  final _phone = TextEditingController();
  final Set<String> _sports = {};
  final Set<String> _amenities = {};
  int _courtCount = 1;

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _address.dispose();
    _ward.dispose();
    _district.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_form.currentState!.validate()) return;
    if (_sports.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chọn ít nhất 1 môn thể thao')),
      );
      return;
    }
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        icon: Container(
          height: 56,
          width: 56,
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.check_circle, color: AppColors.success, size: 32),
        ),
        title: const Text('Đã gửi đơn'),
        content: const Text(
          'Venue của bạn đã được gửi tới admin xét duyệt. Bạn sẽ nhận thông báo khi venue được phê duyệt (thường trong 24h).',
          textAlign: TextAlign.center,
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              context.pop();
            },
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Thêm venue mới'),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => safePop(context),
                  child: const Text('Huỷ'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: _submit,
                  icon: const Icon(Icons.send_outlined, size: 18),
                  label: const Text('Gửi duyệt'),
                ),
              ),
            ],
          ),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.info),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Venue mới sẽ ở trạng thái PENDING tới khi admin xét duyệt (trong 24h).',
                      style: TextStyle(fontSize: 12, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const _Section('Thông tin cơ bản'),

            TextFormField(
              controller: _name,
              decoration: const InputDecoration(
                labelText: 'Tên venue *',
                hintText: 'VD: Sân bóng đá Phú Mỹ Hưng',
                prefixIcon: Icon(Icons.stadium_outlined, size: 20),
              ),
              validator: (v) =>
                  v == null || v.trim().length < 3 ? 'Tên ít nhất 3 ký tự' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              maxLines: 4,
              maxLength: 500,
              decoration: const InputDecoration(
                labelText: 'Mô tả',
                hintText: 'Giới thiệu về venue, mặt sân, không khí...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Hotline',
                hintText: '0901234567',
                prefixIcon: Icon(Icons.phone_outlined, size: 20),
              ),
              validator: (v) =>
                  v == null || v.trim().length < 9 ? 'Số điện thoại không hợp lệ' : null,
            ),

            const SizedBox(height: 24),
            const _Section('Địa chỉ'),

            TextFormField(
              controller: _address,
              decoration: const InputDecoration(
                labelText: 'Số nhà, đường *',
                hintText: 'VD: 123 Nguyễn Văn Linh',
                prefixIcon: Icon(Icons.location_on_outlined, size: 20),
              ),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Bắt buộc' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _ward,
              decoration: const InputDecoration(
                labelText: 'Phường/Xã (tuỳ chọn)',
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _district,
                    decoration: const InputDecoration(labelText: 'Quận/Huyện *'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Bắt buộc' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _city,
                    decoration: const InputDecoration(labelText: 'Thành phố *'),
                    items: const ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng']
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                    onChanged: (v) => setState(() => _city = v ?? _city),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const _Section('Môn thể thao'),
            const SizedBox(height: 4),
            const Text(
              'Chọn 1 hoặc nhiều môn mà venue cung cấp',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: MockData.sports.map((s) {
                final selected = _sports.contains(s.slug);
                return InkWell(
                  onTap: () => setState(() {
                    if (selected) {
                      _sports.remove(s.slug);
                    } else {
                      _sports.add(s.slug);
                    }
                  }),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.primary.withValues(alpha: 0.1)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected ? AppColors.primary : AppColors.border,
                        width: selected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(s.icon, style: const TextStyle(fontSize: 14)),
                        const SizedBox(width: 6),
                        Text(
                          s.name,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: selected ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                        if (selected) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.check, size: 14, color: AppColors.primary),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),
            const _Section('Sân con'),
            const SizedBox(height: 4),
            const Text(
              'Số sân con sẽ tạo cùng venue. Có thể chỉnh chi tiết từng sân sau.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.remove_circle_outline),
                        color: AppColors.primary,
                        onPressed: _courtCount > 1
                            ? () => setState(() => _courtCount -= 1)
                            : null,
                      ),
                      Container(
                        width: 56,
                        alignment: Alignment.center,
                        child: Text(
                          '$_courtCount',
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                      ),
                      IconButton(
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.add_circle_outline),
                        color: AppColors.primary,
                        onPressed: _courtCount < 30
                            ? () => setState(() => _courtCount += 1)
                            : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'sân',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 13),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const _Section('Tiện ích'),
            const SizedBox(height: 10),
            ...MockData.amenities.entries.map((e) {
              final selected = _amenities.contains(e.key);
              return CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                activeColor: AppColors.primary,
                value: selected,
                onChanged: (v) => setState(() {
                  if (v == true) {
                    _amenities.add(e.key);
                  } else {
                    _amenities.remove(e.key);
                  }
                }),
                title: Row(
                  children: [
                    Text(e.value.$2, style: const TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Text(e.value.$1,
                        style: const TextStyle(fontWeight: FontWeight.w500)),
                  ],
                ),
              );
            }),

            const SizedBox(height: 24),
            const _Section('Ảnh venue'),
            const SizedBox(height: 10),
            InkWell(
              onTap: () {},
              borderRadius: BorderRadius.circular(14),
              child: Container(
                height: 140,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.border,
                    style: BorderStyle.solid,
                    width: 1.5,
                  ),
                ),
                alignment: Alignment.center,
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.cloud_upload_outlined,
                        size: 36, color: AppColors.textMuted),
                    SizedBox(height: 6),
                    Text('Bấm để thêm ảnh',
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary)),
                    SizedBox(height: 2),
                    Text('PNG, JPG, WEBP · tối đa 10MB / ảnh',
                        style: TextStyle(
                            fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),
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
                  Icon(Icons.gavel_outlined, color: AppColors.warning, size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Bằng cách gửi, bạn cam kết thông tin là chính xác và đồng ý với điều khoản đối tác.',
                      style: TextStyle(fontSize: 11, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
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
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: AppColors.textMuted,
          fontSize: 11,
          letterSpacing: 1.2,
          fontWeight: FontWeight.w800,
        ),
      );
}
