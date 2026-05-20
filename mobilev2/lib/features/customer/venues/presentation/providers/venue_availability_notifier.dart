import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/availability_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/services/venues_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'venue_availability_notifier.g.dart';

/// Provider family — fetch availability matrix theo (venueId, date).
///
/// Mock mode: generate pseudo-random status từ `MockData.cellStatus`
/// (nếu có) hoặc tạo cells available 06:00–22:00 với giá 250k.
@riverpod
Future<AvailabilityDto> venueAvailability(
  Ref ref, {
  required String venueId,
  required String date,
}) async {
  if (AppConfig.useMock) {
    return _buildMockAvailability(venueId, date);
  }

  final service = VenuesService(ref.read(dioProvider));
  return service.getVenueAvailability(venueId, date: date);
}

AvailabilityDto _buildMockAvailability(String venueId, String date) {
  final venue = MockData.venues.firstWhere(
    (v) => v.id == venueId,
    orElse: () => MockData.venues.first,
  );

  // 16 slot 06:00–22:00 (60' mỗi slot)
  final hours = List.generate(16, (i) {
    final h = (6 + i).toString().padLeft(2, '0');
    return '$h:00';
  });

  final courts = MockData.courts.take(3).map((c) {
    final cells = hours.map((hh) {
      // Pseudo-random by hour to vary status — mỗi ngày giống nhau cho cùng venue.
      final hash = '$venueId-$date-${c.id}-$hh'.hashCode.abs();
      String status = 'available';
      if (hash % 11 == 0) {
        status = 'booked';
      } else if (hash % 13 == 0) status = 'held';

      return AvailabilityCellDto(
        hour: hh,
        startsAt: '${date}T${hh}:00.000Z',
        endsAt:
            '${date}T${(int.parse(hh.substring(0, 2)) + 1).toString().padLeft(2, '0')}:00:00.000Z',
        price: venue.priceFrom > 0 ? venue.priceFrom : 250000,
        status: status,
      );
    }).toList();
    return CourtAvailabilityDto(
      id: c.id,
      name: c.name,
      slotDurationMinutes: 60,
      cells: cells,
    );
  }).toList();

  return AvailabilityDto(
    date: date,
    openTime: '06:00',
    closeTime: '22:00',
    courts: courts,
  );
}
