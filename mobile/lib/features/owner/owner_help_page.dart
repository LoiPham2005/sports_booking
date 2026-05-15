import 'package:flutter/material.dart';

import '../../shared/routing/safe_pop.dart';
import '../../shared/theme/app_colors.dart';

class OwnerHelpPage extends StatefulWidget {
  const OwnerHelpPage({super.key});

  @override
  State<OwnerHelpPage> createState() => _OwnerHelpPageState();
}

class _Faq {
  final String q;
  final String a;
  final String category;
  const _Faq(this.category, this.q, this.a);
}

class _OwnerHelpPageState extends State<OwnerHelpPage> {
  String _query = '';
  String _category = 'all';

  static const _categories = [
    ('all', 'Tất cả', Icons.apps),
    ('venue', 'Venue', Icons.stadium),
    ('booking', 'Booking', Icons.event),
    ('payment', 'Thanh toán', Icons.payments),
    ('staff', 'Nhân viên', Icons.groups),
  ];

  static const _faqs = [
    _Faq(
      'venue',
      'Tạo venue mới mất bao lâu để được duyệt?',
      'Sau khi bạn submit, Admin sàn sẽ duyệt trong 24h (giờ hành chính). Yêu cầu hợp lệ: '
          'ảnh thật sân, đầy đủ giấy phép kinh doanh, mô tả rõ ràng. Nếu bị từ chối, '
          'bạn sẽ nhận email kèm lý do và có thể sửa rồi submit lại.',
    ),
    _Faq(
      'venue',
      'Tôi có thể có bao nhiêu venue?',
      'Không giới hạn — bạn có thể quản lý nhiều venue dưới cùng một tài khoản Owner. '
          'Mỗi venue có bảng giá, sân, nhân viên riêng. Báo cáo doanh thu tổng hợp theo từng venue.',
    ),
    _Faq(
      'venue',
      'Đổi giá sân thì áp dụng từ khi nào?',
      'Giá mới có hiệu lực ngay khi bạn lưu — booking ĐÃ tạo trước đó vẫn giữ giá cũ. '
          'Nếu cần áp dụng tạm thời (vd: cao điểm cuối tuần), dùng "Giá tạm thời" (chỉ Manager có quyền).',
    ),
    _Faq(
      'booking',
      'Khách huỷ booking thì tôi mất tiền không?',
      'Theo chính sách huỷ bạn set trong Cài đặt → Vận hành. Mặc định "Trước 24h hoàn 100%", '
          'có nghĩa: khách huỷ trước 24h thì sàn hoàn 100% cho khách + bạn không nhận tiền. '
          'Trong vòng 24h: bạn nhận đủ tiền, khách không được hoàn.',
    ),
    _Faq(
      'booking',
      'Tôi có thể từ chối booking không?',
      'Trong vòng 5 phút sau khi khách đặt, bạn có thể từ chối (vd: lịch trùng, sân bảo trì) — sàn hoàn tiền 100% cho khách, '
          'không tính vào tỷ lệ huỷ của bạn. Sau 5 phút, booking tự động xác nhận.',
    ),
    _Faq(
      'booking',
      'Walk-in (khách đến trực tiếp) thì sao?',
      'Vào tab Booking → "Walk-in" để tạo booking offline. Khoản này KHÔNG thu phí dịch vụ 8%. '
          'Tiền mặt bạn tự thu, app chỉ ghi nhận để báo cáo doanh thu.',
    ),
    _Faq(
      'payment',
      'Phí dịch vụ là bao nhiêu?',
      'Sàn thu 8% trên mỗi giao dịch online thành công (đã trừ phần refund nếu có). '
          'Walk-in không tính phí. Phí này đã bao gồm phí cổng VNPay/MoMo/ZaloPay.',
    ),
    _Faq(
      'payment',
      'Khi nào tiền về tài khoản của tôi?',
      'Sau khi giao dịch SUCCESS, sàn giữ T+1 ngày (24h) để xử lý refund nếu có. '
          'Sau đó tiền vào ví Owner. Bạn có thể yêu cầu payout về ngân hàng 1-2 lần/tuần, '
          'phí payout 5.000đ/lần (do ngân hàng thu).',
    ),
    _Faq(
      'payment',
      'Tôi chưa nhận được tiền dù booking đã hoàn thành',
      'Kiểm tra: (1) Ví Owner trong tab Tài khoản → Tài khoản nhận tiền, (2) Đã set Bank Account chưa, '
          '(3) Có đang trong period giữ T+1 không. Nếu vẫn không thấy sau 48h, liên hệ admin sàn.',
    ),
    _Faq(
      'staff',
      'Mời nhân viên làm việc tại venue',
      'Tab Nhân viên → Mời nhân viên → nhập email + chọn vai trò Manager/Staff + chọn venue. '
          'Email mời có link xác nhận, hết hạn sau 7 ngày. Nhân viên cần đăng ký app trước.',
    ),
    _Faq(
      'staff',
      'Khác biệt giữa Manager và Staff?',
      'Staff: check-in QR, xem lịch, xem booking, báo cáo ca trực.\n'
          'Manager (có hết quyền Staff +): tab Doanh thu, tạo "Giá tạm thời" override, xem đội ngũ. '
          'Cả 2 đều KHÔNG sửa được giá gốc, không tạo/xoá sân, không xem payout.',
    ),
    _Faq(
      'staff',
      'Sa thải nhân viên',
      'Tab Nhân viên → mở chi tiết người đó → "Đình chỉ" (tạm thời, có thể bật lại) hoặc "Xoá khỏi venue" '
          '(vĩnh viễn, mất quyền ngay lập tức nhưng giữ lịch sử booking đã xử lý).',
    ),
  ];

  List<_Faq> get _filtered {
    var list = _faqs.toList();
    if (_category != 'all') {
      list = list.where((f) => f.category == _category).toList();
    }
    if (_query.trim().isNotEmpty) {
      final q = _query.toLowerCase();
      list = list
          .where((f) =>
              f.q.toLowerCase().contains(q) || f.a.toLowerCase().contains(q))
          .toList();
    }
    return list;
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
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          // Search
          TextField(
            onChanged: (v) => setState(() => _query = v),
            decoration: InputDecoration(
              hintText: 'Tìm trong trung tâm trợ giúp...',
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
          const SizedBox(height: 16),

          // Quick action cards (top-most)
          const _SectionTitle('HÀNH ĐỘNG NHANH'),
          Row(
            children: [
              Expanded(
                child: _QuickCard(
                  icon: Icons.support_agent,
                  color: AppColors.primary,
                  title: 'Chat với admin',
                  subtitle: 'Phản hồi < 30\'',
                  onTap: () => _toast(context, 'Demo — chưa mở chat admin'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickCard(
                  icon: Icons.phone_in_talk,
                  color: AppColors.info,
                  title: 'Hotline',
                  subtitle: '1900 1234',
                  onTap: () => _toast(context, 'Đang gọi 1900 1234...'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _QuickCard(
                  icon: Icons.book_outlined,
                  color: const Color(0xFF6366F1),
                  title: 'Hướng dẫn chủ sân',
                  subtitle: 'Cẩm nang 5 bước',
                  onTap: () => _showGuideSheet(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QuickCard(
                  icon: Icons.bug_report_outlined,
                  color: AppColors.danger,
                  title: 'Báo lỗi app',
                  subtitle: 'Gửi feedback',
                  onTap: () => _showFeedbackSheet(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),
          const _SectionTitle('CHỦ ĐỀ'),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final cat in _categories) ...[
                  _CategoryChip(
                    label: cat.$2,
                    icon: cat.$3,
                    selected: _category == cat.$1,
                    onTap: () => setState(() => _category = cat.$1),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),
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
                      size: 40, color: AppColors.textMuted),
                  const SizedBox(height: 6),
                  const Text('Không tìm thấy kết quả',
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  TextButton(
                    onPressed: () => _showFeedbackSheet(context),
                    child: const Text('Gửi câu hỏi cho admin'),
                  ),
                ],
              ),
            )
          else
            ..._filtered.map((f) => _FaqTile(faq: f)),

          const SizedBox(height: 20),
          const _SectionTitle('VỀ ỨNG DỤNG'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              children: [
                _InfoRow(label: 'Phiên bản', value: '1.0.0 (demo)'),
                Divider(height: 1, indent: 14, endIndent: 14),
                _InfoRow(label: 'Cập nhật', value: '15/05/2026'),
                Divider(height: 1, indent: 14, endIndent: 14),
                _InfoRow(label: 'Build', value: 'owner-portal'),
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
        ],
      ),
    );
  }

  void _toast(BuildContext ctx, String msg) {
    ScaffoldMessenger.of(ctx)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  void _showGuideSheet(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            Center(
              child: Container(
                height: 4,
                width: 40,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const Text('Cẩm nang chủ sân — 5 bước',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
            const SizedBox(height: 4),
            const Text('Từ tạo venue đến nhận tiền đầu tiên',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
            const SizedBox(height: 20),
            ..._guideSteps.asMap().entries.map((e) {
              final i = e.key + 1;
              final s = e.value;
              return _GuideStep(num: i, title: s.$1, body: s.$2);
            }),
          ],
        ),
      ),
    );
  }

  void _showFeedbackSheet(BuildContext ctx) {
    final controller = TextEditingController();
    String type = 'bug';
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            12,
            20,
            20 + MediaQuery.of(sheetCtx).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  height: 4,
                  width: 40,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const Text('Gửi phản hồi',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                children: [
                  for (final t in const [
                    ('bug', 'Báo lỗi', Icons.bug_report_outlined),
                    ('feature', 'Đề xuất tính năng', Icons.lightbulb_outline),
                    ('question', 'Câu hỏi', Icons.help_outline),
                  ])
                    ChoiceChip(
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(t.$3, size: 14),
                          const SizedBox(width: 4),
                          Text(t.$2),
                        ],
                      ),
                      selected: type == t.$1,
                      onSelected: (_) => setSheetState(() => type = t.$1),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                maxLines: 5,
                decoration: const InputDecoration(
                  hintText: 'Mô tả vấn đề bạn gặp phải, kèm bước tái hiện nếu có...',
                  isDense: true,
                ),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: () {
                  Navigator.pop(sheetCtx);
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    const SnackBar(
                        content: Text('Đã gửi phản hồi — cảm ơn bạn!')),
                  );
                },
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text('Gửi'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static const List<(String, String)> _guideSteps = [
    (
      'Tạo venue & chờ duyệt',
      'Tab Tài khoản → Thêm venue mới → điền tên, địa chỉ, ảnh thật. Admin duyệt trong 24h. '
          'Mẹo: ảnh chất lượng cao giúp được duyệt nhanh hơn.'
    ),
    (
      'Thêm sân và bảng giá',
      'Mở venue vừa tạo → tab "Sân" → thêm từng sân. Sau đó vào tab "Bảng giá" để set giá theo khung giờ '
          '(vd: 6-10h sáng 200k, 17-21h tối 350k).'
    ),
    (
      'Mời nhân viên (tùy chọn)',
      'Tab Nhân viên → Mời nhân viên. Có 2 vai trò: Staff (check-in) và Manager (thêm quyền doanh thu + giá tạm). '
          'Nhân viên cần có app để nhận lời mời.'
    ),
    (
      'Cấu hình thanh toán',
      'Tài khoản → Tài khoản nhận tiền → liên kết ngân hàng (Vietcombank/Techcombank/MB). '
          'Đây là nơi sàn payout tiền cho bạn 1-2 lần/tuần.'
    ),
    (
      'Đón booking đầu tiên',
      'Khi khách đặt, bạn nhận push thông báo. Vào "Booking" để xác nhận hoặc từ chối (5 phút). '
          'Khi khách đến, dùng "Quét QR" để check-in.'
    ),
  ];
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

class _QuickCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _QuickCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 36,
              width: 36,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(icon, color: Colors.white, size: 18),
            ),
            const SizedBox(height: 10),
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 13)),
            const SizedBox(height: 2),
            Text(subtitle,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _CategoryChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary
              : AppColors.primary.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                color: selected ? Colors.white : AppColors.primary,
                size: 14),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.primary,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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

class _GuideStep extends StatelessWidget {
  final int num;
  final String title;
  final String body;
  const _GuideStep({required this.num, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 32,
            width: 32,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text('$num',
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 4),
                Text(body,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      height: 1.5,
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
