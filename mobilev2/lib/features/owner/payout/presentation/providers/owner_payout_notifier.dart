import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/owner/payout/data/models/payout_dto.dart';
import 'package:sports_booking_mobile/features/owner/payout/data/services/owner_payout_service.dart';

part 'owner_payout_notifier.g.dart';

@riverpod
class OwnerPayoutNotifier extends _$OwnerPayoutNotifier
    with BaseNotifier<PayoutSummary> {
  late OwnerPayoutService _service;

  @override
  Future<PayoutSummary> build() async {
    _service = OwnerPayoutService(ref.read(dioProvider));
    return _fetch();
  }

  Future<PayoutSummary> _fetch() async {
    if (AppConfig.useMock) {
      return const PayoutSummary(
        pendingAmount: 8500000,
        pendingCount: 12,
        paidTotal: 42000000,
        bankAccount: BankAccountInline(
          id: 'mock-1',
          bankCode: 'VCB',
          accountNumber: '1024567890',
          accountHolder: 'NGUYEN VAN A',
        ),
        history: [
          PayoutHistoryItem(
            id: 'p1',
            periodFrom: '2026-04-01',
            periodTo: '2026-04-30',
            amount: 18500000,
            status: 'PAID',
            paidAt: '2026-05-02T10:00:00.000Z',
            createdAt: '2026-05-01T00:00:00.000Z',
          ),
        ],
      );
    }
    return _service.getPayoutSummary();
  }

  Future<void> refresh() => runAsync(action: _fetch, keepPreviousOnLoading: true);

  Future<void> requestPayout() => runAsync(
        action: () async {
          if (!AppConfig.useMock) await _service.requestPayout();
          return _fetch();
        },
        successMessage: 'Đã gửi yêu cầu chuyển tiền',
        errorMessage: 'Yêu cầu thất bại',
        keepPreviousOnLoading: true,
      );
}

@riverpod
class OwnerBankAccountsNotifier extends _$OwnerBankAccountsNotifier
    with BaseNotifier<List<BankAccountDto>> {
  late OwnerPayoutService _service;

  @override
  Future<List<BankAccountDto>> build() async {
    _service = OwnerPayoutService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<BankAccountDto>> _fetch() async {
    if (AppConfig.useMock) {
      return const [
        BankAccountDto(
          id: 'mock-1',
          bankCode: 'VCB',
          accountNumber: '1024567890',
          accountHolder: 'NGUYEN VAN A',
          isDefault: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        ),
      ];
    }
    return _service.listBankAccounts();
  }

  Future<void> refresh() => runAsync(action: _fetch, keepPreviousOnLoading: true);

  Future<void> create(UpsertBankAccountRequest body) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.createBankAccount(body);
          }
          return _fetch();
        },
        successMessage: 'Đã thêm tài khoản',
        errorMessage: 'Thêm thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> setDefault(String id) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.setDefaultBankAccount(id);
          }
          return _fetch();
        },
        successMessage: 'Đã đặt mặc định',
        errorMessage: 'Đặt mặc định thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> delete(String id) => runAsync(
        action: () async {
          if (!AppConfig.useMock) await _service.deleteBankAccount(id);
          return _fetch();
        },
        successMessage: 'Đã xoá tài khoản',
        errorMessage: 'Xoá thất bại',
        keepPreviousOnLoading: true,
      );
}
