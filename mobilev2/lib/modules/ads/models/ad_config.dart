import 'package:sports_booking_mobile/modules/ads/utils/ad_defaults.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'ad_config.freezed.dart';
part 'ad_config.g.dart';

@freezed
abstract class AdUnit with _$AdUnit {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory AdUnit({
    @Default('') String id,
    @Default('') String id2,
    bool? useId2, // null=follow global, true=luôn id2, false=luôn id
    @Default(true) bool enable,
  }) = _AdUnit;

  const AdUnit._();

  factory AdUnit.fromJson(Map<String, dynamic> json) => _$AdUnitFromJson(json);
}

extension AdUnitX on AdUnit {
  String get resolvedId => id;
}

// ─────────────────────────────────────────────────────────────────

/// Frequency cap rules — global cho mọi placement của 1 type.
@freezed
abstract class AdRules with _$AdRules {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory AdRules({
    @Default(30) int interInterval,
    @Default(30) int appOpenInterval,
    @Default(30) int rewardedInterval,
    @Default(30) int nativeFullInterval,
    @Default(3) int maxInterPerSession,
    @Default(5) int maxRewardedPerSession,
  }) = _AdRules;

  const AdRules._();

  factory AdRules.fromJson(Map<String, dynamic> json) => _$AdRulesFromJson(json);
}

// ─────────────────────────────────────────────────────────────────

/// Cấu hình ads — Map theo type × placement.
///
/// JSON Remote Config:
/// ```json
/// {
///   "show_all_ads": true,
///   "enable_app_open": true,
///   "native_full_after_inter": true,
///   "rules": { "inter_interval": 30, "max_inter_per_session": 3, ... },
///   "inter":     { "splash": {...}, "after_quiz": {...} },
///   "app_open":  { "splash": {...}, "resume": {...} },
///   "rewarded":  { "bonus": {...} },
///   "native":    { "language": {...}, "intro_1": {...}, "after_inter": {...} },
///   "banner":    { "home": {...} }
/// }
/// ```
///
/// Thêm placement mới = chỉ thêm key vào Firebase, không sửa Dart code.
@freezed
abstract class AdConfig with _$AdConfig {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory AdConfig({
    /// Nếu false → bỏ qua Remote Config, dùng kAdsDevConfig (ad_defaults).
    @Default(true) bool showAllAds,
    @Default(true) bool useRemoteConfig,
    @Default(true) bool enableInter,
    @Default(true) bool enableAppOpen,
    @Default(true) bool enableRewarded,
    @Default(true) bool enableNative,
    @Default(true) bool enableNativeFull,
    @Default(true) bool enableBanner,
    @Default(true) bool nativeFullAfterInter,
    @Default(AdRules()) AdRules rules,
    @Default({}) Map<String, AdUnit> inter,
    @Default({}) Map<String, AdUnit> appOpen,
    @Default({}) Map<String, AdUnit> rewarded,
    @Default({}) Map<String, AdUnit> native,
    @Default({}) Map<String, AdUnit> banner,
  }) = _AdConfig;

  const AdConfig._();

  factory AdConfig.fromJson(Map<String, dynamic> json) => _$AdConfigFromJson(json);

  /// Fallback khi parse thất bại — tắt hết ads.
  factory AdConfig.disabled() => kAdsDisabledConfig;

  /// Cấu hình dùng cho Development (Test IDs).
  factory AdConfig.development() => kAdsDevConfig;
}

extension AdConfigX on AdConfig {
  bool get canShowAds => showAllAds;

  bool unitEnabled(AdUnit? unit) =>
      canShowAds && (unit?.enable ?? false) && (unit?.id.isNotEmpty ?? false);

  /// Tổng số placement đã config (cho diagnostic).
  int get totalPlacements =>
      inter.length + appOpen.length + rewarded.length + native.length + banner.length;
}
