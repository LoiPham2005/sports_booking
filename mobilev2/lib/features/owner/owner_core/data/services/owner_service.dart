import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';
import 'package:sports_booking_mobile/features/owner/owner_core/data/models/owner_dtos.dart';

part 'owner_service.g.dart';

@RestApi()
abstract class OwnerService {
  factory OwnerService(Dio dio) = _OwnerService;

  // ─── Venues ───

  /// `GET /venues/owner/list` — list venues thuộc owner hiện tại.
  @GET('/venues/owner/list')
  Future<List<VenueDto>> listVenues();

  /// `POST /venues/owner` — tạo venue (status mặc định DRAFT).
  @POST('/venues/owner')
  Future<VenueDto> createVenue(@Body() CreateVenueRequest body);

  /// `POST /owner/venues/:id/submit` — submit DRAFT → PENDING (chờ Admin duyệt).
  @POST('/owner/venues/{id}/submit')
  Future<VenueDto> submitVenue(@Path('id') String id);

  // ─── Bookings ───

  /// `GET /owner/bookings?venueId=&date=&status=`
  @GET('/owner/bookings')
  Future<List<BookingDto>> listBookings({
    @Query('venueId') String? venueId,
    @Query('date') String? date,
    @Query('status') String? status,
  });

  /// `POST /owner/bookings/walk-in` — tạo walk-in (source=WALK_IN, payment=CASH).
  @POST('/owner/bookings/walk-in')
  Future<BookingDto> createWalkIn(@Body() CreateWalkInRequest body);

  /// `PATCH /owner/bookings/:id/refuse` — chỉ trong 5' sau tạo. Refund 100%.
  @PATCH('/owner/bookings/{id}/refuse')
  Future<BookingDto> refuseBooking(
    @Path('id') String id,
    @Body() RefuseBookingRequest body,
  );
}
