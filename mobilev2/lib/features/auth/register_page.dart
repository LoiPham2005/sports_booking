import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'data/repos/auth_repo.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _nameCtl = TextEditingController();
  final _emailCtl = TextEditingController();
  final _phoneCtl = TextEditingController();
  final _passwordCtl = TextEditingController();
  bool _agree = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _nameCtl.dispose();
    _emailCtl.dispose();
    _phoneCtl.dispose();
    _passwordCtl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameCtl.text.trim();
    final email = _emailCtl.text.trim();
    final phone = _phoneCtl.text.trim();
    final password = _passwordCtl.text;

    if (name.isEmpty) {
      setState(() => _error = 'Vui lòng nhập họ tên');
      return;
    }
    if (email.isEmpty && phone.isEmpty) {
      setState(() => _error = 'Nhập ít nhất 1 trong email hoặc số điện thoại');
      return;
    }
    if (password.length < 8) {
      setState(() => _error = 'Mật khẩu tối thiểu 8 ký tự');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await AuthRepo.register(
        fullName: name,
        email: email.isEmpty ? null : email,
        phone: phone.isEmpty ? null : phone,
        password: password,
      );
      if (!mounted) return;
      // Customer mặc định → /main.
      context.go(RoutePaths.main);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = _friendlyError(e));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

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
              TextField(
                controller: _nameCtl,
                decoration: const InputDecoration(hintText: 'Nguyễn Văn A'),
              ),
              const SizedBox(height: 16),
              const _Label('Email'),
              TextField(
                controller: _emailCtl,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: const InputDecoration(hintText: 'ban@example.com'),
              ),
              const SizedBox(height: 16),
              const _Label('Số điện thoại'),
              TextField(
                controller: _phoneCtl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: '09xxxxxxxx'),
              ),
              const SizedBox(height: 16),
              const _Label('Mật khẩu'),
              TextField(
                controller: _passwordCtl,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Ít nhất 8 ký tự'),
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

              if (_error != null) ...[
                const SizedBox(height: 4),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: AppColors.danger, fontSize: 13),
                  ),
                ),
              ],
              const SizedBox(height: 20),

              FilledButton(
                onPressed: (_agree && !_submitting) ? _submit : null,
                child: _submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Tạo tài khoản'),
              ),
              const SizedBox(height: 16),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Đã có tài khoản? ', style: TextStyle(color: AppColors.textSecondary)),
                    TextButton(
                      onPressed: () => safePop(context, fallback: RoutePaths.login),
                      child: const Text('Đăng nhập'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _friendlyError(Object e) {
    final msg = e.toString();
    if (msg.contains('SocketException') || msg.contains('Connection refused')) {
      return 'Không kết nối được server. Kiểm tra mạng hoặc backend đã chạy chưa.';
    }
    if (msg.contains('409') || msg.contains('conflict')) {
      return 'Email/SĐT đã được sử dụng.';
    }
    if (msg.contains('400')) return 'Thông tin không hợp lệ. Kiểm tra lại.';
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
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
