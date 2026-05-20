import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';

part 'bookings_service.g.dart';

@RestApi()
abstract class BookingsService {
  factory BookingsService(Dio dio) = _BookingsService;

  /// `POST /bookings/quote` — báo giá + hold slot 10' (Redis).
  @POST('/bookings/quote')
  Future<QuoteResponse> quote(@Body() QuoteRequest body);

  /// `POST /bookings` — tạo booking PENDING_PAYMENT từ holdToken.
  @POST('/bookings')
  Future<BookingDto> create(@Body() CreateBookingRequest body);

  /// `GET /bookings/mine` — booking của user hiện tại.
  @GET('/bookings/mine')
  Future<List<BookingDto>> mine();

  /// `GET /bookings/:id` — detail.
  @GET('/bookings/{id}')
  Future<BookingDto> detail(@Path('id') String id);

  /// `POST /bookings/:id/cancel` — customer huỷ. Backend tự tính refund.
  @POST('/bookings/{id}/cancel')
  Future<BookingDto> cancel(
    @Path('id') String id,
    @Body() CancelBookingRequest body,
  );
}
