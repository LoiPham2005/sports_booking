import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/base/riverpod/riverpod_listeners.dart';
import '../../../../shared/routing/route_paths.dart';
import '../../../../shared/routing/safe_pop.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../data/models/user_dto.dart';
import '../providers/auth_notifier.dart';
import 'login_page.dart';

class RegisterPage extends HookConsumerWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nameCtl = useTextEditingController();
    final emailCtl = useTextEditingController();
    final phoneCtl = useTextEditingController();
    final passwordCtl = useTextEditingController();
    final agree = useState(false);
    final localError = useState<String?>(null);

    final state = ref.watch(authProvider);
    final notifier = ref.read(authProvider.notifier);
    final submitting = state.isLoading;

    useAsyncValueChange(state);

    ref.listen<AsyncValue<UserDto?>>(authProvider, (prev, next) {
      if (next is AsyncData<UserDto?> && next.value != null) {
        context.go(LoginPage.redirectFor(next.value!.role));
      }
    });

    Future<void> submit() async {
      final name = nameCtl.text.trim();
      final email = emailCtl.text.trim();
      final phone = phoneCtl.text.trim();
      final password = passwordCtl.text;

      if (name.isEmpty) {
        localError.value = 'Vui lòng nhập họ tên';
        return;
      }
      if (email.isEmpty && phone.isEmpty) {
        localError.value = 'Nhập ít nhất 1 trong email hoặc số điện thoại';
        return;
      }
      if (password.length < 8) {
        localError.value = 'Mật khẩu tối thiểu 8 ký tự';
        return;
      }
      localError.value = null;

      await notifier.register(
        fullName: name,
        email: email.isEmpty ? null : email,
        phone: phone.isEmpty ? null : phone,
        password: password,
      );
    }

    final apiError = state.hasError ? _friendlyError(state.error) : null;
    final errorText = localError.value ?? apiError;

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Đăng ký tài khoản',
                  style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              const Text(
                'Chỉ 30 giây để bắt đầu đặt sân và nhận ưu đãi mới nhất.',
                style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 28),
              const _Label('Họ và tên'),
              TextField(
                controller: nameCtl,
                decoration: const InputDecoration(hintText: 'Nguyễn Văn A'),
              ),
              const SizedBox(height: 16),
              const _Label('Email'),
              TextField(
                controller: emailCtl,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: const InputDecoration(hintText: 'ban@example.com'),
              ),
              const SizedBox(height: 16),
              const _Label('Số điện thoại'),
              TextField(
                controller: phoneCtl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: '09xxxxxxxx'),
              ),
              const SizedBox(height: 16),
              const _Label('Mật khẩu'),
              TextField(
                controller: passwordCtl,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'Ít nhất 8 ký tự'),
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: agree.value,
                    activeColor: AppColors.primary,
                    onChanged: (v) => agree.value = v ?? false,
                  ),
                  const Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(top: 14),
                      child: Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'Tôi đồng ý với '),
                          TextSpan(
                              text: 'Điều khoản sử dụng',
                              style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600)),
                          TextSpan(text: ' và '),
                          TextSpan(
                              text: 'Chính sách bảo mật',
                              style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600)),
                          TextSpan(text: '.'),
                        ]),
                        style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                            height: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
              if (errorText != null) ...[
                const SizedBox(height: 4),
                _ErrorBanner(message: errorText),
              ],
              const SizedBox(height: 20),
              FilledButton(
                onPressed: (agree.value && !submitting) ? submit : null,
                child: submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Tạo tài khoản'),
              ),
              const SizedBox(height: 16),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Đã có tài khoản? ',
                        style: TextStyle(color: AppColors.textSecondary)),
                    TextButton(
                      onPressed: () =>
                          safePop(context, fallback: RoutePaths.login),
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
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      );
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
      ),
      child: Text(message,
          style: const TextStyle(color: AppColors.danger, fontSize: 13)),
    );
  }
}

String _friendlyError(Object? e) {
  final msg = e?.toString() ?? '';
  if (msg.contains('SocketException') || msg.contains('Connection refused')) {
    return 'Không kết nối được server.';
  }
  if (msg.contains('409') || msg.contains('conflict')) {
    return 'Email/SĐT đã được sử dụng.';
  }
  if (msg.contains('400')) return 'Thông tin không hợp lệ.';
  return 'Đăng ký thất bại. Vui lòng thử lại.';
}
