import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/models/sport_dto.dart';

part 'sports_service.g.dart';

/// Retrofit service mapping `/sports` endpoint.
///
/// Backend trả `SportDto[]` (List<SportDto>) — không bọc ApiResponse.
@RestApi()
abstract class SportsService {
  factory SportsService(Dio dio) = _SportsService;

  /// GET /sports — danh sách môn thể thao + count aggregate.
  @GET('/sports')
  Future<List<SportDto>> getSports();

  /// GET /sports/:slug — detail 1 môn.
  @GET('/sports/{slug}')
  Future<SportDto> getSportBySlug(@Path('slug') String slug);
}
