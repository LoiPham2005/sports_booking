// 📁 lib/modules/iap/iap_service_mock.dart
//
// Mock IapService — KHÔNG cần RevenueCat API key.
// Test UI flow purchase/restore mà không tốn tiền & không cần Google Play setup.
//
// Cơ chế DI: register cho dev flavor qua `@LazySingleton(as: IapService, env: ['dev'])`.
// Khi chạy `flutter run --flavor dev` → getIt<IapService>() trả về MockIapService.
// Khi chạy prod/stg → IapService thật (gọi RevenueCat).

import 'dart:async';

import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/iap/iap_service.dart';
import 'package:sports_booking_mobile/modules/iap/models/iap_models.dart';
import 'package:injectable/injectable.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

@LazySingleton(as: IapService, env: ['dev'])
class MockIapService implements IapService {
  static const _tag = 'IAP-MOCK';

  bool _isPremium = false;
  final _premiumCtrl = StreamController<bool>.broadcast();
  final _purchaseCtrl = StreamController<AppPurchaseResult>.broadcast();

  /// 🧪 Test setup — đặt result tuỳ ý cho lần purchase tiếp theo.
  /// `null` (mặc định) → success. Dùng để simulate error/cancel UI flow.
  AppPurchaseResult? _nextResult;

  // ── Getters ─────────────────────────────────────────────────

  @override
  bool get isPremium => _isPremium;

  @override
  bool get isInitialized => true;

  /// Mock không có offerings thật — UI nên dùng `mockPackages` ở dưới.
  @override
  Offerings? get offerings => null;

  @override
  CustomerInfo? get customerInfo => null;

  // ── Streams ─────────────────────────────────────────────────

  @override
  Stream<bool> get premiumStream => _premiumCtrl.stream;

  @override
  Stream<AppPurchaseResult> get purchaseStream => _purchaseCtrl.stream;

  // ── Lifecycle ───────────────────────────────────────────────

  @override
  Future<void> initialize({String? userId}) async {
    Logger.success(
      '🧪 MockIapService ready (no real RevenueCat). userId=$userId',
      tag: _tag,
    );
  }

  @override
  Future<void> dispose() async {
    await _premiumCtrl.close();
    await _purchaseCtrl.close();
    Logger.info('MockIapService disposed', tag: _tag);
  }

  // ── Offerings ───────────────────────────────────────────────

  @override
  Future<bool> fetchOfferings() async {
    Logger.info(
      'Mock fetchOfferings → 0 packages. Dùng `mockPackages` để render UI dev.',
      tag: _tag,
    );
    return false;
  }

  // ── Purchase & Restore ──────────────────────────────────────

  @override
  Future<AppPurchaseResult> purchasePackage(
    Package package, {
    PromotionalOffer? offer,
  }) async {
    Logger.info('Mock purchase: ${package.identifier}', tag: _tag);
    await Future<void>.delayed(const Duration(seconds: 1)); // simulate network

    // ⚡ Nếu test set _nextResult → dùng (consume 1 lần), ngược lại default success.
    final pending = _nextResult;
    _nextResult = null;

    final result =
        pending ?? AppPurchaseResult.success('Mock purchase successful');
    if (result.isSuccess) _setPremium(true);
    _purchaseCtrl.add(result);
    return result;
  }

  @override
  Future<AppPurchaseResult> restorePurchases() async {
    Logger.info('Mock restore…', tag: _tag);
    await Future<void>.delayed(const Duration(milliseconds: 500));

    final pending = _nextResult;
    _nextResult = null;
    if (pending != null) return pending;

    _setPremium(true);
    return AppPurchaseResult.success('Mock restored');
  }

  // ── User ────────────────────────────────────────────────────

  @override
  Future<void> loginUser(String userId) async {
    Logger.info('Mock loginUser: $userId', tag: _tag);
  }

  @override
  Future<void> logoutUser() async {
    Logger.info('Mock logoutUser → reset premium', tag: _tag);
    _setPremium(false);
  }

  // ── Test helpers ────────────────────────────────────────────

  /// 🧪 Đặt result giả cho lần `purchasePackage`/`restorePurchases`/`mockPurchase` kế tiếp.
  /// Dùng để test UI error/cancel flow:
  /// ```dart
  /// final svc = getIt<IapService>() as MockIapService;
  /// svc.setNextResult(AppPurchaseResult.cancelled());
  /// await iap.purchasePackage(...);   // → cancelled
  /// ```
  void setNextResult(AppPurchaseResult result) => _nextResult = result;

  /// 🧪 Reset premium về false — dùng cho test/debug.
  void resetPremium() {
    Logger.info('🔄 Mock reset premium → false', tag: _tag);
    _setPremium(false);
  }

  /// 🧪 Danh sách packages giả để render UI Premium khi chạy dev.
  /// UI Premium page nên check `svc is MockIapService` để dùng list này.
  List<MockPremiumPackage> get mockPackages => const [
        MockPremiumPackage(
          id: 'premium_monthly',
          title: 'Gói tháng',
          description: 'Truy cập toàn bộ tính năng Premium trong 1 tháng',
          priceString: '49.000 đ',
        ),
        MockPremiumPackage(
          id: 'premium_yearly',
          title: 'Gói năm',
          description: 'Tiết kiệm 50%! Truy cập toàn bộ tính năng Premium 1 năm',
          priceString: '299.000 đ',
          badge: 'TIẾT KIỆM 50%',
        ),
        MockPremiumPackage(
          id: 'premium_lifetime',
          title: 'Trọn đời',
          description: 'Mua 1 lần — dùng vĩnh viễn. Không hết hạn.',
          priceString: '999.000 đ',
          badge: 'TỐT NHẤT',
        ),
      ];

  /// 🧪 Mua mock package qua ID. UI gọi method này thay vì `purchasePackage`.
  Future<AppPurchaseResult> mockPurchase(String packageId) async {
    Logger.info('Mock purchase package: $packageId', tag: _tag);
    await Future<void>.delayed(const Duration(seconds: 1));

    final pending = _nextResult;
    _nextResult = null;

    final result =
        pending ?? AppPurchaseResult.success('Mock purchase successful');
    if (result.isSuccess) _setPremium(true);
    _purchaseCtrl.add(result);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────

  void _setPremium(bool value) {
    if (_isPremium != value) {
      _isPremium = value;
      _premiumCtrl.add(_isPremium);
      Logger.info('Mock Premium → $_isPremium', tag: _tag);
    }
  }
}

/// 🧪 Package data class cho mock — không phụ thuộc RevenueCat SDK.
class MockPremiumPackage {
  const MockPremiumPackage({
    required this.id,
    required this.title,
    required this.description,
    required this.priceString,
    this.badge,
  });

  final String id;
  final String title;
  final String description;
  final String priceString;
  final String? badge;
}
