import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/availability_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/review_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';

part 'venues_service.g.dart';

/// Retrofit service mapping `/venues/*` endpoints (customer read).
///
/// Backend trả thẳng DTO (không bọc ApiResponse). Pagination cursor-based.
@RestApi()
abstract class VenuesService {
  factory VenuesService(Dio dio) = _VenuesService;

  /// GET /venues — search + filter + sort.
  /// - `q`: keyword search trên name/address/description.
  /// - `sportSlug`: filter môn.
  /// - `city`/`district`: filter địa lý.
  /// - `lat`/`lng`: nếu có thì backend tính distance Haversine + sort.
  /// - `sortBy`: 'rating' | 'newest' | 'distance'.
  /// - `cursor`: pagination token từ response trước.
  /// - `limit`: page size (default 20).
  @GET('/venues')
  Future<VenueListResponse> getVenues({
    @Query('q') String? q,
    @Query('sportSlug') String? sportSlug,
    @Query('city') String? city,
    @Query('district') String? district,
    @Query('lat') double? lat,
    @Query('lng') double? lng,
    @Query('sortBy') String? sortBy,
    @Query('cursor') String? cursor,
    @Query('limit') int? limit,
  });

  /// GET /venues/:idOrSlug — detail (cả cuid và slug đều được).
  /// Response include `courts[]`, `images[]`, `amenities[]`, `sports[]`,
  /// `reviewsCount`.
  @GET('/venues/{idOrSlug}')
  Future<VenueDto> getVenue(@Path('idOrSlug') String idOrSlug);

  /// GET /venues/:id/reviews?sort=recent|rating
  @GET('/venues/{id}/reviews')
  Future<List<ReviewDto>> getVenueReviews(
    @Path('id') String venueId, {
    @Query('sort') String? sort,
  });

  /// GET /venues/:id/availability?date=YYYY-MM-DD
  /// Matrix courts × time-slots với price + status.
  @GET('/venues/{id}/availability')
  Future<AvailabilityDto> getVenueAvailability(
    @Path('id') String venueId, {
    @Query('date') required String date,
  });
}
