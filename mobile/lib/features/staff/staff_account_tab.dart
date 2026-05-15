import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/demo_state.dart';
import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';

class StaffAccountTab extends StatelessWidget {
  const StaffAccountTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isManager = DemoState.instance.isManager;
    return SafeArea(
      child: ListView(
        children: [
          // Profile header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
            child: Column(
              children: [
                Container(
                  height: 76,
                  width: 76,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: isManager
                          ? const [Color(0xFF8B5CF6), Color(0xFF6D28D9)]
                          : const [AppColors.accent, Color(0xFFEA580C)],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    isManager ? 'M' : 'S',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  isManager ? 'Manager Demo' : 'Nguyễn Văn Staff',
                  style:
                      const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isManager
                            ? const Color(0xFF8B5CF6)
                            : AppColors.accent)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isManager
                            ? Icons.workspace_premium
                            : Icons.shield_outlined,
                        color: isManager
                            ? const Color(0xFF7C3AED)
                            : AppColors.accent,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isManager ? 'MANAGER' : 'STAFF',
                        style: TextStyle(
                          color: isManager
                              ? const Color(0xFF7C3AED)
                              : AppColors.accent,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Venue assignment card
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.06),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.shield, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Đang trực tại',
                            style: TextStyle(
                                color: AppColors.textMuted, fontSize: 11)),
                        Text(MockData.staffVenue.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 14)),
                        Text(
                          '${MockData.staffVenue.district}, ${MockData.staffVenue.city}',
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),
          _Section('Hoạt động'),
          _Tile(
            icon: Icons.qr_code_scanner,
            color: AppColors.primary,
            title: 'Quét QR check-in',
            onTap: () => context.push(RoutePaths.staffQrScan),
          ),
          _Tile(
            icon: Icons.event_note_outlined,
            color: AppColors.info,
            title: 'Báo cáo ca trực',
            subtitle: 'Hôm nay: 6 booking',
            onTap: () {},
          ),

          if (isManager) ...[
            const SizedBox(height: 8),
            _Section('Quản lý (Manager)'),
            _Tile(
              icon: Icons.local_offer_outlined,
              color: const Color(0xFF8B5CF6),
              title: 'Giá tạm thời',
              subtitle: 'Override giá theo khung giờ',
              onTap: () => context.push(RoutePaths.staffPricing),
            ),
            _Tile(
              icon: Icons.groups_outlined,
              color: const Color(0xFF8B5CF6),
              title: 'Đội ngũ',
              subtitle: 'Xem nhân viên cùng venue',
              onTap: () => context.push(RoutePaths.staffTeam),
            ),
          ],

          const SizedBox(height: 8),
          _Section('Tài khoản'),
          _Tile(
            icon: Icons.person_outline,
            color: AppColors.textSecondary,
            title: 'Hồ sơ',
            onTap: () {},
          ),
          _Tile(
            icon: Icons.lock_outline,
            color: AppColors.textSecondary,
            title: 'Đổi mật khẩu',
            onTap: () {},
          ),
          _Tile(
            icon: Icons.help_outline,
            color: AppColors.textSecondary,
            title: 'Trợ giúp',
            onTap: () {},
          ),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
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

class _Section extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _Section(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
        child: Text(
          text.toUpperCase(),
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
  final String? subtitle;
  final VoidCallback onTap;
  const _Tile({
    required this.icon,
    required this.color,
    required this.title,
    required this.onTap,
    this.subtitle,
  });
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14)),
                  if (subtitle != null)
                    Text(subtitle!,
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios,
                size: 14, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
