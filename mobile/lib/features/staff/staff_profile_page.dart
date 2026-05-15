import 'package:flutter/material.dart';

import '../../shared/mock/demo_state.dart';
import '../../shared/mock/mock_data.dart';
import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class StaffProfilePage extends StatefulWidget {
  const StaffProfilePage({super.key});

  @override
  State<StaffProfilePage> createState() => _StaffProfilePageState();
}

class _StaffProfilePageState extends State<StaffProfilePage> {
  late final TextEditingController _name;
  late final TextEditingController _email;
  late final TextEditingController _phone;
  late final TextEditingController _dob;
  String _gender = 'male';
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    final isManager = DemoState.instance.isManager;
    _name = TextEditingController(
        text: isManager ? 'Manager Demo' : 'Nguyễn Văn Staff');
    _email = TextEditingController(
        text: isManager
            ? 'manager@sportsbooking.local'
            : 'staff@sportsbooking.local');
    _phone = TextEditingController(text: '+84 901 234 567');
    _dob = TextEditingController(text: '15/03/1995');
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _dob.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isManager = DemoState.instance.isManager;
    final roleColor =
        isManager ? const Color(0xFF8B5CF6) : AppColors.accent;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Hồ sơ'),
        actions: [
          TextButton(
            onPressed: () {
              if (_editing) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đã lưu thay đổi')),
                );
              }
              setState(() => _editing = !_editing);
            },
            child: Text(_editing ? 'Lưu' : 'Sửa',
                style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar + role
          Center(
            child: Column(
              children: [
                Stack(
                  children: [
                    Container(
                      height: 96,
                      width: 96,
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
                          fontSize: 38,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    if (_editing)
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          height: 30,
                          width: 30,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt,
                              color: Colors.white, size: 14),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: roleColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isManager
                            ? Icons.workspace_premium
                            : Icons.shield_outlined,
                        color: roleColor,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isManager ? 'MANAGER' : 'STAFF',
                        style: TextStyle(
                          color: roleColor,
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

          const SizedBox(height: 24),
          const _SectionTitle('THÔNG TIN CÔNG VIỆC'),
          _ReadOnlyTile(
            icon: Icons.stadium_outlined,
            color: AppColors.primary,
            label: 'Venue đang trực',
            value: MockData.staffVenue.name,
          ),
          _ReadOnlyTile(
            icon: Icons.badge_outlined,
            color: AppColors.info,
            label: 'Mã nhân viên',
            value: isManager ? 'MGR-001' : 'STF-024',
          ),
          _ReadOnlyTile(
            icon: Icons.calendar_today_outlined,
            color: AppColors.textSecondary,
            label: 'Ngày vào làm',
            value: isManager ? '15/01/2024' : '03/09/2024',
          ),

          const SizedBox(height: 16),
          const _SectionTitle('THÔNG TIN CÁ NHÂN'),
          _Field(
            label: 'Họ và tên',
            controller: _name,
            enabled: _editing,
            icon: Icons.person_outline,
          ),
          _Field(
            label: 'Email',
            controller: _email,
            enabled: _editing,
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
          ),
          _Field(
            label: 'Số điện thoại',
            controller: _phone,
            enabled: _editing,
            icon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
          ),
          _Field(
            label: 'Ngày sinh',
            controller: _dob,
            enabled: _editing,
            icon: Icons.cake_outlined,
            readOnly: true,
            onTap: _editing ? () => _pickDob(context) : null,
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Giới tính',
                    style: TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _GenderChip(
                        label: 'Nam',
                        selected: _gender == 'male',
                        enabled: _editing,
                        onTap: () => setState(() => _gender = 'male'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _GenderChip(
                        label: 'Nữ',
                        selected: _gender == 'female',
                        enabled: _editing,
                        onTap: () => setState(() => _gender = 'female'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _GenderChip(
                        label: 'Khác',
                        selected: _gender == 'other',
                        enabled: _editing,
                        onTap: () => setState(() => _gender = 'other'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Future<void> _pickDob(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1995, 3, 15),
      firstDate: DateTime(1950),
      lastDate: now,
    );
    if (picked != null) {
      setState(() {
        _dob.text =
            '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
      });
    }
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  // ignore: use_super_parameters
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 10),
        child: Text(
          text,
          style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w800),
        ),
      );
}

class _ReadOnlyTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String value;
  const _ReadOnlyTile({
    required this.icon,
    required this.color,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            height: 32,
            width: 32,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(label,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 11)),
                Text(value,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13)),
              ],
            ),
          ),
          const Icon(Icons.lock_outline,
              size: 14, color: AppColors.textMuted),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool enabled;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool readOnly;
  final VoidCallback? onTap;
  const _Field({
    required this.label,
    required this.controller,
    required this.enabled,
    required this.icon,
    this.keyboardType,
    this.readOnly = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 6),
            child: Text(label,
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w700)),
          ),
          TextField(
            controller: controller,
            enabled: enabled,
            readOnly: readOnly || !enabled,
            keyboardType: keyboardType,
            onTap: onTap,
            decoration: InputDecoration(
              prefixIcon: Icon(icon, size: 18),
              isDense: true,
              filled: !enabled,
              fillColor: AppColors.surface,
            ),
          ),
        ],
      ),
    );
  }
}

class _GenderChip extends StatelessWidget {
  final String label;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;
  const _GenderChip({
    required this.label,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surface,
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(10),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: selected ? AppColors.primary : AppColors.textSecondary,
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}
