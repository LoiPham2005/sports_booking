import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/owner/reports/data/models/reports_dto.dart';

part 'owner_reports_service.g.dart';

@RestApi()
abstract class OwnerReportsService {
  factory OwnerReportsService(Dio dio) = _OwnerReportsService;

  /// `GET /owner/reports?from=&to=&groupBy=day|week|month`
  @GET('/owner/reports')
  Future<ReportsResponse> getReports({
    @Query('from') String? from,
    @Query('to') String? to,
    @Query('groupBy') String? groupBy,
  });
}
