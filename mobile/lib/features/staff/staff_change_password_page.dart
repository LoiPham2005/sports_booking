import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class StaffChangePasswordPage extends StatefulWidget {
  const StaffChangePasswordPage({super.key});

  @override
  State<StaffChangePasswordPage> createState() =>
      _StaffChangePasswordPageState();
}

class _StaffChangePasswordPageState extends State<StaffChangePasswordPage> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _showCurrent = false;
  bool _showNext = false;
  bool _showConfirm = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _next.addListener(() => setState(() {}));
    _confirm.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  int get _strength {
    final p = _next.text;
    if (p.isEmpty) return 0;
    int s = 0;
    if (p.length >= 8) s++;
    if (RegExp(r'[A-Z]').hasMatch(p)) s++;
    if (RegExp(r'[a-z]').hasMatch(p)) s++;
    if (RegExp(r'[0-9]').hasMatch(p)) s++;
    if (RegExp(r'[!@#\$%^&*(),.?":{}|<>_\-+=]').hasMatch(p)) s++;
    return s.clamp(0, 4);
  }

  String get _strengthLabel => switch (_strength) {
        0 => '',
        1 => 'Yếu',
        2 => 'Trung bình',
        3 => 'Khá mạnh',
        _ => 'Mạnh',
      };

  Color get _strengthColor => switch (_strength) {
        0 => AppColors.border,
        1 => AppColors.danger,
        2 => AppColors.warning,
        3 => AppColors.info,
        _ => AppColors.success,
      };

  bool get _canSubmit =>
      _current.text.isNotEmpty &&
      _next.text.length >= 8 &&
      _next.text == _confirm.text &&
      !_submitting;

  Future<void> _submit() async {
    setState(() => _submitting = true);
    await Future<void>.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() => _submitting = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đổi mật khẩu — phiên đăng nhập khác đã bị thu hồi'),
      ),
    );
    safePop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Đổi mật khẩu'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Info banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.info.withValues(alpha: 0.08),
              border: Border.all(color: AppColors.info.withValues(alpha: 0.25)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.shield_outlined,
                    color: AppColors.info, size: 18),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Sau khi đổi mật khẩu, mọi thiết bị khác đăng nhập tài khoản này sẽ bị đăng xuất tự động.',
                    style: TextStyle(fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          _PasswordField(
            label: 'Mật khẩu hiện tại',
            controller: _current,
            obscured: !_showCurrent,
            onToggle: () => setState(() => _showCurrent = !_showCurrent),
          ),
          const SizedBox(height: 14),
          _PasswordField(
            label: 'Mật khẩu mới',
            controller: _next,
            obscured: !_showNext,
            onToggle: () => setState(() => _showNext = !_showNext),
          ),

          if (_next.text.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: List.generate(4, (i) {
                final filled = i < _strength;
                return Expanded(
                  child: Container(
                    height: 4,
                    margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                    decoration: BoxDecoration(
                      color: filled ? _strengthColor : AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Text('Độ mạnh: ',
                    style: TextStyle(
                        color: AppColors.textMuted, fontSize: 12)),
                Text(_strengthLabel,
                    style: TextStyle(
                        color: _strengthColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 12)),
              ],
            ),
          ],

          const SizedBox(height: 14),
          _PasswordField(
            label: 'Nhập lại mật khẩu mới',
            controller: _confirm,
            obscured: !_showConfirm,
            onToggle: () => setState(() => _showConfirm = !_showConfirm),
            errorText:
                _confirm.text.isNotEmpty && _confirm.text != _next.text
                    ? 'Mật khẩu không khớp'
                    : null,
          ),

          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Mật khẩu mới cần:',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13)),
                const SizedBox(height: 8),
                _Rule('Ít nhất 8 ký tự', _next.text.length >= 8),
                _Rule('Có chữ in hoa (A-Z)',
                    RegExp(r'[A-Z]').hasMatch(_next.text)),
                _Rule('Có chữ thường (a-z)',
                    RegExp(r'[a-z]').hasMatch(_next.text)),
                _Rule('Có số (0-9)',
                    RegExp(r'[0-9]').hasMatch(_next.text)),
                _Rule('Có ký tự đặc biệt (!@#...)',
                    RegExp(r'[!@#\$%^&*(),.?":{}|<>_\-+=]')
                        .hasMatch(_next.text)),
              ],
            ),
          ),

          const SizedBox(height: 24),
          FilledButton(
            onPressed: _canSubmit ? _submit : null,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
            ),
            child: _submitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Cập nhật mật khẩu'),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text(
                        'Demo — link đặt lại sẽ được gửi tới email công ty')),
              );
            },
            child: const Text('Quên mật khẩu hiện tại?'),
          ),
        ],
      ),
    );
  }
}

class _PasswordField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool obscured;
  final VoidCallback onToggle;
  final String? errorText;
  const _PasswordField({
    required this.label,
    required this.controller,
    required this.obscured,
    required this.onToggle,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 6),
          child: Text(label,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w700)),
        ),
        TextField(
          controller: controller,
          obscureText: obscured,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.lock_outline, size: 18),
            suffixIcon: IconButton(
              icon: Icon(
                obscured ? Icons.visibility_off : Icons.visibility,
                size: 18,
              ),
              onPressed: onToggle,
            ),
            isDense: true,
            errorText: errorText,
          ),
        ),
      ],
    );
  }
}

class _Rule extends StatelessWidget {
  final String text;
  final bool ok;
  const _Rule(this.text, this.ok);

  @override
  Widget build(BuildContext context) {
    final color = ok ? AppColors.success : AppColors.textMuted;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(ok ? Icons.check_circle : Icons.circle_outlined,
              size: 14, color: color),
          const SizedBox(width: 6),
          Text(text,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: ok ? FontWeight.w700 : FontWeight.w500,
              )),
        ],
      ),
    );
  }
}
