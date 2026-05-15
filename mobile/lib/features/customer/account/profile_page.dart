import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme/app_colors.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Thông tin cá nhân'),
        actions: [TextButton(onPressed: () {}, child: const Text('Lưu'))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: Stack(
              children: [
                Container(
                  height: 100,
                  width: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Text('M',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 44,
                          fontWeight: FontWeight.w800)),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3),
                    ),
                    child: const Icon(Icons.camera_alt_outlined,
                        color: Colors.white, size: 16),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _Section('Thông tin cơ bản'),
          const _LabeledField(label: 'Họ và tên', value: 'Nguyễn Minh'),
          const SizedBox(height: 12),
          const _LabeledField(label: 'Email', value: 'minh@example.com', readOnly: true),
          const SizedBox(height: 12),
          const _LabeledField(label: 'Số điện thoại', value: '+84 901 234 567'),
          const SizedBox(height: 12),
          const _LabeledField(label: 'Ngày sinh', value: '15/08/1995'),
          const SizedBox(height: 12),
          const _LabeledField(label: 'Giới tính', value: 'Nam'),

          const SizedBox(height: 24),
          _Section('Bảo mật'),
          _SecurityRow(
            title: 'Mật khẩu',
            subtitle: 'Cập nhật 2 tuần trước',
            actionLabel: 'Đổi',
          ),
          const Divider(height: 24),
          _SecurityRow(
            title: 'Xác thực 2 lớp',
            subtitle: 'Bảo vệ tài khoản qua OTP SMS',
            actionLabel: 'Bật',
          ),
          const SizedBox(height: 32),
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
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(text.toUpperCase(),
            style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                letterSpacing: 1.5,
                fontWeight: FontWeight.w700)),
      );
}

class _LabeledField extends StatelessWidget {
  final String label;
  final String value;
  final bool readOnly;
  const _LabeledField({
    required this.label,
    required this.value,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: TextEditingController(text: value),
          readOnly: readOnly,
          decoration: InputDecoration(
            suffixIcon: readOnly
                ? const Padding(
                    padding: EdgeInsets.only(right: 12),
                    child: Icon(Icons.lock_outline, size: 16, color: AppColors.textMuted),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

class _SecurityRow extends StatelessWidget {
  final String title, subtitle, actionLabel;
  const _SecurityRow({
    required this.title,
    required this.subtitle,
    required this.actionLabel,
  });
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
              Text(subtitle,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            ],
          ),
        ),
        OutlinedButton(
          onPressed: () {},
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 36),
            padding: const EdgeInsets.symmetric(horizontal: 18),
          ),
          child: Text(actionLabel),
        ),
      ],
    );
  }
}
