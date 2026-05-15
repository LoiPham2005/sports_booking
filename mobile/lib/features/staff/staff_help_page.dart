import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class StaffHelpPage extends StatefulWidget {
  const StaffHelpPage({super.key});

  @override
  State<StaffHelpPage> createState() => _StaffHelpPageState();
}

class _Faq {
  final String q;
  final String a;
  const _Faq(this.q, this.a);
}

class _StaffHelpPageState extends State<StaffHelpPage> {
  String _query = '';

  static const _faqs = [
    _Faq(
      'Làm sao để check-in cho khách?',
      'Vào tab Hôm nay hoặc nhấn nút "Quét QR check-in" ở tab Tài khoản. Quét mã QR mà khách hiển thị trong app. Hệ thống sẽ tự xác nhận booking, không cần nhập tay.',
    ),
    _Faq(
      'Khách đến mà không đặt trước thì làm thế nào?',
      'Hiện tại app dành cho Staff chưa hỗ trợ walk-in trực tiếp. Hãy nhờ Owner tạo booking walk-in từ portal Owner, hoặc hướng dẫn khách tự đặt qua app.',
    ),
    _Faq(
      'Tôi muốn nghỉ ca/đổi ca với bạn cùng venue',
      'Liên hệ trực tiếp với Owner. Mọi thay đổi ca trực do Owner cập nhật. Staff không tự đổi được trong app.',
    ),
    _Faq(
      'Tôi không thấy tab "Doanh thu" như đồng nghiệp',
      'Tab Doanh thu chỉ hiện với vai trò Manager. Nếu bạn cần xem doanh thu, đề nghị Owner nâng quyền của bạn lên Manager.',
    ),
    _Faq(
      'Khách than phiền sân lỗi/đèn hỏng',
      'Vào "Báo cáo ca trực" → "Thêm sự cố" để ghi lại. Owner sẽ thấy ngay sau khi bạn chốt ca. Trường hợp khẩn cấp (chấn thương, cháy nổ), gọi 115/114 trước.',
    ),
    _Faq(
      'Tôi quên mật khẩu',
      'Tại màn hình Đăng nhập, nhấn "Quên mật khẩu" và làm theo hướng dẫn gửi tới email công ty. Nếu vẫn không nhận được mail sau 5 phút, liên hệ Owner để được reset.',
    ),
  ];

  List<_Faq> get _filtered {
    if (_query.trim().isEmpty) return _faqs;
    final q = _query.toLowerCase();
    return _faqs
        .where((f) =>
            f.q.toLowerCase().contains(q) || f.a.toLowerCase().contains(q))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => safePop(context),
        ),
        title: const Text('Trợ giúp'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Search
          TextField(
            onChanged: (v) => setState(() => _query = v),
            decoration: InputDecoration(
              hintText: 'Tìm câu trả lời...',
              prefixIcon: const Icon(Icons.search, size: 20),
              isDense: true,
              suffixIcon: _query.isEmpty
                  ? null
                  : IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: () => setState(() => _query = ''),
                    ),
            ),
          ),
          const SizedBox(height: 20),

          // Contact bar
          const _SectionTitle('LIÊN HỆ NHANH'),
          Row(
            children: [
              Expanded(
                child: _ContactCard(
                  icon: Icons.call_outlined,
                  color: AppColors.primary,
                  title: 'Gọi Owner',
                  subtitle: '+84 901 234 567',
                  onTap: () => _toast(context, 'Đang gọi Owner...'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ContactCard(
                  icon: Icons.chat_bubble_outline,
                  color: AppColors.info,
                  title: 'Chat hỗ trợ',
                  subtitle: 'Trực 8-22h',
                  onTap: () => _toast(context, 'Demo — chưa mở chat'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _ContactCard(
            icon: Icons.warning_amber_outlined,
            color: AppColors.danger,
            title: 'Khẩn cấp (cháy/chấn thương)',
            subtitle: '115 · 114 · báo Owner ngay',
            wide: true,
            onTap: () => _toast(context, 'Vui lòng gọi 115 hoặc 114'),
          ),

          const SizedBox(height: 20),
          const _SectionTitle('CÂU HỎI THƯỜNG GẶP'),
          if (_filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  const Icon(Icons.search_off,
                      size: 36, color: AppColors.textMuted),
                  const SizedBox(height: 6),
                  Text('Không tìm thấy "$_query"',
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 13)),
                ],
              ),
            )
          else
            ..._filtered.map((f) => _FaqTile(faq: f)),

          const SizedBox(height: 20),
          const _SectionTitle('VỀ ỨNG DỤNG'),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              children: [
                _InfoRow(label: 'Phiên bản', value: '1.0.0 (demo)'),
                _InfoRow(label: 'Cập nhật', value: '15/05/2026'),
                _InfoRow(label: 'Build', value: 'staff-portal'),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () =>
                      _toast(context, 'Demo — chưa có trang điều khoản'),
                  icon: const Icon(Icons.description_outlined, size: 16),
                  label: const Text('Điều khoản'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () =>
                      _toast(context, 'Demo — chưa có trang quyền riêng tư'),
                  icon: const Icon(Icons.privacy_tip_outlined, size: 16),
                  label: const Text('Quyền riêng tư'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _toast(BuildContext ctx, String msg) {
    ScaffoldMessenger.of(ctx)
        .showSnackBar(SnackBar(content: Text(msg)));
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

class _ContactCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool wide;
  const _ContactCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.wide = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          border: Border.all(color: color.withValues(alpha: 0.25)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: wide
            ? Row(
                children: [
                  _icon(),
                  const SizedBox(width: 12),
                  Expanded(child: _texts()),
                  Icon(Icons.arrow_forward_ios, color: color, size: 14),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _icon(),
                  const SizedBox(height: 10),
                  _texts(),
                ],
              ),
      ),
    );
  }

  Widget _icon() => Container(
        height: 36,
        width: 36,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
        ),
        alignment: Alignment.center,
        child: Icon(icon, color: Colors.white, size: 18),
      );

  Widget _texts() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w800, fontSize: 13)),
          const SizedBox(height: 2),
          Text(subtitle,
              style: const TextStyle(
                  color: AppColors.textMuted, fontSize: 12)),
        ],
      );
}

class _FaqTile extends StatefulWidget {
  final _Faq faq;
  const _FaqTile({required this.faq});

  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => setState(() => _open = !_open),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedSize(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      height: 28,
                      width: 28,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.help_outline,
                          size: 14, color: AppColors.primary),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        widget.faq.q,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                    ),
                    Icon(
                      _open
                          ? Icons.keyboard_arrow_up
                          : Icons.keyboard_arrow_down,
                      color: AppColors.textMuted,
                      size: 20,
                    ),
                  ],
                ),
                if (_open) ...[
                  const SizedBox(height: 10),
                  const Divider(height: 1),
                  const SizedBox(height: 10),
                  Text(
                    widget.faq.a,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(label,
              style: const TextStyle(
                  color: AppColors.textMuted, fontSize: 12)),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 13)),
        ],
      ),
    );
  }
}
