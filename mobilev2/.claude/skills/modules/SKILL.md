---
name: modules
description: Feature modules trong lib/modules/ — Ads (AdMob), IAP (RevenueCat), Analytics (Firebase), AppConfig (Remote Config). Đọc khi cần show quảng cáo, track event, mua premium, đọc maintenance mode hoặc notice banner.
---

# Modules — Ads / IAP / Analytics / AppConfig

## 📋 Tổng quan

| Module | Path | Plugin | Tự init? |
|---|---|---|---|
| `AdManager` | `modules/ads/` | google_mobile_ads | ✅ Qua AppInitializer |
| `IapService` | `modules/iap/` | purchases_flutter | ✅ Qua AppInitializer |
| `AnalyticsService` | `modules/analytics/` | firebase_analytics | Manual |
| `AppConfigService` | `modules/app_config/` | firebase_remote_config | ✅ Qua AppInitializer |

## 📢 AdsModule (AdManager)

**Path**: `lib/modules/ads/`

### Structure (16 files)
```
ads/
├── models/
│   ├── ad_config.dart          # @freezed AdConfig + AdRules
│   └── ad_placements.dart      # Enum placements (Inter/AppOpen/Rewarded/Native/Banner)
├── utils/
│   ├── ad_defaults.dart        # Test IDs + kUseRemoteConfig flag
│   └── ad_sizes.dart           # Adaptive banner sizes
├── services/
│   ├── ad_cache_service.dart   # Cache ads + TTL 1h
│   ├── ad_config_service.dart  # Firebase Remote Config (single key `ad_config`)
│   ├── ad_stats_service.dart   # In-memory stats + Firebase Analytics
│   ├── ad_manager.dart         # ⭐ Facade chính
│   └── handlers/
│       ├── full_screen_ad_handler.dart  # Base class
│       ├── inter_handler.dart
│       ├── app_open_handler.dart
│       └── rewarded_handler.dart
├── observers/
│   └── ad_lifecycle_observer.dart  # AppLifecycle → AppOpen ad
└── widgets/
    ├── ad_banner_widget.dart
    ├── native_ad_widget.dart
    └── native_ad_full_screen.dart
```

### Public API

```dart
final ads = getIt<AdManager>();

// Interstitial
await ads.showInter(InterPlacement.afterAction, onDismissed: () { ... });

// App Open (auto từ AppLifecycleObserver)
await ads.showAppOpen(AppOpenPlacement.resume);

// Rewarded
await ads.showRewarded(
  RewardedPlacement.bonus,
  onEarnedReward: (reward) => print('+${reward.amount} ${reward.type}'),
);

// Native widget
const NativeAdWidget(placement: NativePlacement.home, size: NativeAdSize.medium)

// Banner widget
const AdBannerWidget(placement: BannerPlacement.home)
```

### Placements (`ad_placements.dart`)

```dart
enum InterPlacement { splash('splash'), afterAction('after_action'), ... }
enum AppOpenPlacement { splash('splash'), resume('resume') }
enum RewardedPlacement { bonus('bonus') }
enum NativePlacement { afterInter('after_inter'), home('home'), language('language'), ... }
enum BannerPlacement { home('home') }

// A/B test dynamic placement
adManager.showInter(const RawPlacement('experimental_v2'));
```

### Native setup
- **Android**: `AndroidManifest.xml` có `<meta-data com.google.android.gms.ads.APPLICATION_ID>` (đang dùng test ID)
- **iOS**: `Info.plist` có `GADApplicationIdentifier` + `SKAdNetworkItems` + `NSUserTrackingUsageDescription`
- **MainActivity.kt** / **AppDelegate.swift**: register native factories `nativeMedium` / `nativeSmall` (đã có)
- **Layout XML**: `android/app/src/main/res/layout/native_ad_*.xml` (đã có)
- **iOS XIB**: `ios/Runner/NativeAd*View.xib` (đã có)

### ⚠️ Production checklist (khi release)

1. Thay test App ID → App ID thật ở `AndroidManifest.xml` + `Info.plist`
2. Setup Firebase Remote Config key `ad_config` (JSON với AdConfig schema)
3. `kUseRemoteConfig` đã flavor-aware (`!FlavorConfig.isDev`) — prod sẽ fetch
4. Setup AdMob → tạo Ad Units thật, paste IDs vào RemoteConfig

## 💳 IapService — RevenueCat

**Path**: `lib/modules/iap/`

### DI env-aware

```dart
@LazySingleton(env: ['prod', 'stg'])
class IapService { ... }  // Real RevenueCat

@LazySingleton(as: IapService, env: ['dev'])
class MockIapService implements IapService { ... }  // Mock cho dev
```

→ Inject 1 chỗ, flavor quyết định instance.

### Setup
```dart
// AppInitializer tự gọi:
await getIt<IapService>().initialize();
// hoặc với user ID:
await getIt<IapService>().initialize(userId: 'user_123');
```

### Premium status

```dart
final iap = getIt<IapService>();

iap.isPremium;                                    // bool snapshot
iap.premiumStream.listen((p) => print('Premium: $p'));  // reactive
```

### Purchase + Restore

```dart
final result = await iap.purchasePackage(package);

switch (result.errorType) {
  case null:                                return 'Mua thành công';
  case PurchaseErrorType.cancelled:         return null;
  case PurchaseErrorType.network:           return 'Kiểm tra mạng';
  case PurchaseErrorType.storeUnavailable:  return 'Store tạm sự cố';
  case PurchaseErrorType.notAllowed:        return 'Thiết bị không cho phép';
  default: return result.message;
}

// Restore
final result = await iap.restorePurchases();
if (result.isSuccess) { /* re-grant premium */ }
```

### Mock test (dev flavor)

```dart
final mock = getIt<IapService>() as MockIapService;

// Simulate cancel
mock.setNextResult(AppPurchaseResult.cancelled());
await iap.purchasePackage(pkg); // → cancelled

// Simulate network error
mock.setNextResult(AppPurchaseResult.error(
  'No internet',
  type: PurchaseErrorType.network,
));

// Mock packages cho UI dev
mock.mockPackages; // List<MockPremiumPackage>
```

### Production keys

```dart
// lib/core/common/constants/app_constants.dart
revenueCatGoogleKey = 'goog_xxx';       // thay placeholder
revenueCatAppleKey = 'appl_xxx';
premiumEntitlement = 'premium';          // match RevenueCat dashboard
```

## 📊 AnalyticsService

**Path**: `lib/modules/analytics/analytics_service.dart`

```dart
final analytics = getIt<AnalyticsService>();

// Custom event
await analytics.logEvent(
  name: 'tutorial_complete',
  parameters: {'step': 5},
);

// Helpers
await analytics.logButtonClick(buttonName: 'cta_buy_premium');
await analytics.logScreenView('home');
await analytics.setUserId('user_123');

// Ad revenue (Firebase Ad Revenue spec)
await analytics.logAdRevenuePaid(
  value: 0.50,
  currency: 'USD',
  adPlatform: 'AdMob',
  adSource: 'AdMob',
  adUnitName: 'inter_home',
  adFormat: 'inter',
);

// FirebaseAnalyticsObserver cho GoRouter (track screen views auto)
final observer = analytics.observer;
```

→ Auto check `FlavorConfig.current.enableAnalytics` — disable ở dev.

## ⚙️ AppConfigService

**Path**: `lib/modules/app_config/`

### Firebase Remote Config schema (1 key duy nhất)

**Key**: `app_config` (String, JSON)
```json
{
  "maintenance_mode": false,
  "maintenance_message": "Bảo trì 2h-4h sáng",
  "notice_enabled": true,
  "notice_title": "🎉 Khuyến mãi cuối tuần",
  "notice_body": "Giảm 50%",
  "notice_url": "https://example.com/promo",
  "policy_url": "https://example.com/privacy",
  "terms_url": "https://example.com/terms"
}
```

### Toggle local mode

**Path**: `lib/modules/app_config/utils/app_config_defaults.dart`
```dart
const bool kUseAppRemoteConfig = true;  // false → dùng kAppConfigDev (no Firebase)
```

### Use — generic

```dart
final cfg = getIt<AppConfigService>();

if (cfg.isMaintenance) {
  return MaintenanceScreen(message: cfg.maintenanceMessage);
}

if (cfg.hasNotice) {
  showNoticeBanner(
    title: cfg.noticeTitle,
    body: cfg.noticeBody,
    onTap: cfg.hasNoticeAction ? () => launchUrl(cfg.noticeUrl) : null,
  );
}

// Custom feature flag
final showNewUi = cfg.getBool('show_new_checkout_ui');
final maxItems = cfg.getInt('max_cart_items');
```

### Use — reactive với Riverpod

```dart
class HomePage extends HookConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final cfg = ref.watch(appConfigSnapshotProvider).valueOrNull
        ?? AppConfigSnapshot.empty;

    if (cfg.isMaintenance) return MaintenanceScreen(...);
    // ...
  }
}
```

### Pull to refresh

```dart
RefreshIndicator(
  onRefresh: () => getIt<AppConfigService>().refresh(),
  child: ...,
)
```

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `lib/modules/ads/services/ad_manager.dart` | AdManager facade |
| `lib/modules/ads/models/ad_placements.dart` | Placement enums |
| `lib/modules/iap/iap_service.dart` | Real RevenueCat |
| `lib/modules/iap/iap_service_mock.dart` | Mock cho dev |
| `lib/modules/iap/models/iap_models.dart` | AppPurchaseResult + PurchaseErrorType |
| `lib/modules/analytics/analytics_service.dart` | Firebase Analytics wrapper |
| `lib/modules/app_config/services/app_config_service.dart` | RemoteConfig wrapper |
| `lib/modules/app_config/models/app_config_snapshot.dart` | Freezed snapshot |
| `lib/modules/app_config/providers/app_config_provider.dart` | Riverpod stream provider |
| `lib/modules/app_config/utils/app_config_defaults.dart` | Toggle + fallback |

## ❌ Anti-patterns

```dart
// ❌ Không check premium trước khi show ads
adManager.showInter(InterPlacement.splash);

// ✅ Skip ads nếu user premium
if (!getIt<IapService>().isPremium) {
  await adManager.showInter(InterPlacement.splash);
}

// ❌ Hard-code maintenance message
const message = 'App đang bảo trì';

// ✅ Đọc từ AppConfigService
final cfg = getIt<AppConfigService>();
final message = cfg.maintenanceMessage;

// ❌ Tạo Firebase Analytics instance mới
FirebaseAnalytics.instance.logEvent(...)

// ✅ Dùng AnalyticsService (tự skip nếu dev)
getIt<AnalyticsService>().logEvent(name: ...)
```
