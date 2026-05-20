import 'package:freezed_annotation/freezed_annotation.dart';

part 'payout_dto.freezed.dart';
part 'payout_dto.g.dart';

@freezed
abstract class PayoutSummary with _$PayoutSummary {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PayoutSummary({
    @Default(0) int pendingAmount,
    @Default(0) int pendingCount,
    @Default(0) int paidTotal,
    BankAccountInline? bankAccount,
    @Default([]) List<PayoutHistoryItem> history,
  }) = _PayoutSummary;

  factory PayoutSummary.fromJson(Map<String, dynamic> json) =>
      _$PayoutSummaryFromJson(json);
}

@freezed
abstract class BankAccountInline with _$BankAccountInline {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory BankAccountInline({
    required String id,
    required String bankCode,
    required String accountNumber,
    required String accountHolder,
  }) = _BankAccountInline;

  factory BankAccountInline.fromJson(Map<String, dynamic> json) =>
      _$BankAccountInlineFromJson(json);
}

@freezed
abstract class PayoutHistoryItem with _$PayoutHistoryItem {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory PayoutHistoryItem({
    required String id,
    required String periodFrom,
    required String periodTo,
    @Default(0) int amount,
    @Default('PENDING') String status,
    String? paidAt,
    required String createdAt,
  }) = _PayoutHistoryItem;

  factory PayoutHistoryItem.fromJson(Map<String, dynamic> json) =>
      _$PayoutHistoryItemFromJson(json);
}

// ─── Bank accounts CRUD ───

@freezed
abstract class BankAccountDto with _$BankAccountDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory BankAccountDto({
    required String id,
    required String bankCode,
    required String accountNumber,
    required String accountHolder,
    @Default(false) bool isDefault,
    required String createdAt,
  }) = _BankAccountDto;

  factory BankAccountDto.fromJson(Map<String, dynamic> json) =>
      _$BankAccountDtoFromJson(json);
}

@freezed
abstract class UpsertBankAccountRequest with _$UpsertBankAccountRequest {
  @JsonSerializable(fieldRename: FieldRename.none, includeIfNull: false)
  const factory UpsertBankAccountRequest({
    required String bankCode,
    required String accountNumber,
    required String accountHolder,
    bool? isDefault,
  }) = _UpsertBankAccountRequest;

  factory UpsertBankAccountRequest.fromJson(Map<String, dynamic> json) =>
      _$UpsertBankAccountRequestFromJson(json);
}
