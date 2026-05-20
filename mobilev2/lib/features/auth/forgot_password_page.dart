import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/theme/app_colors.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  int _step = 0; // 0: enter identifier, 1: OTP + new password

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Quên mật khẩu', style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              Text(
                _step == 0
                    ? 'Nhập email/điện thoại — chúng tôi gửi mã OTP 6 số.'
                    : 'Nhập mã OTP đã gửi tới bạn và đặt mật khẩu mới.',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 28),
              if (_step == 0) ...[
                const Text('Email / Số điện thoại',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                const TextField(decoration: InputDecoration(hintText: 'ban@example.com')),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => setState(() => _step = 1),
                  child: const Text('Gửi mã OTP'),
                ),
              ] else ...[
                const Text('Mã OTP (6 số)',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(
                    6,
                    (i) => _OtpBox(active: i == 0),
                  ),
                ),
                const SizedBox(height: 16),
                Text.rich(
                  TextSpan(children: [
                    const TextSpan(
                      text: 'Chưa nhận được mã? ',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                    TextSpan(
                      text: 'Gửi lại sau 60s',
                      style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600),
                      recognizer: null,
                    ),
                  ]),
                ),
                const SizedBox(height: 24),
                const Text('Mật khẩu mới',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                const TextField(
                  obscureText: true,
                  decoration: InputDecoration(hintText: 'Ít nhất 8 ký tự'),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Mật khẩu đã đặt lại')),
                    );
                    context.pop();
                  },
                  child: const Text('Đặt lại mật khẩu'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  final bool active;
  const _OtpBox({required this.active});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: active ? AppColors.primary : AppColors.border,
          width: active ? 2 : 1,
        ),
      ),
    );
  }
}
