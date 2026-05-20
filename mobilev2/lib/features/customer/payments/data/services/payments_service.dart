import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/payments/data/models/payment_dto.dart';

part 'payments_service.g.dart';

@RestApi()
abstract class PaymentsService {
  factory PaymentsService(Dio dio) = _PaymentsService;

  /// `POST /payments` — tạo payment intent cho 1 booking.
  /// Response có `redirectUrl` (VNPay/MoMo) hoặc `qrData` (ZaloPay).
  @POST('/payments')
  Future<PaymentDto> create(@Body() CreatePaymentRequest body);

  /// `GET /payments/:id` — poll status (đợi webhook).
  @GET('/payments/{id}')
  Future<PaymentDto> detail(@Path('id') String id);
}
