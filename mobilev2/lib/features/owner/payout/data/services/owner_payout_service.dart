import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/owner/payout/data/models/payout_dto.dart';

part 'owner_payout_service.g.dart';

@RestApi()
abstract class OwnerPayoutService {
  factory OwnerPayoutService(Dio dio) = _OwnerPayoutService;

  /// `GET /owner/payout` — pending balance + bank account + history.
  @GET('/owner/payout')
  Future<PayoutSummary> getPayoutSummary();

  /// `POST /owner/payout/request` — owner request chuyển ngay.
  @POST('/owner/payout/request')
  Future<void> requestPayout();

  // ─── Bank accounts CRUD ───

  @GET('/owner/bank-accounts')
  Future<List<BankAccountDto>> listBankAccounts();

  @POST('/owner/bank-accounts')
  Future<BankAccountDto> createBankAccount(@Body() UpsertBankAccountRequest body);

  @PATCH('/owner/bank-accounts/{id}/default')
  Future<BankAccountDto> setDefaultBankAccount(@Path('id') String id);

  @DELETE('/owner/bank-accounts/{id}')
  Future<void> deleteBankAccount(@Path('id') String id);
}
