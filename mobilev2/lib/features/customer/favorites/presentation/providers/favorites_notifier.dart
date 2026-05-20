import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/favorites/data/services/favorites_service.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/presentation/providers/venues_notifier.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'favorites_notifier.g.dart';

/// FavoritesNotifier — danh sách venue user yêu thích.
///
/// State `List<Venue>` (UI). Mock mode dùng in-memory set + lấy 4 venue đầu.
@riverpod
class FavoritesNotifier extends _$FavoritesNotifier
    with BaseNotifier<List<Venue>> {
  late FavoritesService _service;
  final Set<String> _mockFavIds = MockData.venues.take(4).map((v) => v.id).toSet();

  @override
  Future<List<Venue>> build() async {
    _service = FavoritesService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<Venue>> _fetch() async {
    if (AppConfig.useMock) {
      return MockData.venues.where((v) => _mockFavIds.contains(v.id)).toList();
    }
    final list = await _service.getFavorites();
    return list
        .map((row) => VenueDto.fromJson(row['venue'] as Map<String, dynamic>))
        .map(venueDtoToUi)
        .toList();
  }

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  /// Toggle favorite cho 1 venue — optimistic update.
  Future<void> toggle(String venueId) async {
    final current = state.value ?? [];
    final isFav = current.any((v) => v.id == venueId);

    // Optimistic local update.
    if (isFav) {
      state = AsyncData(current.where((v) => v.id != venueId).toList());
      _mockFavIds.remove(venueId);
    } else {
      final venue = MockData.venues.firstWhere(
        (v) => v.id == venueId,
        orElse: () => MockData.venues.first,
      );
      state = AsyncData([...current, venue]);
      _mockFavIds.add(venueId);
    }

    if (AppConfig.useMock) return;

    try {
      if (isFav) {
        await _service.removeFavorite(venueId);
      } else {
        await _service.addFavorite(venueId);
      }
    } catch (_) {
      // Rollback nếu API fail.
      state = AsyncData(current);
      if (isFav) {
        _mockFavIds.add(venueId);
      } else {
        _mockFavIds.remove(venueId);
      }
      rethrow;
    }
  }

  bool isFavorite(String venueId) =>
      state.value?.any((v) => v.id == venueId) ?? false;
}
