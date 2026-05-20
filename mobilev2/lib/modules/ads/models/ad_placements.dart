// ─────────────────────────────────────────────────────────────
// AD PLACEMENTS — Định nghĩa các vị trí quảng cáo trong App
//
// Cách dùng:
//   adManager.showInter(InterPlacement.splash);
//   NativeAdWidget(placement: NativePlacement.language);
//
// Placement động chưa khai báo (A/B test, experimental):
//   adManager.showInter(const RawPlacement('experimental_v2'));
//
// Lookup từ Map<String, AdUnit>:
//   final unit = cfg.inter.byPlacement(InterPlacement.splash);
// ─────────────────────────────────────────────────────────────

/// Interface chung cho mọi placement key — enum khai báo sẵn lẫn raw string.
abstract interface class PlacementKey {
  String get key;
}

/// Mixin cho enum placement.
mixin _EnumPlacementKey on Enum implements PlacementKey {
  @override
  String toString() => key;
}

/// Placement động — dùng khi key chưa được khai báo enum.
class RawPlacement implements PlacementKey {
  const RawPlacement(this.key);

  @override
  final String key;

  @override
  String toString() => key;

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is PlacementKey && other.key == key);

  @override
  int get hashCode => key.hashCode;
}

// ─────────────────────────────────────────────────────────────

enum InterPlacement with _EnumPlacementKey {
  splash('splash'),
  afterQuiz('after_quiz');

  const InterPlacement(this.key);
  @override
  final String key;
}

enum AppOpenPlacement with _EnumPlacementKey {
  splash('splash'),
  resume('resume');

  const AppOpenPlacement(this.key);
  @override
  final String key;
}

enum RewardedPlacement with _EnumPlacementKey {
  bonus('bonus');

  const RewardedPlacement(this.key);
  @override
  final String key;
}

enum NativePlacement with _EnumPlacementKey {
  afterInter('after_inter'),   // tự động hiện sau inter
  nativeFull('native_full'),   // gọi thủ công bất kỳ chỗ nào
  language('language'),
  intro1('intro_1'),
  home('home');

  const NativePlacement(this.key);
  @override
  final String key;
}

enum BannerPlacement with _EnumPlacementKey {
  home('home');

  const BannerPlacement(this.key);
  @override
  final String key;
}

// ─────────────────────────────────────────────────────────────

extension PlacementMapX<T> on Map<String, T> {
  T? byPlacement(PlacementKey placement) => this[placement.key];
  bool hasPlacement(PlacementKey placement) => containsKey(placement.key);
}
