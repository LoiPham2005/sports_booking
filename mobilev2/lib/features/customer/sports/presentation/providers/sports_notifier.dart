import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/models/sport_dto.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/services/sports_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'sports_notifier.g.dart';

/// SportsNotifier — list môn thể thao.
///
/// Pattern theo `lib/features/_reference/voucher/`:
/// - `@riverpod` + `BaseNotifier<List<Sport>>`
/// - State trả `Sport` (UI model gốc trong `shared/mock/mock_data.dart`)
///   để các widget có sẵn (`SportChip`, `home_tab`...) dùng được luôn.
/// - DTO chỉ tồn tại internal trong service — adapter `_toUi()` map qua.
///
/// Mock mode → trả thẳng `MockData.sports`.
@riverpod
class SportsNotifier extends _$SportsNotifier with BaseNotifier<List<Sport>> {
  late SportsService _service;

  @override
  Future<List<Sport>> build() async {
    _service = SportsService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<Sport>> _fetch() async {
    if (AppConfig.useMock) return MockData.sports;
    final dtos = await _service.getSports();
    return dtos.map(_toUi).toList();
  }

  Sport _toUi(SportDto dto) => Sport(
        slug: dto.slug,
        name: dto.nameVi,
        icon: dto.icon ?? '🏟️',
        count: dto.count,
      );

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );
}
