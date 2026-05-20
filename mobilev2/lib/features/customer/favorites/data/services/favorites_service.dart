import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';

part 'favorites_service.g.dart';

/// Wrapper response cho `GET /me/favorites` — backend trả mảng object có
/// `venue` nested (qua Prisma include).
class FavoriteVenueWrapper {
  const FavoriteVenueWrapper(this.venue);
  final VenueDto venue;
}

@RestApi()
abstract class FavoritesService {
  factory FavoritesService(Dio dio) = _FavoritesService;

  /// `GET /me/favorites` — backend trả `[ { userId, venueId, venue: VenueDto } ]`.
  /// Adapter parse list ở notifier dùng raw response.
  @GET('/me/favorites')
  Future<List<Map<String, dynamic>>> getFavorites();

  /// `POST /me/favorites/:venueId` — add favorite.
  @POST('/me/favorites/{venueId}')
  Future<void> addFavorite(@Path('venueId') String venueId);

  /// `DELETE /me/favorites/:venueId` — remove favorite.
  @DELETE('/me/favorites/{venueId}')
  Future<void> removeFavorite(@Path('venueId') String venueId);
}
