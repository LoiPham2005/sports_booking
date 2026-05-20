// 📁 lib/modules/iap/iap_service.dart
//
// IAP service backed by RevenueCat (purchases_flutter).
//
// ── SETUP ────────────────────────────────────────────────────
//   await getIt<IapService>().initialize();           // gọi 1 lần ở AppInitializer
//   await getIt<IapService>().initialize(userId: id); // khi login app
//
// ── KIỂM TRA PREMIUM ─────────────────────────────────────────
//   getIt<IapService>().isPremium
//   getIt<IapService>().premiumStream.listen(...)
//
// ── MUA / RESTORE ────────────────────────────────────────────
//   final result = await iap.purchasePackage(package);
//   final result = await iap.restorePurchases();
//
// ── LOGIN / LOGOUT ───────────────────────────────────────────
//   await iap.loginUser(userId);
//   await iap.logoutUser();

import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/common/constants/app_constants.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/iap/models/iap_models.dart';
import 'package:injectable/injectable.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

/// Real IapService — chỉ register cho prod/stg.
/// Dev flavor dùng [MockIapService] (xem `iap_service_mock.dart`).
@LazySingleton(env: ['prod', 'stg'])
class IapService {
  static const _tag = 'IAP';

  // ── State ────────────────────────────────────────────────────

  bool _isPremium = false;
  bool _isInitialized = false;

  /// ⚡ Race protection — 2 call đồng thời share chung Future.
  Future<void>? _initFuture;

  Offerings? _offerings;
  CustomerInfo? _customerInfo;

  bool get isPremium => _isPremium;
  bool get isInitialized => _isInitialized;
  Offerings? get offerings => _offerings;
  CustomerInfo? get customerInfo => _customerInfo;

  // ── Streams ──────────────────────────────────────────────────

  final _premiumCtrl = StreamController<bool>.broadcast();
  final _purchaseCtrl = StreamController<AppPurchaseResult>.broadcast();

  Stream<bool> get premiumStream => _premiumCtrl.stream;
  Stream<AppPurchaseResult> get purchaseStream => _purchaseCtrl.stream;

  /// ⚡ Listener reference — phải lưu để remove khi dispose.
  CustomerInfoUpdateListener? _customerInfoListener;

  // ── Init ──────────────────────────────────────────────────────

  /// Idempotent + race-safe. Gọi đồng thời → cả 2 await chung 1 Future.
  Future<void> initialize({String? userId}) async {
    if (_isInitialized) return;
    final pending = _initFuture;
    if (pending != null) return pending;

    final future = _doInitialize(userId: userId);
    _initFuture = future;
    try {
      await future;
    } finally {
      // Cho phép retry nếu init fail.
      if (!_isInitialized) _initFuture = null;
    }
  }

  Future<void> _doInitialize({String? userId}) async {
    final apiKey = _apiKey;
    if (apiKey == null) {
      Logger.error(
        'RevenueCat API key missing (using placeholders?). IAP will not work.',
        tag: _tag,
      );
      return;
    }

    try {
      if (FlavorConfig.isDev) await Purchases.setLogLevel(LogLevel.debug);

      final cfg = PurchasesConfiguration(apiKey);
      if (userId?.isNotEmpty == true) cfg.appUserID = userId;
      await Purchases.configure(cfg);

      _isInitialized = true;

      // Lưu reference để remove khi dispose.
      _customerInfoListener = _updateStatus;
      Purchases.addCustomerInfoUpdateListener(_customerInfoListener!);

      await Future.wait<void>([
        Purchases.getCustomerInfo().then(_updateStatus),
        fetchOfferings().then((_) {}),
      ]);
      Logger.success('IAP ready. Premium: $_isPremium', tag: _tag);
    } catch (e, s) {
      _isInitialized = false;
      Logger.error('IAP init failed', error: e, stackTrace: s, tag: _tag);
    }
  }

  // ── Offerings ────────────────────────────────────────────────

  Future<bool> fetchOfferings() async {
    if (!_isInitialized) {
      Logger.warning(
        'fetchOfferings: IAP not initialized. Check your API keys.',
        tag: _tag,
      );
      return false;
    }
    try {
      _offerings = await Purchases.getOfferings();
      final count = _offerings?.current?.availablePackages.length ?? 0;
      Logger.info('Offerings: $count packages', tag: _tag);
      return count > 0;
    } catch (e, s) {
      Logger.error(
        'fetchOfferings failed',
        error: e,
        stackTrace: s,
        tag: _tag,
      );
      return false;
    }
  }

  // ── Purchase & Restore ────────────────────────────────────────

  Future<AppPurchaseResult> purchasePackage(
    Package package, {
    PromotionalOffer? offer,
  }) async {
    if (!_isInitialized) {
      return AppPurchaseResult.error(
        'IAP not initialized',
        type: PurchaseErrorType.notInitialized,
      );
    }

    try {
      Logger.info('Purchasing: ${package.identifier}', tag: _tag);

      final info = offer != null
          // ignore: deprecated_member_use
          ? (await Purchases.purchaseDiscountedPackage(package, offer))
              .customerInfo
          // ignore: deprecated_member_use
          : (await Purchases.purchasePackage(package)).customerInfo;

      final result = _updateStatus(info)
          ? AppPurchaseResult.success()
          : AppPurchaseResult.error(
              'Premium not activated',
              type: PurchaseErrorType.unknown,
            );

      _purchaseCtrl.add(result);
      return result;
    } on PlatformException catch (e) {
      final result = _mapPurchaseError(
        PurchasesErrorHelper.getErrorCode(e),
        e,
      );
      _purchaseCtrl.add(result);
      return result;
    } catch (e, s) {
      Logger.error('Purchase failed', error: e, stackTrace: s, tag: _tag);
      final result = AppPurchaseResult.error('Purchase failed: $e');
      _purchaseCtrl.add(result);
      return result;
    }
  }

  Future<AppPurchaseResult> restorePurchases() async {
    if (!_isInitialized) {
      return AppPurchaseResult.error(
        'IAP not initialized',
        type: PurchaseErrorType.notInitialized,
      );
    }

    try {
      Logger.info('Restoring purchases…', tag: _tag);
      final info = await Purchases.restorePurchases();
      final ok = _updateStatus(info);
      Logger.info('Restore done. Premium=$ok', tag: _tag);
      return ok
          ? AppPurchaseResult.success('Purchases restored')
          : AppPurchaseResult.error(
              'No active subscriptions found',
              type: PurchaseErrorType.invalidPurchase,
            );
    } catch (e, s) {
      Logger.error('Restore failed', error: e, stackTrace: s, tag: _tag);
      return AppPurchaseResult.error(
        'Restore failed: $e',
        type: PurchaseErrorType.network,
      );
    }
  }

  // ── User ──────────────────────────────────────────────────────

  Future<void> loginUser(String userId) async {
    if (!_isInitialized) return;
    try {
      _updateStatus((await Purchases.logIn(userId)).customerInfo);
    } catch (e, s) {
      Logger.error('Login failed', error: e, stackTrace: s, tag: _tag);
    }
  }

  Future<void> logoutUser() async {
    if (!_isInitialized) return;
    try {
      final info = await Purchases.logOut();
      _updateStatus(info);
      // ⚡ Clear cached per-user data — user mới sẽ fetch lại offerings của họ.
      _offerings = null;
    } catch (e, s) {
      Logger.error('Logout failed', error: e, stackTrace: s, tag: _tag);
    }
  }

  // ── Dispose (auto-called by getIt.reset(dispose: true)) ─────

  @disposeMethod
  Future<void> dispose() async {
    final listener = _customerInfoListener;
    if (listener != null) {
      Purchases.removeCustomerInfoUpdateListener(listener);
      _customerInfoListener = null;
    }
    await _premiumCtrl.close();
    await _purchaseCtrl.close();
    Logger.info('IapService disposed', tag: _tag);
  }

  // ── Private ───────────────────────────────────────────────────

  String? get _apiKey {
    final key = Platform.isAndroid
        ? AppConstants.revenueCatGoogleKey
        : Platform.isIOS
            ? AppConstants.revenueCatAppleKey
            : null;
    if (key == null || key.isEmpty || key.contains('placeholder')) return null;
    return key;
  }

  /// Cập nhật trạng thái premium. Trả về trạng thái mới.
  bool _updateStatus(CustomerInfo info) {
    _customerInfo = info;
    final active =
        info.entitlements.all[AppConstants.premiumEntitlement]?.isActive ??
            false;
    if (_isPremium != active) {
      _isPremium = active;
      _premiumCtrl.add(_isPremium);
      Logger.info('Premium → $_isPremium', tag: _tag);
    }
    return _isPremium;
  }

  /// Map RevenueCat error code → AppPurchaseResult với type rõ ràng.
  AppPurchaseResult _mapPurchaseError(
    PurchasesErrorCode code,
    PlatformException e,
  ) =>
      switch (code) {
        PurchasesErrorCode.purchaseCancelledError =>
          AppPurchaseResult.cancelled(),
        PurchasesErrorCode.purchaseNotAllowedError => AppPurchaseResult.error(
            'Purchases not allowed on this device',
            type: PurchaseErrorType.notAllowed,
          ),
        PurchasesErrorCode.purchaseInvalidError => AppPurchaseResult.error(
            'Invalid purchase. Please try again',
            type: PurchaseErrorType.invalidPurchase,
          ),
        PurchasesErrorCode.networkError => AppPurchaseResult.error(
            'Network error. Check your connection',
            type: PurchaseErrorType.network,
          ),
        PurchasesErrorCode.storeProblemError => AppPurchaseResult.error(
            'Store unavailable. Try again later',
            type: PurchaseErrorType.storeUnavailable,
          ),
        _ => AppPurchaseResult.error('Purchase failed: ${e.message}'),
      };
}
