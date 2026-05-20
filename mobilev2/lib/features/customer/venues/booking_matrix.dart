import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/mock/mock_data.dart';
import '../../../shared/routing/route_paths.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/utils/format.dart';

enum MatrixAxis { timeRows, courtRows }

class BookingMatrix extends StatefulWidget {
  final Venue venue;
  const BookingMatrix({super.key, required this.venue});

  @override
  State<BookingMatrix> createState() => _BookingMatrixState();
}

enum _CellStatus { available, held, booked }

class _SlotKey {
  final String courtId;
  final String hour;
  const _SlotKey(this.courtId, this.hour);

  String get id => '${courtId}__$hour';

  @override
  bool operator ==(Object other) =>
      other is _SlotKey && other.courtId == courtId && other.hour == hour;
  @override
  int get hashCode => Object.hash(courtId, hour);
}

class _BookingMatrixState extends State<BookingMatrix> {
  DateTime _date = DateTime.now();
  final Set<_SlotKey> _selected = {};
  MatrixAxis _axis = MatrixAxis.timeRows;
  final _voucherCtrl = TextEditingController();

  // Mock courts cho venue — phân biệt với COURTS chung
  static const _courts = [
    ('c1', 'Sân 1', 300000),
    ('c2', 'Sân 2', 300000),
    ('c3', 'Sân 3', 350000),
    ('c4', 'Sân 4', 400000),
    ('c5', 'Sân VIP 1', 500000),
    ('c6', 'Sân VIP 2', 500000),
  ];

  /// Mock status per (court, hour).
  _CellStatus _statusFor(String courtId, String hour) {
    final h = int.parse(hour.split(':')[0]);
    if (h == 18) {
      if (['c1', 'c2', 'c5'].contains(courtId)) return _CellStatus.booked;
      if (courtId == 'c3') return _CellStatus.held;
    }
    if (h == 19) return _CellStatus.booked;
    if (h == 20) {
      if (['c2', 'c3', 'c5'].contains(courtId)) return _CellStatus.booked;
      if (courtId == 'c1') return _CellStatus.held;
    }
    if (h == 17) {
      if (courtId == 'c2') return _CellStatus.booked;
      if (courtId == 'c5') return _CellStatus.held;
    }
    if (h == 15 && courtId == 'c1') return _CellStatus.booked;
    if (h == 16 && courtId == 'c3') return _CellStatus.booked;
    if (h == 8 && (courtId == 'c2' || courtId == 'c4' || courtId == 'c6')) {
      return _CellStatus.booked;
    }
    if (h == 9 && courtId == 'c4') return _CellStatus.held;
    if (h == 21 && (courtId == 'c1' || courtId == 'c5')) return _CellStatus.booked;
    return _CellStatus.available;
  }

  int get _subtotal => _selected.fold(0, (sum, s) {
        final c = _courts.firstWhere((c) => c.$1 == s.courtId);
        return sum + c.$3;
      });

  int get _discount =>
      _voucherCtrl.text.trim().toLowerCase() == 'sport20' && _subtotal > 0
          ? (_subtotal * 0.2).toInt().clamp(0, 50000)
          : 0;

  int get _total => (_subtotal - _discount).clamp(0, 99999999);

  void _toggle(String courtId, String hour) {
    if (_statusFor(courtId, hour) != _CellStatus.available) return;
    final k = _SlotKey(courtId, hour);
    setState(() {
      if (_selected.contains(k)) {
        _selected.remove(k);
      } else {
        _selected.add(k);
      }
    });
  }

  @override
  void dispose() {
    _voucherCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildHeader(),
          _buildLegend(),
          const Divider(height: 1, color: AppColors.border),
          SizedBox(
            height: 380,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SingleChildScrollView(
                scrollDirection: Axis.vertical,
                padding: const EdgeInsets.all(12),
                child: _axis == MatrixAxis.timeRows
                    ? _buildTimeRowsTable()
                    : _buildCourtRowsTable(),
              ),
            ),
          ),
          if (_selected.isNotEmpty) _buildSelectedChips(),
          const Divider(height: 1, color: AppColors.border),
          _buildSummaryAndCta(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Đặt sân',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                    Text(
                      'Chọn 1 hoặc nhiều ô trống · giữ 10 phút',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),
              OutlinedButton.icon(
                onPressed: () => setState(() {
                  _axis = _axis == MatrixAxis.timeRows
                      ? MatrixAxis.courtRows
                      : MatrixAxis.timeRows;
                }),
                icon: const Icon(Icons.swap_horiz, size: 16),
                label: Text(
                  _axis == MatrixAxis.timeRows ? 'Giờ↓·Sân→' : 'Sân↓·Giờ→',
                  style: const TextStyle(fontSize: 11),
                ),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () => setState(() {
                  _date = _date.subtract(const Duration(days: 1));
                }),
              ),
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final d = await showDatePicker(
                      context: context,
                      initialDate: _date,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 90)),
                    );
                    if (d != null) setState(() => _date = d);
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            formatDateShort(_date),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () => setState(() {
                  _date = _date.add(const Duration(days: 1));
                }),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: const [
            _LegendDot(color: Colors.white, label: 'Còn trống', border: true),
            SizedBox(width: 12),
            _LegendDot(color: AppColors.primary, label: 'Đã chọn'),
            SizedBox(width: 12),
            _LegendDot(color: Color(0xFFFEF3C7), label: 'Đang giữ'),
            SizedBox(width: 12),
            _LegendDot(color: AppColors.surfaceAlt, label: 'Đã đặt'),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeRowsTable() {
    return Table(
      defaultColumnWidth: const FixedColumnWidth(96),
      columnWidths: const {0: FixedColumnWidth(52)},
      children: [
        // Header
        TableRow(
          children: [
            const _HeaderCell(text: 'GIỜ', isCorner: true),
            ..._courts.map((c) => _HeaderCell(
                  text: c.$2,
                  subtext: '${(c.$3 / 1000).toInt()}k/h',
                )),
          ],
        ),
        // Rows
        for (final hour in MockData.timeSlots)
          TableRow(
            children: [
              _RowLabel(text: hour),
              ..._courts.map((c) {
                final status = _statusFor(c.$1, hour);
                final isSel = _selected.contains(_SlotKey(c.$1, hour));
                return _MatrixCell(
                  status: status,
                  selected: isSel,
                  price: c.$3,
                  onTap: () => _toggle(c.$1, hour),
                );
              }),
            ],
          ),
      ],
    );
  }

  Widget _buildCourtRowsTable() {
    return Table(
      defaultColumnWidth: const FixedColumnWidth(96),
      columnWidths: const {0: FixedColumnWidth(96)},
      children: [
        // Header
        TableRow(
          children: [
            const _HeaderCell(text: 'SÂN', isCorner: true),
            ...MockData.timeSlots.map((h) => _HeaderCell(text: h)),
          ],
        ),
        // Rows
        for (final c in _courts)
          TableRow(
            children: [
              _RowLabel(text: c.$2, subtext: '${(c.$3 / 1000).toInt()}k/h'),
              ...MockData.timeSlots.map((hour) {
                final status = _statusFor(c.$1, hour);
                final isSel = _selected.contains(_SlotKey(c.$1, hour));
                return _MatrixCell(
                  status: status,
                  selected: isSel,
                  price: c.$3,
                  onTap: () => _toggle(c.$1, hour),
                );
              }),
            ],
          ),
      ],
    );
  }

  Widget _buildSelectedChips() {
    final list = _selected.toList()
      ..sort((a, b) => (a.id).compareTo(b.id));
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ĐÃ CHỌN (${_selected.length})',
              style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 10,
                  letterSpacing: 1,
                  fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: list.map((s) {
              final c = _courts.firstWhere((c) => c.$1 == s.courtId);
              return InkWell(
                onTap: () => _toggle(s.courtId, s.hour),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${c.$2} · ${s.hour}  ×',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 11),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryAndCta() {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _voucherCtrl,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(
              hintText: 'Mã giảm giá (vd: SPORT20)',
              prefixIcon: Icon(Icons.local_offer_outlined, size: 18),
              isDense: true,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _SumRow(
                  label: 'Tạm tính (${_selected.length} slot)',
                  value: formatVND(_subtotal),
                ),
                if (_discount > 0) ...[
                  const SizedBox(height: 4),
                  _SumRow(
                    label: 'Giảm giá',
                    value: '−${formatVND(_discount)}',
                    color: AppColors.success,
                  ),
                ],
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tổng cộng',
                        style:
                            TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    Text(
                      formatVND(_total),
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 20),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _selected.isEmpty
                ? null
                : () => context.push(RoutePaths.bookingNew),
            icon: const Icon(Icons.account_balance_wallet_outlined, size: 18),
            label: Text(
              _selected.isEmpty
                  ? 'Chọn ít nhất 1 ô để tiếp tục'
                  : 'Tiếp tục thanh toán',
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderCell extends StatelessWidget {
  final String text;
  final String? subtext;
  final bool isCorner;
  const _HeaderCell({required this.text, this.subtext, this.isCorner = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(2),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        decoration: BoxDecoration(
          color: isCorner ? null : AppColors.surfaceAlt,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: isCorner ? 10 : 12,
                color: isCorner ? AppColors.textMuted : AppColors.textPrimary,
                letterSpacing: isCorner ? 1 : 0,
              ),
            ),
            if (subtext != null)
              Text(
                subtext!,
                style: const TextStyle(
                    fontSize: 9, color: AppColors.textMuted),
              ),
          ],
        ),
      ),
    );
  }
}

class _RowLabel extends StatelessWidget {
  final String text;
  final String? subtext;
  const _RowLabel({required this.text, this.subtext});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 12,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (subtext != null)
            Text(
              subtext!,
              style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
            ),
        ],
      ),
    );
  }
}

class _MatrixCell extends StatelessWidget {
  final _CellStatus status;
  final bool selected;
  final int price;
  final VoidCallback onTap;
  const _MatrixCell({
    required this.status,
    required this.selected,
    required this.price,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color bg = Colors.white;
    Color fg = AppColors.textPrimary;
    Color border = AppColors.border;
    String text = '${(price / 1000).toInt()}k';

    if (selected) {
      bg = AppColors.primary;
      fg = Colors.white;
      border = AppColors.primary;
      text = '✓ Chọn';
    } else if (status == _CellStatus.booked) {
      bg = AppColors.surfaceAlt;
      fg = AppColors.textMuted;
      border = AppColors.border;
      text = 'Đã đặt';
    } else if (status == _CellStatus.held) {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFB45309);
      border = const Color(0xFFFCD34D);
      text = 'Đang giữ';
    }

    final disabled = status == _CellStatus.booked;
    return Padding(
      padding: const EdgeInsets.all(2),
      child: InkWell(
        onTap: disabled ? null : onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: border),
          ),
          child: Text(
            text,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 11,
              color: fg,
              decoration:
                  disabled ? TextDecoration.lineThrough : TextDecoration.none,
            ),
          ),
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  final bool border;
  const _LegendDot({required this.color, required this.label, this.border = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
            border: border ? Border.all(color: AppColors.border) : null,
          ),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}

class _SumRow extends StatelessWidget {
  final String label, value;
  final Color? color;
  const _SumRow({required this.label, required this.value, this.color});
  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  color: color ?? AppColors.textSecondary, fontSize: 13)),
          Text(value,
              style: TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 13, color: color)),
        ],
      );
}
