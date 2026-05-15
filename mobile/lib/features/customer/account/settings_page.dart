import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme/app_colors.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  String _locale = 'vi';
  String _theme = 'system';
  bool _bookingReminders = true;
  bool _promoNotifications = false;
  bool _emailReceipts = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Cài đặt'),
      ),
      body: ListView(
        children: [
          _SectionHeader(title: 'Giao diện'),
          _SettingRow(
            icon: Icons.language,
            iconColor: AppColors.info,
            title: 'Ngôn ngữ',
            trailingText: _locale == 'vi' ? 'Tiếng Việt' : 'English',
            onTap: _showLocaleSheet,
          ),
          _SettingRow(
            icon: Icons.dark_mode_outlined,
            iconColor: const Color(0xFF6366F1),
            title: 'Chế độ giao diện',
            trailingText: _themeLabel(),
            onTap: _showThemeSheet,
          ),

          _SectionHeader(title: 'Thông báo'),
          _ToggleRow(
            icon: Icons.alarm,
            iconColor: AppColors.success,
            title: 'Nhắc lịch chơi',
            subtitle: 'Thông báo trước 2 giờ',
            value: _bookingReminders,
            onChanged: (v) => setState(() => _bookingReminders = v),
          ),
          _ToggleRow(
            icon: Icons.local_offer_outlined,
            iconColor: AppColors.accent,
            title: 'Khuyến mãi & ưu đãi',
            value: _promoNotifications,
            onChanged: (v) => setState(() => _promoNotifications = v),
          ),
          _ToggleRow(
            icon: Icons.mail_outline,
            iconColor: AppColors.vnpay,
            title: 'Email hoá đơn',
            subtitle: 'Gửi PDF sau mỗi giao dịch',
            value: _emailReceipts,
            onChanged: (v) => setState(() => _emailReceipts = v),
          ),

          _SectionHeader(title: 'Bảo mật'),
          _SettingRow(
            icon: Icons.lock_outline,
            iconColor: AppColors.warning,
            title: 'Đổi mật khẩu',
            onTap: () {},
          ),
          _SettingRow(
            icon: Icons.security_outlined,
            iconColor: AppColors.success,
            title: 'Xác thực 2 lớp',
            trailingText: 'Tắt',
            onTap: () {},
          ),
          _SettingRow(
            icon: Icons.devices,
            iconColor: AppColors.textSecondary,
            title: 'Thiết bị đăng nhập',
            trailingText: '3',
            onTap: () {},
          ),

          _SectionHeader(title: 'Khác'),
          _SettingRow(
            icon: Icons.privacy_tip_outlined,
            iconColor: AppColors.textSecondary,
            title: 'Chính sách bảo mật',
            onTap: () {},
          ),
          _SettingRow(
            icon: Icons.description_outlined,
            iconColor: AppColors.textSecondary,
            title: 'Điều khoản sử dụng',
            onTap: () {},
          ),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                foregroundColor: AppColors.danger,
                minimumSize: const Size.fromHeight(48),
              ),
              child: const Text('Xoá tài khoản'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  String _themeLabel() {
    return switch (_theme) {
      'light' => 'Sáng',
      'dark' => 'Tối',
      _ => 'Theo hệ thống',
    };
  }

  void _showLocaleSheet() {
    showModalBottomSheet(
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
            ListTile(
              title: const Text('🇻🇳 Tiếng Việt'),
              trailing: _locale == 'vi'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                setState(() => _locale = 'vi');
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('🇺🇸 English'),
              trailing: _locale == 'en'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                setState(() => _locale = 'en');
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showThemeSheet() {
    showModalBottomSheet(
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
            for (final opt in [
              ('system', 'Theo hệ thống', Icons.brightness_auto_outlined),
              ('light', 'Sáng', Icons.light_mode_outlined),
              ('dark', 'Tối', Icons.dark_mode_outlined),
            ])
              ListTile(
                leading: Icon(opt.$3),
                title: Text(opt.$2),
                trailing: _theme == opt.$1
                    ? const Icon(Icons.check, color: AppColors.primary)
                    : null,
                onTap: () {
                  setState(() => _theme = opt.$1);
                  Navigator.pop(context);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 6),
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

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? trailingText;
  final VoidCallback onTap;
  const _SettingRow({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.onTap,
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
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: iconColor),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600))),
            if (trailingText != null)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(trailingText!,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
              ),
            const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _ToggleRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _ToggleRow({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.value,
    required this.onChanged,
    this.subtitle,
  });
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        children: [
          Container(
            height: 36,
            width: 36,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                if (subtitle != null)
                  Text(subtitle!,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.primary,
          ),
        ],
      ),
    );
  }
}
