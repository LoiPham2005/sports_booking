import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../data/repos/auth_repo.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _identifierCtl = TextEditingController();
  final _otpCtls = List.generate(6, (_) => TextEditingController());
  final _otpFocus = List.generate(6, (_) => FocusNode());
  final _passwordCtl = TextEditingController();

  int _step = 0; // 0 = nhập identifier, 1 = nhập OTP + password mới
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _identifierCtl.dispose();
    for (final c in _otpCtls) {
      c.dispose();
    }
    for (final f in _otpFocus) {
      f.dispose();
    }
    _passwordCtl.dispose();
    super.dispose();
  }

  String get _otpCode => _otpCtls.map((c) => c.text).join();

  Future<void> _requestOtp() async {
    final id = _identifierCtl.text.trim();
    if (id.isEmpty) {
      setState(() => _error = 'Nhập email hoặc số điện thoại');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await AuthRepo.forgotPassword(id);
      if (!mounted) return;
      setState(() => _step = 1);
      _otpFocus.first.requestFocus();
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = _friendlyError(e));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _resetPassword() async {
    if (_otpCode.length != 6) {
      setState(() => _error = 'Nhập đủ 6 số OTP');
      return;
    }
    if (_passwordCtl.text.length < 8) {
      setState(() => _error = 'Mật khẩu tối thiểu 8 ký tự');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await AuthRepo.resetPassword(
        identifier: _identifierCtl.text.trim(),
        code: _otpCode,
        newPassword: _passwordCtl.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mật khẩu đã đặt lại. Đăng nhập lại nhé.')),
      );
      context.go(RoutePaths.login);
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
                TextField(
                  controller: _identifierCtl,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(hintText: 'ban@example.com'),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  _ErrorBanner(message: _error!),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _requestOtp,
                  child: _submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Gửi mã OTP'),
                ),
              ] else ...[
                const Text('Mã OTP (6 số)',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (i) => _OtpBox(
                        controller: _otpCtls[i],
                        focus: _otpFocus[i],
                        nextFocus: i < 5 ? _otpFocus[i + 1] : null,
                      )),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _submitting ? null : _requestOtp,
                  style: TextButton.styleFrom(padding: EdgeInsets.zero),
                  child: const Text('Gửi lại mã',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 16),
                const Text('Mật khẩu mới',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordCtl,
                  obscureText: true,
                  decoration: const InputDecoration(hintText: 'Ít nhất 8 ký tự'),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  _ErrorBanner(message: _error!),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _resetPassword,
                  child: _submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
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

  String _friendlyError(Object e) {
    final msg = e.toString();
    if (msg.contains('SocketException') || msg.contains('Connection refused')) {
      return 'Không kết nối được server.';
    }
    if (msg.contains('404')) return 'Tài khoản không tồn tại.';
    if (msg.contains('400')) return 'Mã OTP không hợp lệ hoặc hết hạn.';
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
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
