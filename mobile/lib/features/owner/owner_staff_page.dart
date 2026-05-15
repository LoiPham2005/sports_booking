import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/mock/mock_data.dart';
import '../../shared/routing/route_paths.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/utils/format.dart';

class OwnerStaffPage extends StatefulWidget {
  const OwnerStaffPage({super.key});

  @override
  State<OwnerStaffPage> createState() => _OwnerStaffPageState();
}

class _OwnerStaffPageState extends State<OwnerStaffPage> {
  String _filter = 'all'; // all | active | pending | suspended
  String _venueFilter = 'all';
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<OwnerStaff> get _items {
    final q = _search.text.trim().toLowerCase();
    return MockData.ownerStaffList.where((s) {
      if (_filter == 'active' && s.status != StaffStatus.active) return false;
      if (_filter == 'pending' && s.status != StaffStatus.pending) return false;
      if (_filter == 'suspended' && s.status != StaffStatus.suspended) {
        return false;
      }
      if (_venueFilter != 'all' && s.venueId != _venueFilter) return false;
      if (q.isNotEmpty &&
          !s.name.toLowerCase().contains(q) &&
          !s.email.toLowerCase().contains(q) &&
          !s.phone.contains(q)) {
        return false;
      }
      return true;
    }).toList();
  }

  int _countBy(StaffStatus s) =>
      MockData.ownerStaffList.where((x) => x.status == s).length;

  @override
  Widget build(BuildContext context) {
    final list = _items;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Nhân viên'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(RoutePaths.ownerStaffInvite),
        icon: const Icon(Icons.person_add_alt_1),
        label: const Text('Mời'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Stats strip
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: 'Tổng',
                    value: '${MockData.ownerStaffList.length}',
                    color: AppColors.primary,
                    icon: Icons.groups,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatCard(
                    label: 'Đang trực',
                    value: '${_countBy(StaffStatus.active)}',
                    color: AppColors.success,
                    icon: Icons.check_circle_outline,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatCard(
                    label: 'Chờ duyệt',
                    value: '${_countBy(StaffStatus.pending)}',
                    color: AppColors.warning,
                    icon: Icons.hourglass_empty,
                  ),
                ),
              ],
            ),
          ),

          // Search box
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: TextField(
              controller: _search,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Tìm tên, email, số điện thoại...',
                prefixIcon: Icon(Icons.search, size: 20),
                isDense: true,
              ),
            ),
          ),

          // Filter chips
          SizedBox(
            height: 40,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(
                  label: 'Tất cả',
                  active: _filter == 'all',
                  onTap: () => setState(() => _filter = 'all'),
                ),
                const SizedBox(width: 6),
                _FilterChip(
                  label: 'Đang trực',
                  active: _filter == 'active',
                  onTap: () => setState(() => _filter = 'active'),
                ),
                const SizedBox(width: 6),
                _FilterChip(
                  label: 'Chờ duyệt',
                  active: _filter == 'pending',
                  onTap: () => setState(() => _filter = 'pending'),
                ),
                const SizedBox(width: 6),
                _FilterChip(
                  label: 'Tạm khoá',
                  active: _filter == 'suspended',
                  onTap: () => setState(() => _filter = 'suspended'),
                ),
                const SizedBox(width: 12),
                _VenueFilterChip(
                  value: _venueFilter,
                  onChanged: (v) => setState(() => _venueFilter = v),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),
          const Divider(height: 1),

          // List
          Expanded(
            child: list.isEmpty
                ? const _Empty()
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) => _StaffCard(
                      staff: list[i],
                      onTap: () => _openActions(list[i]),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _openActions(OwnerStaff staff) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 4,
                width: 40,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                child: Text(
                  staff.name[0],
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                    fontSize: 22,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(staff.name,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              Text(staff.email,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 20),

              if (staff.status == StaffStatus.pending) ...[
                _SheetAction(
                  icon: Icons.check_circle_outline,
                  color: AppColors.success,
                  title: 'Duyệt nhân viên',
                  onTap: () {
                    Navigator.pop(context);
                    _snack('Đã duyệt ${staff.name}');
                  },
                ),
                _SheetAction(
                  icon: Icons.close,
                  color: AppColors.danger,
                  title: 'Từ chối',
                  onTap: () {
                    Navigator.pop(context);
                    _snack('Đã từ chối ${staff.name}');
                  },
                ),
              ] else ...[
                _SheetAction(
                  icon: Icons.phone_outlined,
                  color: AppColors.success,
                  title: 'Gọi điện',
                  subtitle: staff.phone,
                  onTap: () => Navigator.pop(context),
                ),
                _SheetAction(
                  icon: Icons.swap_horiz,
                  color: AppColors.info,
                  title: 'Đổi sân được giao',
                  subtitle: staff.venueName,
                  onTap: () {
                    Navigator.pop(context);
                    _showChangeVenue(staff);
                  },
                ),
                _SheetAction(
                  icon: Icons.shield_outlined,
                  color: AppColors.accent,
                  title: 'Đổi vai trò',
                  subtitle: staff.role == StaffRole.manager ? 'MANAGER' : 'STAFF',
                  onTap: () {
                    Navigator.pop(context);
                    _showChangeRole(staff);
                  },
                ),
                _SheetAction(
                  icon: staff.status == StaffStatus.active
                      ? Icons.pause_circle_outline
                      : Icons.play_circle_outline,
                  color: AppColors.warning,
                  title: staff.status == StaffStatus.active
                      ? 'Tạm khoá'
                      : 'Kích hoạt lại',
                  onTap: () {
                    Navigator.pop(context);
                    _snack(staff.status == StaffStatus.active
                        ? 'Đã tạm khoá ${staff.name}'
                        : 'Đã kích hoạt ${staff.name}');
                  },
                ),
                _SheetAction(
                  icon: Icons.delete_outline,
                  color: AppColors.danger,
                  title: 'Xoá khỏi venue',
                  onTap: () {
                    Navigator.pop(context);
                    _confirmRemove(staff);
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showChangeRole(OwnerStaff staff) {
    showDialog(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Đổi vai trò'),
        children: [
          for (final r in StaffRole.values)
            SimpleDialogOption(
              onPressed: () {
                Navigator.pop(context);
                _snack('Đã đổi vai trò ${staff.name} thành ${r.name.toUpperCase()}');
              },
              child: Row(
                children: [
                  Icon(
                    r == StaffRole.manager
                        ? Icons.workspace_premium
                        : Icons.shield_outlined,
                    color: r == StaffRole.manager
                        ? AppColors.accent
                        : AppColors.primary,
                  ),
                  const SizedBox(width: 12),
                  Text(r.name.toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  const Spacer(),
                  if (r == staff.role)
                    const Icon(Icons.check, color: AppColors.success),
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _showChangeVenue(OwnerStaff staff) {
    showDialog(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Chuyển sân'),
        children: [
          for (final v in MockData.ownerVenues)
            SimpleDialogOption(
              onPressed: () {
                Navigator.pop(context);
                _snack('Đã chuyển ${staff.name} sang ${v.name}');
              },
              child: Row(
                children: [
                  const Icon(Icons.stadium_outlined,
                      color: AppColors.primary, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(v.name,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
                  if (v.id == staff.venueId)
                    const Icon(Icons.check, color: AppColors.success),
                ],
              ),
            ),
        ],
      ),
    );
  }

  void _confirmRemove(OwnerStaff staff) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        icon: const Icon(Icons.warning_amber_rounded,
            size: 40, color: AppColors.danger),
        title: const Text('Xoá nhân viên?'),
        content: Text(
          '${staff.name} sẽ bị xoá khỏi venue. Họ sẽ mất quyền truy cập ngay lập tức.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Huỷ'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              _snack('Đã xoá ${staff.name}');
            },
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Xoá'),
          ),
        ],
      ),
    );
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }
}

// ────────────────────── Sub-widgets ──────────────────────

class _StatCard extends StatelessWidget {
  final String label, value;
  final Color color;
  final IconData icon;
  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 6),
          Text(value,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          Text(label,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            color: active ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

class _VenueFilterChip extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;
  const _VenueFilterChip({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (_) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                height: 4,
                width: 40,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Lọc theo venue',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                ),
              ),
              ListTile(
                title: const Text('Tất cả venue'),
                trailing: value == 'all'
                    ? const Icon(Icons.check, color: AppColors.primary)
                    : null,
                onTap: () {
                  onChanged('all');
                  Navigator.pop(context);
                },
              ),
              for (final v in MockData.ownerVenues)
                ListTile(
                  leading: const Icon(Icons.stadium_outlined,
                      color: AppColors.primary),
                  title: Text(v.name),
                  trailing: value == v.id
                      ? const Icon(Icons.check, color: AppColors.primary)
                      : null,
                  onTap: () {
                    onChanged(v.id);
                    Navigator.pop(context);
                  },
                ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.filter_list,
                size: 14, color: AppColors.textSecondary),
            const SizedBox(width: 4),
            Text(
              value == 'all'
                  ? 'Mọi venue'
                  : MockData.ownerVenues
                      .firstWhere((v) => v.id == value,
                          orElse: () => MockData.ownerVenues.first)
                      .name,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down,
                size: 14, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}

class _StaffCard extends StatelessWidget {
  final OwnerStaff staff;
  final VoidCallback onTap;
  const _StaffCard({required this.staff, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                  child: Text(
                    staff.name[0],
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        staff.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                      Text(staff.email,
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
                _RoleBadge(role: staff.role),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.stadium_outlined,
                    size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    staff.venueName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12),
                  ),
                ),
                const SizedBox(width: 6),
                _StatusBadge(status: staff.status),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _StatChip(
                  icon: Icons.event_available_outlined,
                  label: '${staff.bookingsHandled} bookings',
                ),
                const SizedBox(width: 8),
                _StatChip(
                  icon: Icons.calendar_today_outlined,
                  label: 'Từ ${formatDateShort(staff.joinedAt)}',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final StaffRole role;
  const _RoleBadge({required this.role});
  @override
  Widget build(BuildContext context) {
    final isManager = role == StaffRole.manager;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: (isManager ? AppColors.accent : AppColors.primary)
            .withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isManager ? Icons.workspace_premium : Icons.shield_outlined,
            size: 10,
            color: isManager ? AppColors.accent : AppColors.primary,
          ),
          const SizedBox(width: 3),
          Text(
            isManager ? 'MANAGER' : 'STAFF',
            style: TextStyle(
              color: isManager ? AppColors.accent : AppColors.primary,
              fontWeight: FontWeight.w800,
              fontSize: 10,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final StaffStatus status;
  const _StatusBadge({required this.status});

  (String, Color, Color) _info() {
    switch (status) {
      case StaffStatus.active:
        return ('Đang trực', AppColors.success, const Color(0xFFECFDF5));
      case StaffStatus.pending:
        return ('Chờ duyệt', AppColors.warning, const Color(0xFFFFFBEB));
      case StaffStatus.suspended:
        return ('Tạm khoá', AppColors.danger, const Color(0xFFFEF2F2));
    }
  }

  @override
  Widget build(BuildContext context) {
    final (label, fg, bg) = _info();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(label,
          style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 10)),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _StatChip({required this.icon, required this.label});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _SheetAction extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  const _SheetAction({
    required this.icon,
    required this.color,
    required this.title,
    required this.onTap,
    this.subtitle,
  });
  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        height: 40,
        width: 40,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
      subtitle: subtitle == null ? null : Text(subtitle!),
      trailing: const Icon(Icons.arrow_forward_ios,
          size: 14, color: AppColors.textMuted),
      onTap: onTap,
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.groups_outlined,
              size: 64, color: AppColors.textMuted),
          const SizedBox(height: 12),
          const Text('Chưa có nhân viên nào',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 4),
          const Text('Bấm "Mời" để thêm nhân viên đầu tiên',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }
}
