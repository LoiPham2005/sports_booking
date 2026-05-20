import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/payments/data/models/payment_dto.dart';
import 'package:sports_booking_mobile/features/customer/payments/data/services/payments_service.dart';

part 'payments_notifier.g.dart';

/// PaymentNotifier — tạo payment + poll status.
///
/// Flow `booking_result_page.dart`:
///   1. `create(bookingId, provider)` → trả PaymentDto + redirectUrl/qrData
///   2. UI redirect/render QR cho user thanh toán
///   3. Sau callback về app, page gọi `poll(id)` mỗi 3s tối đa 60s
///      đợi `status == SUCCESS`.
@riverpod
class PaymentFlowNotifier extends _$PaymentFlowNotifier
    with BaseNotifier<PaymentDto?> {
  late PaymentsService _service;

  @override
  Future<PaymentDto?> build() async {
    _service = PaymentsService(ref.read(dioProvider));
    return null;
  }

  Future<PaymentDto?> create({
    required String bookingId,
    required String provider,
  }) async {
    PaymentDto? out;
    await runAsync(
      action: () async {
        if (AppConfig.useMock) {
          out = PaymentDto(
            id: 'mock-payment-${DateTime.now().millisecondsSinceEpoch}',
            bookingId: bookingId,
            userId: 'mock-user',
            provider: provider,
            amount: 300000,
            status: 'PENDING',
            providerOrderId: 'mock-order',
            createdAt: DateTime.now().toIso8601String(),
          );
          return out;
        }
        out = await _service.create(
          CreatePaymentRequest(bookingId: bookingId, provider: provider),
        );
        return out;
      },
      errorMessage: 'Khởi tạo thanh toán thất bại',
    );
    return out;
  }
}

/// Provider family — poll payment status mỗi lần được watch.
/// Page có thể `ref.invalidate(paymentDetailProvider(id))` để refresh.
@riverpod
Future<PaymentDto> paymentDetail(Ref ref, String id) async {
  if (AppConfig.useMock) {
    return PaymentDto(
      id: id,
      userId: 'mock-user',
      provider: 'VNPAY',
      amount: 300000,
      status: 'SUCCESS',
      providerOrderId: 'mock-order',
      paidAt: DateTime.now().toIso8601String(),
      createdAt: DateTime.now().toIso8601String(),
    );
  }
  final service = PaymentsService(ref.read(dioProvider));
  return service.detail(id);
}
