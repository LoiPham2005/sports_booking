import 'package:intl/intl.dart';

final _vnd = NumberFormat.currency(locale: 'vi_VN', symbol: '₫', decimalDigits: 0);
final _num = NumberFormat.decimalPattern('vi_VN');
final _dateShort = DateFormat('dd/MM');
final _time = DateFormat('HH:mm');

String formatVND(num value) => _vnd.format(value);
String formatNumber(num value) => _num.format(value);
String formatDateShort(DateTime d) => _dateShort.format(d);
String formatTime(DateTime d) => _time.format(d);

/// Try VI locale first. Fall back to plain `dd/MM/yyyy` if locale data
/// chưa được khởi tạo (vd. dev hot-reload trước khi main() chạy).
String formatDateLong(DateTime d) {
  try {
    return DateFormat('EEEE, d MMMM y', 'vi_VN').format(d);
  } catch (_) {
    return DateFormat('dd/MM/yyyy').format(d);
  }
}
