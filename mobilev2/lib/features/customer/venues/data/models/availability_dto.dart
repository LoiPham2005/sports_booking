import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/models/sport_dto.dart';

part 'availability_dto.freezed.dart';
part 'availability_dto.g.dart';

/// Response cho `GET /venues/:id/availability?date=YYYY-MM-DD`.
/// Backend trả matrix courts × slots với status + price.
@freezed
abstract class AvailabilityDto with _$AvailabilityDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory AvailabilityDto({
    required String date,
    required String openTime,
    required String closeTime,
    @Default([]) List<CourtAvailabilityDto> courts,
  }) = _AvailabilityDto;

  factory AvailabilityDto.fromJson(Map<String, dynamic> json) =>
      _$AvailabilityDtoFromJson(json);
}

@freezed
abstract class CourtAvailabilityDto with _$CourtAvailabilityDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory CourtAvailabilityDto({
    required String id,
    required String name,
    SportDto? sport,
    @Default(60) int slotDurationMinutes,
    @Default([]) List<AvailabilityCellDto> cells,
  }) = _CourtAvailabilityDto;

  factory CourtAvailabilityDto.fromJson(Map<String, dynamic> json) =>
      _$CourtAvailabilityDtoFromJson(json);
}

@freezed
abstract class AvailabilityCellDto with _$AvailabilityCellDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory AvailabilityCellDto({
    required String hour, // 'HH:MM'
    required String startsAt, // ISO
    required String endsAt,
    @Default(0) int price,
    @Default('available') String status, // available | booked | held | closed
  }) = _AvailabilityCellDto;

  factory AvailabilityCellDto.fromJson(Map<String, dynamic> json) =>
      _$AvailabilityCellDtoFromJson(json);
}
