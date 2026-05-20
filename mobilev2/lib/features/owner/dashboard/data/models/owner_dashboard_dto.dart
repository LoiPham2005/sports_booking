import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/features/customer/bookings/data/models/booking_dto.dart';

part 'owner_dashboard_dto.freezed.dart';
part 'owner_dashboard_dto.g.dart';

/// Response `GET /owner/dashboard?date=`.
/// Backend aggregate KPI cho overview tab.
@freezed
abstract class OwnerDashboardDto with _$OwnerDashboardDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory OwnerDashboardDto({
    @Default(0) int venueCount,
    @Default(0) int revenueToday,
    @Default(0) int bookingsToday,
    @Default(0) int revenueMonth,
    @Default(0) double revenueMonthDelta,
    @Default(0) double occupancyToday,
    @Default(0) double ratingAvg,
    @Default([]) List<BookingDto> recentBookings,
    @Default([]) List<int> revenueLast7Days,
    @Default([]) List<TopCustomerDto> topCustomers,
  }) = _OwnerDashboardDto;

  factory OwnerDashboardDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerDashboardDtoFromJson(json);
}

@freezed
abstract class TopCustomerDto with _$TopCustomerDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory TopCustomerDto({
    required String name,
    @Default(0) int bookings,
    @Default(0) int total,
  }) = _TopCustomerDto;

  factory TopCustomerDto.fromJson(Map<String, dynamic> json) =>
      _$TopCustomerDtoFromJson(json);
}
