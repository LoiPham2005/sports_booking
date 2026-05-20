import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/base/riverpod/riverpod_listeners.dart';
import '../../../../shared/routing/route_paths.dart';
import '../../../../shared/theme/app_colors.dart';
import '../providers/auth_notifier.dart';

class ForgotPasswordPage extends HookConsumerWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final identifierCtl = useTextEditingController();
    final passwordCtl = useTextEditingController();
    final otpCtls = useMemoized(
      () => List<TextEditingController>.generate(6, (_) => TextEditingController()),
    );
    final otpFocus = useMemoized(
      () => List<FocusNode>.generate(6, (_) => FocusNode()),
    );

    // Dispose tự động.
    useEffect(() {
      return () {
        for (final c in otpCtls) {
          c.dispose();
        }
        for (final f in otpFocus) {
          f.dispose();
        }
      };
    }, const []);

    final step = useState(0); // 0 = identifier, 1 = OTP + password
    final localError = useState<String?>(null);

    final state = ref.watch(authProvider);
    final notifier = ref.read(authProvider.notifier);
    final submitting = state.isLoading;

    useAsyncValueChange(state);

    String otpCode() => otpCtls.map((c) => c.text).join();

    Future<void> requestOtp() async {
      final id = identifierCtl.text.trim();
      if (id.isEmpty) {
        localError.value = 'Nhập email hoặc số điện thoại';
        return;
      }
      localError.value = null;
      await notifier.forgotPassword(id);
      if (!context.mounted) return;
      if (!state.hasError) {
        step.value = 1;
        otpFocus.first.requestFocus();
      }
    }

    Future<void> resetPassword() async {
      if (otpCode().length != 6) {
        localError.value = 'Nhập đủ 6 số OTP';
        return;
      }
      if (passwordCtl.text.length < 8) {
        localError.value = 'Mật khẩu tối thiểu 8 ký tự';
        return;
      }
      localError.value = null;

      await notifier.resetPassword(
        identifier: identifierCtl.text.trim(),
        code: otpCode(),
        newPassword: passwordCtl.text,
      );

      if (!context.mounted) return;
      if (!ref.read(authProvider).hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mật khẩu đã đặt lại.')),
        );
        context.go(RoutePaths.login);
      }
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
              Text('Quên mật khẩu',
                  style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              Text(
                step.value == 0
                    ? 'Nhập email/điện thoại — chúng tôi gửi mã OTP 6 số.'
                    : 'Nhập mã OTP đã gửi tới bạn và đặt mật khẩu mới.',
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 28),
              if (step.value == 0) ...[
                const Text('Email / Số điện thoại',
                    style:
                        TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: identifierCtl,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(hintText: 'ban@example.com'),
                ),
                if (errorText != null) ...[
                  const SizedBox(height: 12),
                  _ErrorBanner(message: errorText),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: submitting ? null : requestOtp,
                  child: submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Gửi mã OTP'),
                ),
              ] else ...[
                const Text('Mã OTP (6 số)',
                    style:
                        TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (i) => _OtpBox(
                        controller: otpCtls[i],
                        focus: otpFocus[i],
                        nextFocus: i < 5 ? otpFocus[i + 1] : null,
                      )),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: submitting ? null : requestOtp,
                  style: TextButton.styleFrom(padding: EdgeInsets.zero),
                  child: const Text('Gửi lại mã',
                      style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 16),
                const Text('Mật khẩu mới',
                    style:
                        TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: passwordCtl,
                  obscureText: true,
                  decoration: const InputDecoration(hintText: 'Ít nhất 8 ký tự'),
                ),
                if (errorText != null) ...[
                  const SizedBox(height: 12),
                  _ErrorBanner(message: errorText),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: submitting ? null : resetPassword,
                  child: submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Đặt lại mật khẩu'),
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
  const _OtpBox({required this.controller, required this.focus, this.nextFocus});
  final TextEditingController controller;
  final FocusNode focus;
  final FocusNode? nextFocus;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 56,
      child: TextField(
        controller: controller,
        focusNode: focus,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        decoration: InputDecoration(
          counterText: '',
          contentPadding: EdgeInsets.zero,
          filled: true,
          fillColor: AppColors.surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
        ),
        onChanged: (v) {
          if (v.isNotEmpty && nextFocus != null) nextFocus!.requestFocus();
        },
      ),
    );
  }
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
  if (msg.contains('404')) return 'Tài khoản không tồn tại.';
  if (msg.contains('400')) return 'Mã OTP không hợp lệ hoặc hết hạn.';
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}
