import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/court_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/services/venues_service.dart';
import 'package:sports_booking_mobile/features/customer/venues/presentation/providers/venues_notifier.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'venue_detail_notifier.g.dart';

/// UI wrapper cho detail page: gom Venue + courts + count.
class VenueDetail {
  const VenueDetail({
    required this.venue,
    required this.courts,
    required this.reviewsCount,
  });

  final Venue venue;
  final List<Court> courts;
  final int reviewsCount;
}

/// FutureProvider family theo `idOrSlug`. Tự cache theo key.
@riverpod
Future<VenueDetail> venueDetail(Ref ref, String idOrSlug) async {
  if (AppConfig.useMock) {
    final venue = MockData.venues.firstWhere(
      (v) => v.id == idOrSlug,
      orElse: () => MockData.venues.first,
    );
    return VenueDetail(
      venue: venue,
      courts: MockData.courts,
      reviewsCount: venue.reviewCount,
    );
  }

  final service = VenuesService(ref.read(dioProvider));
  final dto = await service.getVenue(idOrSlug);
  return VenueDetail(
    venue: venueDtoToUi(dto),
    courts: dto.courts.map(_courtDtoToUi).toList(),
    reviewsCount: dto.reviewsCount ?? 0,
  );
}

Court _courtDtoToUi(CourtDto dto) => Court(
      id: dto.id,
      name: dto.name,
      surface: courtSurfaceLabel[dto.surface] ?? dto.surface,
      indoor: dto.indoor,
      capacity: dto.capacity,
      // pricePerHour không còn có ý nghĩa với pricing engine — mặc định 0.
      // Page detail không hiển thị field này nữa; pricing thực qua availability.
      pricePerHour: 0,
    );
