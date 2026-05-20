import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';

class AccountTab extends StatelessWidget {
  const AccountTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        children: [
          // Profile header
          Container(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  height: 64,
                  width: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'M',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text('Nguyễn Minh',
                              style:
                                  TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              '⭐ GOLD',
                              style: TextStyle(
                                color: AppColors.accent,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Text('minh@example.com',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => context.push(RoutePaths.profile),
                  icon: const Icon(Icons.edit_outlined),
                ),
              ],
            ),
          ),

          // KPI strip
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withValues(alpha: 0.08),
                  AppColors.accent.withValues(alpha: 0.06),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: const [
                Expanded(child: _Kpi(value: '24', label: 'Booking')),
                _Divider(),
                Expanded(child: _Kpi(value: '4.8★', label: 'Đánh giá TB')),
                _Divider(),
                Expanded(child: _Kpi(value: '3', label: 'Voucher')),
              ],
            ),
          ),

          const SizedBox(height: 20),

          _Section('Tài khoản'),
          _Tile(
            icon: Icons.favorite_outline,
            color: const Color(0xFFF43F5E),
            title: 'Sân yêu thích',
            badge: '12',
            onTap: () => context.push(RoutePaths.favorites),
          ),
          _Tile(
            icon: Icons.notifications_outlined,
            color: AppColors.accent,
            title: 'Thông báo',
            badge: '2',
            onTap: () => context.push(RoutePaths.notifications),
          ),
          _Tile(
            icon: Icons.credit_card_outlined,
            color: AppColors.vnpay,
            title: 'Phương thức thanh toán',
            onTap: () {},
          ),
          _Tile(
            icon: Icons.local_offer_outlined,
            color: AppColors.success,
            title: 'Voucher của tôi',
            badge: '3',
            onTap: () {},
          ),

          const SizedBox(height: 8),
          _Section('Khác'),
          _Tile(
            icon: Icons.settings_outlined,
            color: AppColors.textSecondary,
            title: 'Cài đặt',
            onTap: () => context.push(RoutePaths.settings),
          ),
          _Tile(
            icon: Icons.help_outline,
            color: AppColors.textSecondary,
            title: 'Trợ giúp & Liên hệ',
            onTap: () {},
          ),
          _Tile(
            icon: Icons.info_outline,
            color: AppColors.textSecondary,
            title: 'Về SportsBooking',
            trailingText: 'v1.0.0',
            onTap: () {},
          ),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
            child: OutlinedButton.icon(
              onPressed: () => context.go(RoutePaths.login),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.danger,
                side: const BorderSide(color: AppColors.danger),
              ),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Đăng xuất'),
            ),
          ),
        ],
      ),
    );
  }
}

class _Kpi extends StatelessWidget {
  final String value, label;
  const _Kpi({required this.value, required this.label});
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary)),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) =>
      Container(height: 28, width: 1, color: AppColors.border);
}

class _Section extends StatelessWidget {
  final String title;
  // ignore: use_super_parameters
  const _Section(this.title);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 6),
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w700),
        ),
      );
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String? badge;
  final String? trailingText;
  final VoidCallback onTap;
  const _Tile({
    required this.icon,
    required this.color,
    required this.title,
    required this.onTap,
    this.badge,
    this.trailingText,
  });
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            Container(
              height: 36,
              width: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(title,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(badge!,
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 11)),
              ),
            if (trailingText != null)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(trailingText!,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 12)),
              ),
            const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
