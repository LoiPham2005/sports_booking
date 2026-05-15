import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  bool _agree = false;

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
              Text('Đăng ký tài khoản', style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              const Text(
                'Chỉ 30 giây để bắt đầu đặt sân và nhận ưu đãi mới nhất.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 28),

              const _Label('Họ và tên'),
              const TextField(decoration: InputDecoration(hintText: 'Nguyễn Văn A')),
              const SizedBox(height: 16),
              const _Label('Email'),
              const TextField(
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(hintText: 'ban@example.com'),
              ),
              const SizedBox(height: 16),
              const _Label('Số điện thoại'),
              const TextField(
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(hintText: '09xxxxxxxx'),
              ),
              const SizedBox(height: 16),
              const _Label('Mật khẩu'),
              const TextField(
                obscureText: true,
                decoration: InputDecoration(hintText: 'Ít nhất 8 ký tự'),
              ),
              const SizedBox(height: 16),

              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _agree,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _agree = v ?? false),
                  ),
                  const Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(top: 14),
                      child: Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'Tôi đồng ý với '),
                          TextSpan(
                            text: 'Điều khoản sử dụng',
                            style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                          ),
                          TextSpan(text: ' và '),
                          TextSpan(
                            text: 'Chính sách bảo mật',
                            style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                          ),
                          TextSpan(text: '.'),
                        ]),
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: _agree ? () => context.go(RoutePaths.main) : null,
                child: const Text('Tạo tài khoản'),
              ),
              const SizedBox(height: 16),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Đã có tài khoản? ', style: TextStyle(color: AppColors.textSecondary)),
                    TextButton(onPressed: () => context.pop(), child: const Text('Đăng nhập')),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      );
}
