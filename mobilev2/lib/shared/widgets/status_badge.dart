import 'package:flutter/material.dart';
import '../mock/mock_data.dart';
import '../theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final BookingStatus status;
  const StatusBadge({super.key, required this.status});

  (String, Color, Color) _info() {
    switch (status) {
      case BookingStatus.pendingPayment:
        return ('Chờ thanh toán', AppColors.warning, const Color(0xFFFFFBEB));
      case BookingStatus.confirmed:
        return ('Đã xác nhận', AppColors.success, const Color(0xFFECFDF5));
      case BookingStatus.checkedIn:
        return ('Đã check-in', AppColors.primary, const Color(0xFFD1FAE5));
      case BookingStatus.completed:
        return ('Hoàn thành', AppColors.textSecondary, AppColors.surfaceAlt);
      case BookingStatus.cancelled:
        return ('Đã huỷ', AppColors.danger, const Color(0xFFFEF2F2));
    }
  }

  @override
  Widget build(BuildContext context) {
    final (label, fg, bg) = _info();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(
        label,
        style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 11),
      ),
    );
  }
}
