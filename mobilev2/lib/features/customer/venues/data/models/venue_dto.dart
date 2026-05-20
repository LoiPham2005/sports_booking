import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/models/sport_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/court_dto.dart';

part 'venue_dto.freezed.dart';
part 'venue_dto.g.dart';

/// VenueDto — khớp Prisma `Venue` model + nested denormalized fields backend
/// thêm vào response (`sports[]`, `priceFrom`, `distance`, `images[]`,
/// `amenities[]`).
///
/// Đọc skill `API_INTEGRATION.md § 3` cho field mapping UI ↔ DB.
@freezed
abstract class VenueDto with _$VenueDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory VenueDto({
    required String id,
    required String name,
    String? slug,
    String? description,
    required String addressLine,
    String? ward,
    String? district,
    required String city,
    @Default('VN') String country,
    double? lat,
    double? lng,
    String? phone,
    String? status,
    @Default(0) double ratingAvg,
    @Default(0) int ratingCount,
    @Default([]) List<VenueImageDto> images,
    @Default([]) List<AmenityDto> amenities,
    @Default([]) List<SportDto> sports,
    int? priceFrom,
    double? distance,
    // Chỉ trả về ở endpoint detail (GET /venues/:idOrSlug).
    @Default([]) List<CourtDto> courts,
    int? reviewsCount,
  }) = _VenueDto;

  factory VenueDto.fromJson(Map<String, dynamic> json) =>
      _$VenueDtoFromJson(json);
}

@freezed
abstract class VenueImageDto with _$VenueImageDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory VenueImageDto({
    required String id,
    required String url,
    @Default(0) int sort,
    @Default(false) bool isPrimary,
  }) = _VenueImageDto;

  factory VenueImageDto.fromJson(Map<String, dynamic> json) =>
      _$VenueImageDtoFromJson(json);
}

@freezed
abstract class AmenityDto with _$AmenityDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory AmenityDto({
    required String id,
    required String slug,
    required String nameVi,
    String? nameEn,
    String? icon,
  }) = _AmenityDto;

  factory AmenityDto.fromJson(Map<String, dynamic> json) =>
      _$AmenityDtoFromJson(json);
}

/// Response cho `GET /venues` — backend trả cursor-based pagination.
@freezed
abstract class VenueListResponse with _$VenueListResponse {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory VenueListResponse({
    @Default([]) List<VenueDto> data,
    String? nextCursor,
  }) = _VenueListResponse;

  factory VenueListResponse.fromJson(Map<String, dynamic> json) =>
      _$VenueListResponseFromJson(json);
}
