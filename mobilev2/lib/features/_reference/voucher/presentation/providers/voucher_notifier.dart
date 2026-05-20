import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/errors/failures.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/features/_reference/voucher/data/models/voucher_model.dart';
import 'package:sports_booking_mobile/features/_reference/voucher/data/services/voucher_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'voucher_notifier.g.dart';

/// Reference Notifier — pattern chuẩn để follow theo
@riverpod
class VoucherNotifier extends _$VoucherNotifier
    with BaseNotifier<List<VoucherModel>> {
  late VoucherService _service;

  @override
  Future<List<VoucherModel>> build() async {
    _service = VoucherService(ref.read(dioProvider));
    return _fetchList();
  }

  Future<List<VoucherModel>> _fetchList() async {
    final response = await _service.getVouchers();
    if (!response.isSuccess || response.data == null) {
      throw ServerFailure(response.message ?? 'Lỗi tải voucher');
    }
    return response.data!;
  }

  Future<void> refresh() => runAsync(
        action: _fetchList,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> search(String query) => runAsync(
        action: () async {
          if (query.isEmpty) return _fetchList();
          final response = await _service.searchVouchers(query);
          if (!response.isSuccess || response.data == null) {
            throw ServerFailure(response.message ?? 'Lỗi tìm kiếm');
          }
          return response.data!;
        },
        cancelPrevious: true,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );
}
