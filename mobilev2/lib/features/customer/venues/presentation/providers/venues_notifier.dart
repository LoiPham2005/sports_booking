import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/models/venue_dto.dart';
import 'package:sports_booking_mobile/features/customer/venues/data/services/venues_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'venues_notifier.g.dart';

/// Filter cho venues list (immutable — search/filter rebuild qua copyWith).
class VenuesFilter {
  const VenuesFilter({
    this.query,
    this.sportSlug,
    this.city,
    this.sortBy,
  });

  final String? query;
  final String? sportSlug;
  final String? city;

  /// 'rating' | 'newest' | 'distance' (cần lat/lng) — null = default backend.
  final String? sortBy;

  VenuesFilter copyWith({
    String? query,
    String? sportSlug,
    String? city,
    String? sortBy,
  }) =>
      VenuesFilter(
        query: query ?? this.query,
        sportSlug: sportSlug ?? this.sportSlug,
        city: city ?? this.city,
        sortBy: sortBy ?? this.sortBy,
      );
}

/// Adapter `VenueDto` → `Venue` (UI model gốc trong shared/mock).
Venue venueDtoToUi(VenueDto dto) => Venue(
      id: dto.id,
      name: dto.name,
      address: dto.addressLine,
      city: dto.city,
      district: dto.district ?? '',
      sports: dto.sports.map((s) => s.slug).toList(),
      priceFrom: dto.priceFrom ?? 0,
      rating: dto.ratingAvg,
      reviewCount: dto.ratingCount,
      distance: dto.distance ?? 0,
      image: _pickPrimaryImage(dto),
      amenities: dto.amenities.map((a) => a.slug).toList(),
      description: dto.description ?? '',
      lat: dto.lat,
      lng: dto.lng,
    );

String _pickPrimaryImage(VenueDto dto) {
  if (dto.images.isEmpty) return '';
  final primary = dto.images.where((i) => i.isPrimary);
  if (primary.isNotEmpty) return primary.first.url;
  return dto.images.first.url;
}

/// VenuesNotifier — list + search + filter venues cho Customer browse.
///
/// Pattern theo `lib/features/_reference/voucher/`:
/// - State `List<Venue>` (UI model gốc — page tiêu thụ không cần convert)
/// - `apply(filter)` cho search/filter (cancelPrevious + keepPrevious)
/// - `refresh()` reload với filter hiện tại
@riverpod
class VenuesNotifier extends _$VenuesNotifier with BaseNotifier<List<Venue>> {
  late VenuesService _service;
  VenuesFilter _filter = const VenuesFilter();

  @override
  Future<List<Venue>> build() async {
    _service = VenuesService(ref.read(dioProvider));
    return _fetch(_filter);
  }

  Future<List<Venue>> _fetch(VenuesFilter f) async {
    if (AppConfig.useMock) return _filterMock(f);

    final res = await _service.getVenues(
      q: f.query,
      sportSlug: f.sportSlug,
      city: f.city,
      sortBy: f.sortBy,
      limit: 20,
    );
    return res.data.map(venueDtoToUi).toList();
  }

  /// Apply filter mới — search/filter UI gọi qua đây.
  Future<void> apply(VenuesFilter filter) {
    _filter = filter;
    return runAsync(
      action: () => _fetch(filter),
      cancelPrevious: true,
      keepPreviousOnLoading: true,
      emitEmptyForEmptyList: true,
    );
  }

  Future<void> refresh() => runAsync(
        action: () => _fetch(_filter),
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  List<Venue> _filterMock(VenuesFilter f) {
    final q = f.query?.toLowerCase().trim() ?? '';
    var list = MockData.venues.where((v) {
      final keep = q.isEmpty ||
          v.name.toLowerCase().contains(q) ||
          v.address.toLowerCase().contains(q) ||
          v.district.toLowerCase().contains(q);
      final sportOk = f.sportSlug == null || v.sports.contains(f.sportSlug);
      final cityOk = f.city == null || v.city == f.city;
      return keep && sportOk && cityOk;
    }).toList();

    if (f.sortBy == 'rating') {
      list.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (f.sortBy == 'distance') {
      list.sort((a, b) => a.distance.compareTo(b.distance));
    }
    return list;
  }
}

/// Featured venues — top N rating cho home_tab.
@riverpod
Future<List<Venue>> featuredVenues(Ref ref, {int limit = 6}) async {
  if (AppConfig.useMock) {
    final list = [...MockData.venues]
      ..sort((a, b) => b.rating.compareTo(a.rating));
    return list.take(limit).toList();
  }
  final service = VenuesService(ref.read(dioProvider));
  final res = await service.getVenues(sortBy: 'rating', limit: limit);
  return res.data.map(venueDtoToUi).toList();
}
