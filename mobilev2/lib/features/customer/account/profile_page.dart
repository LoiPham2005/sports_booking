import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/routing/safe_pop.dart';
import '../../../shared/theme/app_colors.dart';
import '../../auth/presentation/providers/auth_notifier.dart';

class ProfilePage extends HookConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final notifier = ref.read(authProvider.notifier);
    final submitting = ref.watch(authProvider).isLoading;

    final fullNameCtl = useTextEditingController(text: user?.fullName ?? '');
    final phoneCtl = useTextEditingController(text: user?.phone ?? '');

    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => safePop(context),
          ),
          title: const Text('Thông tin cá nhân'),
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text('Bạn chưa đăng nhập.'),
          ),
        ),
      );
    }

    Future<void> save() async {
      await notifier.updateProfile(fullName: fullNameCtl.text.trim());
      if (!context.mounted) return;
      final st = ref.read(authProvider);
      if (!st.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã cập nhật.')),
        );
      }
    }

    final initial = user.fullName.isNotEmpty
        ? user.fullName.characters.first.toUpperCase()
        : '?';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Thông tin cá nhân'),
        actions: [
          TextButton(
            onPressed: submitting ? null : save,
            child: submitting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Lưu'),
          ),
        ],
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
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(initial,
                      style: const TextStyle(
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
          const _Section('Thông tin cơ bản'),
          _LabeledField(label: 'Họ và tên', controller: fullNameCtl),
          const SizedBox(height: 12),
          _LabeledField(
            label: 'Email',
            controller: TextEditingController(text: user.email ?? ''),
            readOnly: true,
          ),
          const SizedBox(height: 12),
          _LabeledField(
            label: 'Số điện thoại',
            controller: phoneCtl,
            readOnly: true,
          ),
          const SizedBox(height: 24),
          const _Section('Bảo mật'),
          const _SecurityRow(
            title: 'Mật khẩu',
            subtitle: 'Đổi mật khẩu để bảo vệ tài khoản',
            actionLabel: 'Đổi',
          ),
          const Divider(height: 24),
          const _SecurityRow(
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
  final TextEditingController controller;
  final bool readOnly;
  const _LabeledField({
    required this.label,
    required this.controller,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          readOnly: readOnly,
          decoration: InputDecoration(
            suffixIcon: readOnly
                ? const Padding(
                    padding: EdgeInsets.only(right: 12),
                    child: Icon(Icons.lock_outline,
                        size: 16, color: AppColors.textMuted),
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
