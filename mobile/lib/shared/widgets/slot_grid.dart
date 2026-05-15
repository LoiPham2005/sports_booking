import 'package:flutter/material.dart';
import '../mock/mock_data.dart';
import '../theme/app_colors.dart';

class SlotGrid extends StatelessWidget {
  final List<String> selected;
  final ValueChanged<List<String>> onChanged;

  const SlotGrid({super.key, required this.selected, required this.onChanged});

  void _toggle(String slot) {
    final next = [...selected];
    if (next.contains(slot)) {
      next.remove(slot);
    } else {
      next.add(slot);
      next.sort();
    }
    onChanged(next);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 12,
          runSpacing: 6,
          children: const [
            _LegendDot(color: Colors.white, border: true, label: 'Còn trống'),
            _LegendDot(color: AppColors.primary, label: 'Đã chọn'),
            _LegendDot(color: Color(0xFFFEF3C7), label: 'Đang giữ'),
            _LegendDot(color: AppColors.surfaceAlt, label: 'Đã đặt'),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 2.1,
          ),
          itemCount: MockData.timeSlots.length,
          itemBuilder: (_, i) {
            final slot = MockData.timeSlots[i];
            final status = MockData.slotStatus(slot);
            final isSelected = selected.contains(slot);
            final disabled = status == 'booked';

            Color bg = Colors.white;
            Color fg = AppColors.textPrimary;
            Color? border = AppColors.border;
            if (disabled) {
              bg = AppColors.surfaceAlt;
              fg = AppColors.textMuted;
              border = AppColors.border;
            } else if (status == 'held' && !isSelected) {
              bg = const Color(0xFFFEF3C7);
              fg = const Color(0xFFB45309);
              border = const Color(0xFFFCD34D);
            }
            if (isSelected) {
              bg = AppColors.primary;
              fg = Colors.white;
              border = AppColors.primary;
            }

            return InkWell(
              onTap: disabled ? null : () => _toggle(slot),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: border),
                ),
                child: Text(
                  slot,
                  style: TextStyle(
                    color: fg,
                    fontWeight: FontWeight.w600,
                    decoration: disabled ? TextDecoration.lineThrough : TextDecoration.none,
                  ),
                ),
              ),
            );
          },
        ),
        if (selected.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            'Đã chọn ${selected.length} giờ · liên tục ${selected.first}–${_nextHour(selected.last)}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ],
    );
  }

  String _nextHour(String s) {
    final h = int.parse(s.split(':')[0]);
    return '${(h + 1).toString().padLeft(2, '0')}:00';
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
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
            border: border ? Border.all(color: AppColors.border) : null,
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}
