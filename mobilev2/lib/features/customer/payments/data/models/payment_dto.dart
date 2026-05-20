import 'package:freezed_annotation/freezed_annotation.dart';

part 'payment_dto.freezed.dart';
part 'payment_dto.g.dart';

/// PaymentDto — khớp Prisma `Payment` model.
///
/// `provider`: VNPAY | MOMO | ZALOPAY | STRIPE | BANK_TRANSFER | CASH
/// `status`: PENDING | SUCCESS | FAILED | CANCELLED | EXPIRED |
///           REFUND_PENDING | REFUNDED | PARTIALLY_REFUNDED
@freezed
abstract class PaymentDto with _$PaymentDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PaymentDto({
    required String id,
    String? bookingId,
    required String userId,
    required String provider,
    @Default(0) int amount,
    @Default('VND') String currency,
    @Default('PENDING') String status,
    String? providerRef,
    required String providerOrderId,
    String? redirectUrl,
    String? qrData,
    String? paidAt,
    String? failedReason,
    required String createdAt,
    String? updatedAt,
  }) = _PaymentDto;

  factory PaymentDto.fromJson(Map<String, dynamic> json) =>
      _$PaymentDtoFromJson(json);
}

/// Body `POST /payments`.
@freezed
abstract class CreatePaymentRequest with _$CreatePaymentRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory CreatePaymentRequest({
    required String bookingId,
    required String provider, // VNPAY | MOMO | ZALOPAY | ...
    String? returnUrl,
  }) = _CreatePaymentRequest;

  factory CreatePaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$CreatePaymentRequestFromJson(json);
}
