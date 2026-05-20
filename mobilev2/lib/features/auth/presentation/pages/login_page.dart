import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/base/riverpod/riverpod_listeners.dart';
import '../../../../core/common/constants/app_config.dart';
import '../../../../shared/mock/demo_state.dart';
import '../../../../shared/routing/route_paths.dart';
import '../../../../shared/theme/app_colors.dart';
import '../../data/models/user_dto.dart';
import '../providers/auth_notifier.dart';

/// Login form — pattern theo `lib/features/_reference/voucher/`:
/// - HookConsumerWidget + `useTextEditingController`
/// - ref.watch(authProvider) cho submission state
/// - useAsyncValueChange(state) cho toast error/success
/// - ref.listen để navigate sau login OK
class LoginPage extends HookConsumerWidget {
  const LoginPage({super.key});

  /// Route đích theo role sau khi login thành công.
  static String redirectFor(UserRole role) => switch (role) {
        UserRole.customer => RoutePaths.main,
        UserRole.owner => RoutePaths.owner,
        UserRole.staff => RoutePaths.staff,
        // TODO: thêm /admin khi có route
        UserRole.admin => RoutePaths.main,
        UserRole.superAdmin => RoutePaths.main,
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final identifierCtl = useTextEditingController();
    final passwordCtl = useTextEditingController();
    final obscure = useState(true);
    final remember = useState(true);
    final localError = useState<String?>(null);

    final state = ref.watch(authProvider);
    final notifier = ref.read(authProvider.notifier);
    final submitting = state.isLoading;

    useAsyncValueChange(state);

    // Navigate khi state đổi sang AsyncData(user) sau login thành công.
    ref.listen<AsyncValue<UserDto?>>(authProvider, (prev, next) {
      if (next is AsyncData<UserDto?> && next.value != null) {
        context.go(redirectFor(next.value!.role));
      }
    });

    Future<void> submit({String? id, String? pw}) async {
      final identifier = id ?? identifierCtl.text.trim();
      final password = pw ?? passwordCtl.text;
      if (identifier.isEmpty || password.isEmpty) {
        localError.value = 'Vui lòng nhập đầy đủ thông tin';
        return;
      }
      localError.value = null;
      await notifier.login(identifier: identifier, password: password);
    }

    Future<void> demoLogin(String identifier,
        {StaffPortalRole? staffRole}) async {
      if (staffRole != null) DemoState.instance.setStaffRole(staffRole);
      await notifier.login(identifier: identifier, password: 'demo');
    }

    final apiError = state.hasError ? _friendlyError(state.error) : null;
    final errorText = localError.value ?? apiError;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              Container(
                height: 56,
                width: 56,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.primary, AppColors.primaryDark],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: const Text('🏟️', style: TextStyle(fontSize: 26)),
              ),
              const SizedBox(height: 32),
              Text('Đăng nhập',
                  style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              const Text(
                'Chào mừng trở lại! Đăng nhập để đặt sân và quản lý booking.',
                style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 28),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const _GoogleIcon(),
                label: const Text('Đăng nhập với Google'),
              ),
              const SizedBox(height: 20),
              const Row(children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text('hoặc',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ),
                Expanded(child: Divider()),
              ]),
              const SizedBox(height: 20),
              const _FieldLabel('Email hoặc số điện thoại'),
              TextField(
                controller: identifierCtl,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: const InputDecoration(
                  hintText: 'ban@example.com hoặc 09xxxxxxxx',
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Mật khẩu',
                      style: TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 13)),
                  TextButton(
                    onPressed: () => context.push(RoutePaths.forgotPassword),
                    child: const Text('Quên mật khẩu?'),
                  ),
                ],
              ),
              TextField(
                controller: passwordCtl,
                obscureText: obscure.value,
                onSubmitted: (_) => submit(),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  suffixIcon: IconButton(
                    icon: Icon(obscure.value
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined),
                    onPressed: () => obscure.value = !obscure.value,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Checkbox(
                    value: remember.value,
                    activeColor: AppColors.primary,
                    onChanged: (v) => remember.value = v ?? false,
                  ),
                  const Text('Ghi nhớ đăng nhập',
                      style: TextStyle(fontSize: 13)),
                ],
              ),
              if (errorText != null) ...[
                const SizedBox(height: 4),
                _ErrorBanner(message: errorText),
              ],
              const SizedBox(height: 16),
              FilledButton(
                onPressed: submitting ? null : submit,
                child: submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Đăng nhập'),
              ),
              const SizedBox(height: 24),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Chưa có tài khoản? ',
                        style: TextStyle(color: AppColors.textSecondary)),
                    TextButton(
                      onPressed: () => context.push(RoutePaths.register),
                      child: const Text('Đăng ký ngay'),
                    ),
                  ],
                ),
              ),
              if (AppConfig.useMock) ...[
                const SizedBox(height: 32),
                _DemoCard(onDemoLogin: demoLogin),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _DemoCard extends StatelessWidget {
  const _DemoCard({required this.onDemoLogin});
  final void Function(String, {StaffPortalRole? staffRole}) onDemoLogin;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('DEMO',
                    style: TextStyle(
                      color: AppColors.accent,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    )),
              ),
              const SizedBox(width: 8),
              const Text('Đăng nhập nhanh theo role',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 10),
          Row(children: [
            _DemoChip(
              emoji: '👤',
              label: 'Customer',
              color: AppColors.primary,
              onTap: () => onDemoLogin('customer@sportsbooking.local'),
            ),
            const SizedBox(width: 6),
            _DemoChip(
              emoji: '🏟️',
              label: 'Owner',
              color: AppColors.accent,
              onTap: () => onDemoLogin('owner@sportsbooking.local'),
            ),
          ]),
          const SizedBox(height: 6),
          Row(children: [
            _DemoChip(
              emoji: '🔧',
              label: 'Staff',
              color: AppColors.info,
              onTap: () => onDemoLogin('staff@sportsbooking.local',
                  staffRole: StaffPortalRole.staff),
            ),
            const SizedBox(width: 6),
            _DemoChip(
              emoji: '👑',
              label: 'Manager',
              color: const Color(0xFF8B5CF6),
              onTap: () => onDemoLogin('manager@sportsbooking.local',
                  staffRole: StaffPortalRole.manager),
            ),
          ]),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      );
}

class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 18,
      height: 18,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: const Text('G',
          style: TextStyle(
            color: Color(0xFF4285F4),
            fontWeight: FontWeight.w900,
            fontSize: 13,
          )),
    );
  }
}

class _DemoChip extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _DemoChip({
    required this.emoji,
    required this.label,
    required this.color,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(emoji, style: const TextStyle(fontSize: 18)),
              const SizedBox(height: 2),
              Text(label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: color,
                  )),
            ],
          ),
        ),
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
    return 'Không kết nối được server. Kiểm tra mạng hoặc backend đã chạy chưa.';
  }
  if (msg.contains('401')) return 'Email/SĐT hoặc mật khẩu không đúng.';
  if (msg.contains('429')) return 'Quá nhiều lần thử. Vui lòng đợi.';
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
}
