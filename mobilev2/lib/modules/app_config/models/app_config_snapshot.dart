import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_config_snapshot.freezed.dart';
part 'app_config_snapshot.g.dart';

/// Immutable snapshot của AppConfig — parse từ 1 JSON key duy nhất trên
/// Firebase Remote Config (`app_config`). Atomic update — không bao giờ
/// xảy ra trường hợp 1 field update trước, 1 field update sau.
///
/// 📦 Firebase Console — key `app_config` (String), giá trị JSON:
/// ```json
/// {
///   "maintenance_mode": false,
///   "maintenance_message": "Bảo trì 2h-4h sáng",
///   "notice_enabled": true,
///   "notice_title": "Khuyến mãi cuối tuần",
///   "notice_body": "Giảm 50%",
///   "notice_url": "https://example.com/promo",
///   "policy_url": "https://example.com/privacy",
///   "terms_url": "https://example.com/terms"
/// }
/// ```
///
/// 💡 Field nào không có trong JSON sẽ dùng `@Default(...)` — không cần
/// điền tất cả trên Firebase, chỉ điền cái cần override.
@freezed
abstract class AppConfigSnapshot with _$AppConfigSnapshot {

  const factory AppConfigSnapshot({
    @JsonKey(name: 'maintenance_mode') @Default(false) bool isMaintenance,
    @JsonKey(name: 'maintenance_message') @Default('') String maintenanceMessage,
    @JsonKey(name: 'notice_enabled') @Default(false) bool noticeEnabled,
    @JsonKey(name: 'notice_title') @Default('') String noticeTitle,
    @JsonKey(name: 'notice_body') @Default('') String noticeBody,
    @JsonKey(name: 'notice_url') @Default('') String noticeUrl,
    @JsonKey(name: 'policy_url') @Default('') String policyUrl,
    @JsonKey(name: 'terms_url') @Default('') String termsUrl,
  }) = _AppConfigSnapshot;
  const AppConfigSnapshot._();

  factory AppConfigSnapshot.fromJson(Map<String, dynamic> json) =>
      _$AppConfigSnapshotFromJson(json);

  /// `true` nếu notice nên hiển thị (enabled + có title).
  bool get hasNotice => noticeEnabled && noticeTitle.isNotEmpty;

  /// `true` nếu notice có CTA (clickable).
  bool get hasNoticeAction => hasNotice && noticeUrl.isNotEmpty;

  /// Snapshot rỗng — tất cả flag = false. Dùng làm fallback an toàn.
  static const empty = AppConfigSnapshot();
}
