import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class StaffTeamPage extends StatelessWidget {
  const StaffTeamPage({super.key});

  static const _team = [
    (
      'Lê Thị Mai',
      'mai@example.com',
      '+84 909 876 543',
      'STAFF',
      '2025-01-04',
      215,
    ),
    (
      'Phạm Hoàng Long',
      'long@example.com',
      '+84 908 333 444',
      'STAFF',
      '2026-05-10',
      12,
    ),
  ];

  @override
  Widget build(BuildContext context) {
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
          const Text('Đội ngũ tại Sân bóng đá Phú Mỹ Hưng',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),

          const SizedBox(height: 20),

          // "Bạn" highlight card
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
                  child: const Text('M',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text('Bạn (Manager)',
                              style: TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 15)),
                          SizedBox(width: 6),
                          Icon(Icons.verified,
                              color: Color(0xFF7C3AED), size: 14),
                        ],
                      ),
                      Text('manager@sportsbooking.local',
                          style: TextStyle(
                              color: AppColors.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('421',
                        style: TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 16)),
                    Text('bookings',
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 10)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Text(
            'CÁC NHÂN VIÊN KHÁC (${_team.length})',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),

          ..._team.map((s) => Container(
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
                      backgroundColor:
                          AppColors.primary.withValues(alpha: 0.15),
                      child: Text(s.$1[0],
                          style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                              fontSize: 16)),
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
                                  s.$1,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w800, fontSize: 14),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary
                                      .withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.shield_outlined,
                                        color: AppColors.primary, size: 10),
                                    const SizedBox(width: 3),
                                    Text(s.$4,
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
                          Text(s.$2,
                              style: const TextStyle(
                                  color: AppColors.textMuted, fontSize: 12)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.event_available_outlined,
                                  size: 12, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text('${s.$6} bookings',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textSecondary)),
                              const SizedBox(width: 8),
                              const Icon(Icons.calendar_today_outlined,
                                  size: 12, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text('Vào ${s.$5}',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),
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
              )),

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
