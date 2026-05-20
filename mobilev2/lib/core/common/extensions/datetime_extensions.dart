import 'package:intl/intl.dart';

extension DateTimeX on DateTime {
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  bool get isYesterday {
    final y = DateTime.now().subtract(const Duration(days: 1));
    return year == y.year && month == y.month && day == y.day;
  }

  String format([String pattern = 'dd/MM/yyyy']) =>
      DateFormat(pattern).format(this);

  String formatTime() => DateFormat.Hm().format(this);
  String formatDateTime() => DateFormat('dd/MM/yyyy HH:mm').format(this);

  /// Tiếng Việt — yêu cầu `initializeDateFormatting('vi_VN')` đã được gọi.
  /// VD: "Thứ Hai, 19 tháng 5 2025"
  String formatFullVi() => DateFormat('EEEE, d MMMM yyyy', 'vi_VN').format(this);

  /// VD: "19 tháng 5 2025"
  String formatDateVi() => DateFormat('d MMMM yyyy', 'vi_VN').format(this);

  /// VD: "tháng 5 2025"
  String formatMonthVi() => DateFormat('MMMM yyyy', 'vi_VN').format(this);

  String get timeAgo {
    final diff = DateTime.now().difference(this);
    if (diff.inSeconds < 60) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    if (diff.inDays < 7) return '${diff.inDays} ngày trước';
    return format();
  }
}
