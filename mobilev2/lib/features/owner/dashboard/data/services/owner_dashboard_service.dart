import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/owner/dashboard/data/models/owner_dashboard_dto.dart';

part 'owner_dashboard_service.g.dart';

@RestApi()
abstract class OwnerDashboardService {
  factory OwnerDashboardService(Dio dio) = _OwnerDashboardService;

  /// `GET /owner/dashboard?date=YYYY-MM-DD` — aggregate KPI (revenue, bookings,
  /// occupancy) + recent bookings + revenue 7 ngày + top customers.
  @GET('/owner/dashboard')
  Future<OwnerDashboardDto> getDashboard({@Query('date') String? date});
}
