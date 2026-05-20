import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/owner/staff/data/models/staff_dto.dart';
import 'package:sports_booking_mobile/features/staff_portal/data/models/staff_portal_dtos.dart';

part 'staff_portal_service.g.dart';

@RestApi()
abstract class StaffPortalService {
  factory StaffPortalService(Dio dio) = _StaffPortalService;

  /// `GET /staff/memberships` — list venue user là VenueMember (MANAGER/STAFF).
  /// Frontend dùng để xác định role hiển thị tab quản lý.
  @GET('/staff/memberships')
  Future<List<MembershipDto>> memberships();

  /// `GET /staff/today` — bookings hôm nay ở venue đang trực.
  @GET('/staff/today')
  Future<List<BookingDto>> today();

  /// `GET /staff/schedule?date=YYYY-MM-DD&days=7`
  @GET('/staff/schedule')
  Future<List<BookingDto>> schedule({
    @Query('date') String? date,
    @Query('days') int? days,
  });

  /// `GET /staff/bookings/:id` — detail (scope theo VenueMember).
  @GET('/staff/bookings/{id}')
  Future<BookingDto> bookingDetail(@Path('id') String id);

  /// `POST /staff/check-in` body `{ token }`. Set checkedInAt + handledByUserId.
  @POST('/staff/check-in')
  Future<BookingDto> checkIn(@Body() CheckInRequest body);

  // ─── Manager-only ───

  /// `GET /staff/revenue?date=&venueId=` — doanh thu hôm nay + byHour + byCourt.
  @GET('/staff/revenue')
  Future<RevenueResponse> revenue({
    @Query('date') String? date,
    @Query('venueId') String? venueId,
  });

  /// `GET /staff/team?venueId=` — đội ngũ cùng venue (read-only).
  @GET('/staff/team')
  Future<List<StaffMemberDto>> team({@Query('venueId') String? venueId});

  /// `GET /staff/pricing/overrides?venueId=`
  @GET('/staff/pricing/overrides')
  Future<List<PriceOverrideDto>> listOverrides({
    @Query('venueId') required String venueId,
  });

  /// `POST /staff/pricing/overrides`
  @POST('/staff/pricing/overrides')
  Future<PriceOverrideDto> createOverride(
      @Body() CreatePriceOverrideRequest body);

  /// `DELETE /staff/pricing/overrides/:id`
  @DELETE('/staff/pricing/overrides/{id}')
  Future<void> deleteOverride(@Path('id') String id);
}
