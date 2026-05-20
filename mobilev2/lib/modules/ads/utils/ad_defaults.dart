// ─────────────────────────────────────────────────────────────
// AD DEFAULTS — Chứa các giá trị ID test và cấu hình mặc định
// ─────────────────────────────────────────────────────────────

import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_placements.dart';

/// BẬT/TẮT lấy cấu hình từ Firebase Remote Config theo flavor.
/// - **dev**: false → dùng `kAdsDevConfig` (test IDs của Google).
/// - **stg/prod**: true → fetch config thật từ Firebase.
///
/// ⚠️ KHÔNG hardcode — nếu prod dùng test IDs sẽ vi phạm AdMob policy → BAN account.
bool get kUseRemoteConfig => !FlavorConfig.isDev;

/// Tắt hết — fallback khi parse Remote Config fail.
const kAdsDisabledConfig = AdConfig(showAllAds: false);

const kTestInterId = 'ca-app-pub-3940256099942544/1033173712';
const kTestAppOpenId = 'ca-app-pub-3940256099942544/9257395921';
const kTestNativeId = 'ca-app-pub-3940256099942544/2247696110';
const kTestBannerId = 'ca-app-pub-3940256099942544/6300978111';
const kTestRewardedId = 'ca-app-pub-3940256099942544/5224354917';

const _testInter = AdUnit(id: kTestInterId, enable: true);
const _testAppOpen = AdUnit(id: kTestAppOpenId, enable: true);
const _testNative = AdUnit(id: kTestNativeId, enable: true);
const _testBanner = AdUnit(id: kTestBannerId, enable: true);
const _testRewarded = AdUnit(id: kTestRewardedId, enable: true);

/// Cấu hình debug — đầy đủ test placement.
final kAdsDevConfig = AdConfig(
  showAllAds: true,
  useRemoteConfig: true,
  enableInter: true,
  enableAppOpen: true,
  enableRewarded: true,
  enableNative: true,
  enableNativeFull: true,
  enableBanner: true,
  nativeFullAfterInter: true,
  rules: const AdRules(
    interInterval: 15,
    appOpenInterval: 15,
    rewardedInterval: 30,
    nativeFullInterval: 30,
    maxInterPerSession: 5,
    maxRewardedPerSession: 5,
  ),
  inter: {InterPlacement.splash.key: _testInter, InterPlacement.afterQuiz.key: _testInter},
  appOpen: {AppOpenPlacement.splash.key: _testAppOpen, AppOpenPlacement.resume.key: _testAppOpen},
  rewarded: {RewardedPlacement.bonus.key: _testRewarded},
  native: {
    NativePlacement.afterInter.key: _testNative,
    NativePlacement.nativeFull.key: _testNative,
    NativePlacement.language.key: _testNative,
    NativePlacement.intro1.key: _testNative,
    NativePlacement.home.key: _testNative,
  },
  banner: {BannerPlacement.home.key: _testBanner},
);
