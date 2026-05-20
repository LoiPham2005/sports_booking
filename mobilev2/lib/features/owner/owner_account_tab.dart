import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/theme/app_colors.dart';
import '../auth/presentation/providers/auth_notifier.dart';
import 'owner_core/presentation/providers/owner_venues_notifier.dart';
import 'payout/presentation/providers/owner_payout_notifier.dart';
import 'staff/presentation/providers/owner_staff_notifier.dart';

class OwnerAccountTab extends ConsumerWidget {
  const OwnerAccountTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final userName = user?.fullName ?? 'Owner';
    final userEmail = user?.email ?? user?.phone ?? '';
    final venues =
        ref.watch(ownerVenuesProvider).value ?? MockData.ownerVenues;
    final staff =
        ref.watch(ownerStaffProvider).value;
    final activeStaff = staff?.where((s) => s.inviteStatus == 'ACTIVE').length;
    final totalStaff = staff?.length;
    final payout = ref.watch(ownerPayoutProvider).value;
    final avgRating = venues.isEmpty
        ? 0.0
        : venues.fold<double>(0, (s, v) => s + v.rating) / venues.length;
    return SafeArea(
      child: ListView(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Container(
                  height: 64,
                  width: 64,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'O',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text(userName,
                              style: const TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.w800)),
                          const SizedBox(width: 6),
                          const _OwnerBadge(),
                        ],
                      ),
                      Text(userEmail,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // KPI strip
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
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
                children: [
                  Expanded(
                      child:
                          _Kpi(value: '${venues.length}', label: 'Venue')),
                  const _VDivider(),
                  Expanded(
                      child: _Kpi(
                          value: '${totalStaff ?? 0}',
                          label: 'Nhân viên')),
                  const _VDivider(),
                  Expanded(
                      child: _Kpi(
                          value: avgRating > 0
                              ? '${avgRating.toStringAsFixed(1)}★'
                              : '—',
                          label: 'Rating')),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          _Section('Sân của tôi'),
          ...venues.map((v) => _Tile(
                icon: Icons.stadium_outlined,
                color: AppColors.primary,
                title: v.name,
                subtitle: '${v.district}, ${v.city} · ⭐ ${v.rating}',
                onTap: () => context.push(RoutePaths.ownerVenueEdit(v.id)),
              )),

          // Add new venue tile
          InkWell(
            onTap: () => context.push(RoutePaths.ownerVenueCreate),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Container(
                    height: 36,
                    width: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.add, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Thêm venue mới',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: AppColors.primary)),
                        Text('Mở rộng kinh doanh — Admin duyệt trong 24h',
                            style: TextStyle(
                                color: AppColors.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios,
                      size: 14, color: AppColors.primary),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),
          _Section('Vận hành'),
          _Tile(
            icon: Icons.show_chart,
            color: AppColors.success,
            title: 'Báo cáo doanh thu',
            onTap: () => context.push(RoutePaths.ownerReports),
          ),
          _Tile(
            icon: Icons.account_balance,
            color: AppColors.info,
            title: 'Tài khoản nhận tiền',
            subtitle: payout?.bankAccount?.bankCode ??
                MockData.ownerBankAccount['bankName']!,
            onTap: () => context.push(RoutePaths.ownerPayout),
          ),
          _Tile(
            icon: Icons.groups_outlined,
            color: AppColors.accent,
            title: 'Nhân viên',
            subtitle: staff == null
                ? 'Đang tải...'
                : '${activeStaff ?? 0} đang trực · ${totalStaff ?? 0} tổng',
            onTap: () => context.push(RoutePaths.ownerStaff),
          ),

          const SizedBox(height: 8),
          _Section('Khác'),
          _Tile(
            icon: Icons.settings_outlined,
            color: AppColors.textSecondary,
            title: 'Cài đặt',
            onTap: () => context.push(RoutePaths.ownerSettings),
          ),
          _Tile(
            icon: Icons.help_outline,
            color: AppColors.textSecondary,
            title: 'Trợ giúp',
            onTap: () => context.push(RoutePaths.ownerHelp),
          ),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            child: OutlinedButton.icon(
              onPressed: () async { await ref.read(authProvider.notifier).logout(); if (context.mounted) context.go(RoutePaths.login); },
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

class _OwnerBadge extends StatelessWidget {
  const _OwnerBadge();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Text(
        'OWNER',
        style: TextStyle(
          color: AppColors.primary,
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
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
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.primary)),
        Text(label,
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }
}

class _VDivider extends StatelessWidget {
  const _VDivider();
  @override
  Widget build(BuildContext context) =>
      Container(height: 28, width: 1, color: AppColors.border);
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
