import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool _obscure = true;
  bool _remember = true;

  @override
  Widget build(BuildContext context) {
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
              Text('Đăng nhập', style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: 8),
              const Text(
                'Chào mừng trở lại! Đăng nhập để đặt sân và quản lý booking.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
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
                  child: Text('hoặc', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ),
                Expanded(child: Divider()),
              ]),
              const SizedBox(height: 20),

              const _FieldLabel('Email hoặc số điện thoại'),
              const TextField(
                decoration: InputDecoration(hintText: 'ban@example.com hoặc 09xxxxxxxx'),
              ),
              const SizedBox(height: 16),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Mật khẩu', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  TextButton(
                    onPressed: () => context.push(RoutePaths.forgotPassword),
                    child: const Text('Quên mật khẩu?'),
                  ),
                ],
              ),
              TextField(
                obscureText: _obscure,
                decoration: InputDecoration(
                  hintText: '••••••••',
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Checkbox(
                    value: _remember,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _remember = v ?? false),
                  ),
                  const Text('Ghi nhớ đăng nhập', style: TextStyle(fontSize: 13)),
                ],
              ),
              const SizedBox(height: 16),

              FilledButton(
                onPressed: () => context.go(RoutePaths.main),
                child: const Text('Đăng nhập'),
              ),
              const SizedBox(height: 24),

              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Chưa có tài khoản? ', style: TextStyle(color: AppColors.textSecondary)),
                    TextButton(
                      onPressed: () => context.push(RoutePaths.register),
                      child: const Text('Đăng ký ngay'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),
              Container(
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
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'DEMO',
                            style: TextStyle(
                              color: AppColors.accent,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Đăng nhập nhanh theo role',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _DemoChip(
                          emoji: '👤',
                          label: 'Customer',
                          color: AppColors.primary,
                          onTap: () => context.go(RoutePaths.main),
                        ),
                        const SizedBox(width: 6),
                        _DemoChip(
                          emoji: '🏟️',
                          label: 'Owner',
                          color: AppColors.accent,
                          onTap: () => context.go(RoutePaths.owner),
                        ),
                        const SizedBox(width: 6),
                        _DemoChip(
                          emoji: '🔧',
                          label: 'Staff',
                          color: AppColors.info,
                          onTap: () => context.go(RoutePaths.staff),
                        ),
                      ],
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

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
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
      child: const Text(
        'G',
        style: TextStyle(
          color: Color(0xFF4285F4),
          fontWeight: FontWeight.w900,
          fontSize: 13,
        ),
      ),
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
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
