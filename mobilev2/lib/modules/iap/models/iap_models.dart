/// Phân loại lỗi để UI hiển thị thông báo chính xác.
enum PurchaseErrorType {
  /// User huỷ giao dịch (không phải lỗi).
  cancelled,

  /// Thiết bị không cho phép mua (parental control, family sharing...).
  notAllowed,

  /// Yêu cầu mua hàng không hợp lệ.
  invalidPurchase,

  /// Lỗi mạng — gợi ý "Kiểm tra kết nối".
  network,

  /// Store (App Store/Play) tạm thời unavailable.
  storeUnavailable,

  /// IapService chưa được khởi tạo.
  notInitialized,

  /// Lỗi không xác định.
  unknown,
}

/// Kết quả sau mỗi lần purchase / restore.
class AppPurchaseResult {
  const AppPurchaseResult._({
    required this.isSuccess,
    this.errorType,
    this.message,
  });

  factory AppPurchaseResult.success([String? msg]) => AppPurchaseResult._(
        isSuccess: true,
        message: msg,
      );

  factory AppPurchaseResult.cancelled() => const AppPurchaseResult._(
        isSuccess: false,
        errorType: PurchaseErrorType.cancelled,
        message: 'Purchase cancelled',
      );

  factory AppPurchaseResult.error(
    String msg, {
    PurchaseErrorType type = PurchaseErrorType.unknown,
  }) =>
      AppPurchaseResult._(
        isSuccess: false,
        errorType: type,
        message: msg,
      );

  final bool isSuccess;

  /// null nếu success. Khi `isSuccess == false` → luôn có giá trị.
  final PurchaseErrorType? errorType;
  final String? message;

  bool get isCancelled => errorType == PurchaseErrorType.cancelled;
  bool get isError => !isSuccess && !isCancelled;

  @override
  String toString() => 'AppPurchaseResult('
      'success=$isSuccess, errorType=$errorType, msg=$message)';
}
