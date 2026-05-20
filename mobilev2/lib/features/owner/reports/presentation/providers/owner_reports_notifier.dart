import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/owner/reports/data/models/reports_dto.dart';
import 'package:sports_booking_mobile/features/owner/reports/data/services/owner_reports_service.dart';

part 'owner_reports_notifier.g.dart';

/// Family provider — fetch reports theo (from, to, groupBy).
@riverpod
Future<ReportsResponse> ownerReports(
  Ref ref, {
  String? from,
  String? to,
  String groupBy = 'day',
}) async {
  if (AppConfig.useMock) {
    return ReportsResponse(
      from: from ?? '',
      to: to ?? '',
      groupBy: groupBy,
      series: const [
        ReportSeriesPoint(bucket: '2026-05-01', total: 12000000, count: 14),
        ReportSeriesPoint(bucket: '2026-05-02', total: 18500000, count: 21),
        ReportSeriesPoint(bucket: '2026-05-03', total: 22000000, count: 24),
        ReportSeriesPoint(bucket: '2026-05-04', total: 14000000, count: 16),
        ReportSeriesPoint(bucket: '2026-05-05', total: 20500000, count: 22),
        ReportSeriesPoint(bucket: '2026-05-06', total: 17000000, count: 19),
        ReportSeriesPoint(bucket: '2026-05-07', total: 24000000, count: 27),
      ],
      paymentBreakdown: const [
        PaymentBreakdownPoint(provider: 'VNPAY', total: 75000000, count: 87),
        PaymentBreakdownPoint(provider: 'MOMO', total: 32000000, count: 41),
        PaymentBreakdownPoint(provider: 'ZALOPAY', total: 28000000, count: 35),
        PaymentBreakdownPoint(provider: 'CASH', total: 14000000, count: 18),
      ],
    );
  }
  final service = OwnerReportsService(ref.read(dioProvider));
  return service.getReports(from: from, to: to, groupBy: groupBy);
}
