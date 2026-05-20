import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class OwnerStaffInvitePage extends StatefulWidget {
  const OwnerStaffInvitePage({super.key});

  @override
  State<OwnerStaffInvitePage> createState() => _OwnerStaffInvitePageState();
}

class _OwnerStaffInvitePageState extends State<OwnerStaffInvitePage> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _identifier = TextEditingController(); // email hoặc phone
  StaffRole _role = StaffRole.staff;
  String _venueId = MockData.ownerVenues.first.id;
  String _channel = 'email'; // email | sms

  @override
  void dispose() {
    _name.dispose();
    _identifier.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_form.currentState!.validate()) return;
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
          child: const Icon(Icons.send, color: AppColors.success, size: 28),
        ),
        title: const Text('Đã gửi lời mời'),
        content: Text(
          _channel == 'email'
              ? '${_identifier.text} sẽ nhận email kèm link tham gia. Trạng thái sẽ là "Chờ duyệt" tới khi họ chấp nhận.'
              : '${_identifier.text} sẽ nhận SMS kèm mã OTP để xác thực.',
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
        title: const Text('Mời nhân viên'),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton.icon(
            onPressed: _submit,
            icon: const Icon(Icons.send_outlined, size: 18),
            label: const Text('Gửi lời mời'),
          ),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Header note
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.info, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Nhân viên nhận lời mời, đăng nhập và xác thực thì mới hiện active.',
                      style: TextStyle(fontSize: 12, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            _label('Họ và tên *'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(
                hintText: 'VD: Nguyễn Văn A',
                prefixIcon: Icon(Icons.person_outline, size: 20),
              ),
              validator: (v) =>
                  v == null || v.trim().length < 2 ? 'Họ tên ít nhất 2 ký tự' : null,
            ),

            const SizedBox(height: 16),
            _label('Kênh gửi'),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: _ChannelOption(
                    icon: Icons.mail_outline,
                    label: 'Email',
                    active: _channel == 'email',
                    onTap: () => setState(() => _channel = 'email'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _ChannelOption(
                    icon: Icons.sms_outlined,
                    label: 'SMS',
                    active: _channel == 'sms',
                    onTap: () => setState(() => _channel = 'sms'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            _label(_channel == 'email' ? 'Email *' : 'Số điện thoại *'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _identifier,
              keyboardType: _channel == 'email'
                  ? TextInputType.emailAddress
                  : TextInputType.phone,
              decoration: InputDecoration(
                hintText: _channel == 'email' ? 'ban@example.com' : '09xxxxxxxx',
                prefixIcon: Icon(
                  _channel == 'email' ? Icons.alternate_email : Icons.phone,
                  size: 20,
                ),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Bắt buộc';
                if (_channel == 'email' && !v.contains('@')) {
                  return 'Email không hợp lệ';
                }
                if (_channel == 'sms' && v.trim().length < 9) {
                  return 'Số điện thoại không hợp lệ';
                }
                return null;
              },
            ),

            const SizedBox(height: 20),
            _label('Sân được giao *'),
            const SizedBox(height: 6),
            ...MockData.ownerVenues.map((v) {
              final selected = _venueId == v.id;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: InkWell(
                  onTap: () => setState(() => _venueId = v.id),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.primary.withValues(alpha: 0.06)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: selected ? AppColors.primary : AppColors.border,
                        width: selected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          height: 36,
                          width: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.stadium_outlined,
                              color: AppColors.primary, size: 18),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(v.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                              Text(
                                '${v.district}, ${v.city}',
                                style: const TextStyle(
                                    color: AppColors.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        if (selected)
                          const Icon(Icons.check_circle,
                              color: AppColors.primary, size: 20),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 12),
            _label('Vai trò *'),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: _RoleOption(
                    icon: Icons.workspace_premium,
                    color: AppColors.accent,
                    title: 'MANAGER',
                    desc: 'Quản lý sân, sửa giá, mời staff khác',
                    active: _role == StaffRole.manager,
                    onTap: () => setState(() => _role = StaffRole.manager),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _RoleOption(
              icon: Icons.shield_outlined,
              color: AppColors.primary,
              title: 'STAFF',
              desc: 'Check-in QR, xem lịch sân, tạo booking thủ công',
              active: _role == StaffRole.staff,
              onTap: () => setState(() => _role = StaffRole.staff),
            ),

            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_outline,
                      color: AppColors.textSecondary, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Bạn có thể đổi vai trò hoặc xoá nhân viên bất cứ lúc nào sau khi mời.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
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

  Widget _label(String text) => Text(
        text,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
      );
}

class _ChannelOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _ChannelOption({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: active ? AppColors.primary.withValues(alpha: 0.06) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
            width: active ? 1.5 : 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                color: active ? AppColors.primary : AppColors.textSecondary, size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: active ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleOption extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String desc;
  final bool active;
  final VoidCallback onTap;
  const _RoleOption({
    required this.icon,
    required this.color,
    required this.title,
    required this.desc,
    required this.active,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.06) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: active ? color : AppColors.border,
            width: active ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: active ? color : null,
                          fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(desc,
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 12, height: 1.4)),
                ],
              ),
            ),
            if (active)
              Icon(Icons.check_circle, color: color, size: 20),
          ],
        ),
      ),
    );
  }
}
