import 'package:freezed_annotation/freezed_annotation.dart';

part 'reports_dto.freezed.dart';
part 'reports_dto.g.dart';

@freezed
abstract class ReportsResponse with _$ReportsResponse {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory ReportsResponse({
    required String from,
    required String to,
    @Default('day') String groupBy, // day | week | month
    @Default([]) List<ReportSeriesPoint> series,
    @Default([]) List<PaymentBreakdownPoint> paymentBreakdown,
  }) = _ReportsResponse;

  factory ReportsResponse.fromJson(Map<String, dynamic> json) =>
      _$ReportsResponseFromJson(json);
}

@freezed
abstract class ReportSeriesPoint with _$ReportSeriesPoint {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory ReportSeriesPoint({
    required String bucket,
    @Default(0) int total,
    @Default(0) int count,
  }) = _ReportSeriesPoint;

  factory ReportSeriesPoint.fromJson(Map<String, dynamic> json) =>
      _$ReportSeriesPointFromJson(json);
}

@freezed
abstract class PaymentBreakdownPoint with _$PaymentBreakdownPoint {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PaymentBreakdownPoint({
    required String provider, // VNPAY | MOMO | ZALOPAY | ...
    @Default(0) int total,
    @Default(0) int count,
  }) = _PaymentBreakdownPoint;

  factory PaymentBreakdownPoint.fromJson(Map<String, dynamic> json) =>
      _$PaymentBreakdownPointFromJson(json);
}
