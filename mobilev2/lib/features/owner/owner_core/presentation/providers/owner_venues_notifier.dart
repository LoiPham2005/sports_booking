import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/venues/presentation/providers/venues_notifier.dart';
import 'package:sports_booking_mobile/features/owner/owner_core/data/models/owner_dtos.dart';
import 'package:sports_booking_mobile/features/owner/owner_core/data/services/owner_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'owner_venues_notifier.g.dart';

/// OwnerVenuesNotifier — danh sách venues owner sở hữu.
@riverpod
class OwnerVenuesNotifier extends _$OwnerVenuesNotifier
    with BaseNotifier<List<Venue>> {
  late OwnerService _service;

  @override
  Future<List<Venue>> build() async {
    _service = OwnerService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<Venue>> _fetch() async {
    if (AppConfig.useMock) return MockData.venues.take(3).toList();
    final list = await _service.listVenues();
    return list.map(venueDtoToUi).toList();
  }

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<Venue?> create(CreateVenueRequest body) async {
    Venue? out;
    await runAsync(
      action: () async {
        if (AppConfig.useMock) {
          final mock = MockData.venues.first;
          out = mock;
          final current = state.value ?? <Venue>[];
          return [...current, mock];
        }
        final dto = await _service.createVenue(body);
        final ui = venueDtoToUi(dto);
        out = ui;
        return [...(state.value ?? []), ui];
      },
      successMessage: 'Đã tạo venue',
      errorMessage: 'Tạo venue thất bại',
      keepPreviousOnLoading: true,
    );
    return out;
  }

  /// Submit venue DRAFT → PENDING (chờ Admin duyệt).
  Future<void> submit(String venueId) => runAsync(
        action: () async {
          if (!AppConfig.useMock) await _service.submitVenue(venueId);
          return _fetch();
        },
        successMessage: 'Đã gửi duyệt',
        errorMessage: 'Gửi duyệt thất bại',
        keepPreviousOnLoading: true,
      );
}
