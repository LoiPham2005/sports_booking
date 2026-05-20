import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../auth/presentation/providers/auth_notifier.dart';
import '../owner/staff/data/models/staff_dto.dart';
import '../staff_portal/presentation/providers/staff_portal_notifier.dart';

class StaffTeamPage extends ConsumerWidget {
  const StaffTeamPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memberships = ref.watch(staffMembershipsProvider).value ?? const [];
    final venueId = memberships.isNotEmpty ? memberships.first.venueId : null;
    final venueName = memberships.isNotEmpty
        ? memberships.first.venue.name
        : 'venue';
    final user = ref.watch(currentUserProvider);
    final asyncTeam =
        ref.watch(staffTeamProvider(venueId: venueId));
    final team = asyncTeam.value ?? const <StaffMemberDto>[];
    // Loại current user khỏi danh sách "khác".
    final others = team.where((m) => m.user?.id != user?.id).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Đội ngũ tại venue'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.workspace_premium,
                        color: Color(0xFF7C3AED), size: 12),
                    SizedBox(width: 4),
                    Text(
                      'MANAGER',
                      style: TextStyle(
                        color: Color(0xFF7C3AED),
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Đội ngũ tại $venueName',
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13)),

          const SizedBox(height: 20),

          // "Bạn" highlight card
          if (user != null)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF8B5CF6).withValues(alpha: 0.08),
                    const Color(0xFF6D28D9).withValues(alpha: 0.04),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: const Color(0xFF8B5CF6),
                    child: Text(
                      user.fullName.isNotEmpty
                          ? user.fullName[0].toUpperCase()
                          : 'M',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Text('${user.fullName} (Bạn)',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15)),
                            const SizedBox(width: 6),
                            const Icon(Icons.verified,
                                color: Color(0xFF7C3AED), size: 14),
                          ],
                        ),
                        Text(user.email ?? user.phone ?? '',
                            style: const TextStyle(
                                color: AppColors.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 20),

          Text(
            'CÁC NHÂN VIÊN KHÁC (${others.length})',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),

          if (others.isEmpty && asyncTeam.isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 30),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (others.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text('Chưa có nhân viên khác',
                    style:
                        TextStyle(color: AppColors.textMuted, fontSize: 13)),
              ),
            )
          else
            ...others.map((m) => _MemberTile(member: m)),

          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border:
                  Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.warning, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Manager chỉ XEM đội ngũ. Mời/xoá nhân viên do Owner thực hiện.',
                    style: TextStyle(fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final StaffMemberDto member;
  const _MemberTile({required this.member});

  @override
  Widget build(BuildContext context) {
    final name = member.user?.fullName ?? member.email ?? '(chưa accept)';
    final email = member.user?.email ?? member.email ?? '';
    final phone = member.user?.phone ?? '';
    final joinedAt = member.acceptedAt ?? member.createdAt;
    final joinedDate = joinedAt.split('T').first;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.primary.withValues(alpha: 0.15),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.shield_outlined,
                              color: AppColors.primary, size: 10),
                          const SizedBox(width: 3),
                          Text(member.role,
                              style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 10)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(email,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('Vào $joinedDate',
                        style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary)),
                    if (member.inviteStatus != 'ACTIVE') ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(member.inviteStatus,
                            style: const TextStyle(
                                color: AppColors.warning,
                                fontSize: 10,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (phone.isNotEmpty)
            Material(
              color: AppColors.success.withValues(alpha: 0.12),
              shape: const CircleBorder(),
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () {},
                child: const SizedBox(
                  height: 36,
                  width: 36,
                  child: Icon(Icons.phone,
                      color: AppColors.success, size: 16),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
