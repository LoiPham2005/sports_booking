import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class OwnerSettingsPage extends StatefulWidget {
  const OwnerSettingsPage({super.key});

  @override
  State<OwnerSettingsPage> createState() => _OwnerSettingsPageState();
}

class _OwnerSettingsPageState extends State<OwnerSettingsPage> {
  // Notifications
  bool _notifyNewBooking = true;
  bool _notifyPayment = true;
  bool _notifyCancel = true;
  bool _notifyReview = true;
  bool _notifyLowOccupancy = false;
  bool _emailDailyReport = true;

  // Business
  String _cancelPolicy = '24h';
  int _autoConfirmMinutes = 10;
  bool _allowGuestBooking = true;

  // Appearance
  String _locale = 'vi';
  String _theme = 'system';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Cài đặt'),
      ),
      body: ListView(
        children: [
          // Owner profile glance
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.accent.withValues(alpha: 0.06),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.store, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Tài khoản chủ sân',
                            style: TextStyle(
                                fontWeight: FontWeight.w800, fontSize: 14)),
                        Text('owner@sportsbooking.local · 2 venue',
                            style: TextStyle(
                                color: AppColors.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // THÔNG BÁO
          const _SectionHeader(title: 'Thông báo kinh doanh'),
          _ToggleRow(
            icon: Icons.event_available,
            iconColor: AppColors.primary,
            title: 'Booking mới',
            subtitle: 'Push ngay khi có khách đặt sân',
            value: _notifyNewBooking,
            onChanged: (v) => setState(() => _notifyNewBooking = v),
          ),
          _ToggleRow(
            icon: Icons.payments_outlined,
            iconColor: AppColors.success,
            title: 'Thanh toán thành công',
            value: _notifyPayment,
            onChanged: (v) => setState(() => _notifyPayment = v),
          ),
          _ToggleRow(
            icon: Icons.cancel_outlined,
            iconColor: AppColors.danger,
            title: 'Khách huỷ booking',
            value: _notifyCancel,
            onChanged: (v) => setState(() => _notifyCancel = v),
          ),
          _ToggleRow(
            icon: Icons.star_outline,
            iconColor: AppColors.warning,
            title: 'Đánh giá mới',
            subtitle: 'Khi khách viết review sân của bạn',
            value: _notifyReview,
            onChanged: (v) => setState(() => _notifyReview = v),
          ),
          _ToggleRow(
            icon: Icons.trending_down,
            iconColor: AppColors.info,
            title: 'Cảnh báo tỷ lệ lấp thấp',
            subtitle: 'Khi occupancy < 30% trong 3 ngày liên tiếp',
            value: _notifyLowOccupancy,
            onChanged: (v) => setState(() => _notifyLowOccupancy = v),
          ),
          _ToggleRow(
            icon: Icons.mail_outline,
            iconColor: AppColors.vnpay,
            title: 'Email báo cáo hàng ngày',
            subtitle: 'Gửi 8h sáng mỗi ngày',
            value: _emailDailyReport,
            onChanged: (v) => setState(() => _emailDailyReport = v),
          ),

          // KINH DOANH
          const _SectionHeader(title: 'Vận hành'),
          _SettingRow(
            icon: Icons.policy_outlined,
            iconColor: AppColors.warning,
            title: 'Chính sách huỷ mặc định',
            trailingText: _cancelPolicyLabel(),
            onTap: _showCancelPolicySheet,
          ),
          _SettingRow(
            icon: Icons.hourglass_top,
            iconColor: AppColors.info,
            title: 'Hết hạn giữ chỗ',
            subtitle: 'Tự huỷ nếu khách không thanh toán trong $_autoConfirmMinutes phút',
            trailingText: '$_autoConfirmMinutes\'',
            onTap: _showHoldDurationSheet,
          ),
          _ToggleRow(
            icon: Icons.person_off_outlined,
            iconColor: AppColors.textSecondary,
            title: 'Cho phép khách lạ đặt sân',
            subtitle: 'Không yêu cầu xác thực số ĐT',
            value: _allowGuestBooking,
            onChanged: (v) => setState(() => _allowGuestBooking = v),
          ),
          _SettingRow(
            icon: Icons.account_balance_outlined,
            iconColor: AppColors.success,
            title: 'Tài khoản nhận tiền',
            trailingText: 'Vietcombank',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mở từ tab Tài khoản → Tài khoản nhận tiền')),
              );
            },
          ),
          _SettingRow(
            icon: Icons.percent,
            iconColor: AppColors.primary,
            title: 'Phí dịch vụ',
            subtitle: 'Sàn thu trên mỗi giao dịch',
            trailingText: '8%',
            onTap: () => _showInfo(context,
                title: 'Phí dịch vụ 8%',
                body:
                    'Sàn thu 8% trên tổng giá trị mỗi giao dịch online thành công (đã trừ refund). Tiền vào ví bạn sau 24h. Hỗ trợ payout 1-2 lần/tuần qua Vietcombank/Techcombank/MB Bank.'),
          ),

          // BẢO MẬT
          const _SectionHeader(title: 'Bảo mật'),
          _SettingRow(
            icon: Icons.lock_outline,
            iconColor: AppColors.warning,
            title: 'Đổi mật khẩu',
            onTap: () => _showInfo(context,
                title: 'Đổi mật khẩu',
                body: 'Form đổi mật khẩu chưa hoàn thiện ở portal Owner — đang dùng demo của Staff. Sẽ làm sau.'),
          ),
          _SettingRow(
            icon: Icons.security_outlined,
            iconColor: AppColors.success,
            title: 'Xác thực 2 lớp',
            trailingText: 'Tắt',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Demo — chưa cài 2FA')),
              );
            },
          ),
          _SettingRow(
            icon: Icons.devices,
            iconColor: AppColors.textSecondary,
            title: 'Thiết bị đăng nhập',
            trailingText: '2',
            onTap: _showDevicesSheet,
          ),
          _SettingRow(
            icon: Icons.history,
            iconColor: AppColors.info,
            title: 'Lịch sử hoạt động',
            subtitle: '30 ngày gần nhất',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Demo — chưa có trang audit log')),
              );
            },
          ),

          // GIAO DIỆN
          const _SectionHeader(title: 'Giao diện'),
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

          // KHÁC
          const _SectionHeader(title: 'Khác'),
          _SettingRow(
            icon: Icons.privacy_tip_outlined,
            iconColor: AppColors.textSecondary,
            title: 'Chính sách bảo mật',
            onTap: () {},
          ),
          _SettingRow(
            icon: Icons.description_outlined,
            iconColor: AppColors.textSecondary,
            title: 'Điều khoản chủ sân',
            onTap: () {},
          ),
          _SettingRow(
            icon: Icons.share_outlined,
            iconColor: AppColors.accent,
            title: 'Giới thiệu bạn bè làm chủ sân',
            subtitle: 'Nhận 200k mỗi referral được duyệt',
            onTap: () {},
          ),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextButton(
              onPressed: _confirmDeleteAccount,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.danger,
                minimumSize: const Size.fromHeight(48),
              ),
              child: const Text('Yêu cầu đóng tài khoản chủ sân'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  String _themeLabel() => switch (_theme) {
        'light' => 'Sáng',
        'dark' => 'Tối',
        _ => 'Theo hệ thống',
      };

  String _cancelPolicyLabel() => switch (_cancelPolicy) {
        '0h' => 'Không hoàn tiền',
        '2h' => 'Trước 2h: 50%',
        '24h' => 'Trước 24h: 100%',
        '48h' => 'Trước 48h: 100%',
        _ => _cancelPolicy,
      };

  void _showLocaleSheet() {
    _showSheet(children: [
      for (final opt in const [
        ('vi', '🇻🇳 Tiếng Việt'),
        ('en', '🇺🇸 English'),
      ])
        ListTile(
          title: Text(opt.$2),
          trailing: _locale == opt.$1
              ? const Icon(Icons.check, color: AppColors.primary)
              : null,
          onTap: () {
            setState(() => _locale = opt.$1);
            Navigator.pop(context);
          },
        ),
    ]);
  }

  void _showThemeSheet() {
    _showSheet(children: [
      for (final opt in const [
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
    ]);
  }

  void _showCancelPolicySheet() {
    _showSheet(children: [
      for (final opt in const [
        ('0h', 'Không hoàn tiền', 'Khách huỷ bất kỳ lúc nào đều mất tiền'),
        ('2h', 'Trước 2h: hoàn 50%', 'Trước giờ chơi 2h được hoàn 50%'),
        ('24h', 'Trước 24h: hoàn 100%', 'Phổ biến nhất — cân bằng cho cả 2 bên'),
        ('48h', 'Trước 48h: hoàn 100%', 'Khắt khe — phù hợp sân hot cuối tuần'),
      ])
        ListTile(
          title: Text(opt.$2),
          subtitle: Text(opt.$3),
          trailing: _cancelPolicy == opt.$1
              ? const Icon(Icons.check, color: AppColors.primary)
              : null,
          onTap: () {
            setState(() => _cancelPolicy = opt.$1);
            Navigator.pop(context);
          },
        ),
    ]);
  }

  void _showHoldDurationSheet() {
    _showSheet(children: [
      for (final m in const [5, 10, 15, 30])
        ListTile(
          title: Text('$m phút'),
          trailing: _autoConfirmMinutes == m
              ? const Icon(Icons.check, color: AppColors.primary)
              : null,
          onTap: () {
            setState(() => _autoConfirmMinutes = m);
            Navigator.pop(context);
          },
        ),
    ]);
  }

  void _showDevicesSheet() {
    _showSheet(children: const [
      ListTile(
        leading: Icon(Icons.phone_iphone, color: AppColors.primary),
        title: Text('iPhone 15 Pro · TP.HCM'),
        subtitle: Text('Đang hoạt động · 2 phút trước'),
      ),
      ListTile(
        leading: Icon(Icons.laptop_mac, color: AppColors.textSecondary),
        title: Text('Macbook Air · TP.HCM'),
        subtitle: Text('Hoạt động 3 giờ trước'),
        trailing: Icon(Icons.logout, color: AppColors.danger, size: 18),
      ),
    ]);
  }

  void _showSheet({required List<Widget> children}) {
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
            const SizedBox(height: 8),
            ...children,
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showInfo(BuildContext context,
      {required String title, required String body}) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(body, style: const TextStyle(height: 1.5)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDeleteAccount() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        icon: const Icon(Icons.warning_amber_outlined,
            color: AppColors.danger, size: 32),
        title: const Text('Đóng tài khoản chủ sân?'),
        content: const Text(
          'Bạn sẽ mất quyền quản lý 2 venue. Nhân viên sẽ bị mất quyền truy cập. '
          'Booking đang có sẽ phải hoàn tiền theo chính sách. '
          'Số dư trong ví sẽ được payout về tài khoản ngân hàng đã đăng ký trong 7-14 ngày.',
          style: TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Để sau'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Gửi yêu cầu'),
          ),
        ],
      ),
    );
    if (ok == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã gửi yêu cầu — Admin sàn sẽ liên hệ trong 24h'),
        ),
      );
    }
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
  final String? subtitle;
  final String? trailingText;
  final VoidCallback onTap;
  const _SettingRow({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.onTap,
    this.subtitle,
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
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  if (subtitle != null)
                    Text(subtitle!,
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
            if (trailingText != null)
              Padding(
                padding: const EdgeInsets.only(right: 6, left: 8),
                child: Text(trailingText!,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 13)),
              ),
            const Icon(Icons.arrow_forward_ios,
                size: 14, color: AppColors.textMuted),
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
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                if (subtitle != null)
                  Text(subtitle!,
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 12)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.primary,
          ),
        ],
      ),
    );
  }
}
