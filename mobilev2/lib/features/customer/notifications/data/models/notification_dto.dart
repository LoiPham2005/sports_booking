import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_dto.freezed.dart';
part 'notification_dto.g.dart';

/// NotificationDto — khớp Prisma `Notification` model.
/// `read` được derive từ `readAt != null` ở UI.
@freezed
abstract class NotificationDto with _$NotificationDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory NotificationDto({
    required String id,
    required String userId,
    required String type, // payment_success / promo / reminder / review ...
    required String title,
    String? body,
    Map<String, dynamic>? dataJson,
    String? readAt,
    required String createdAt,
  }) = _NotificationDto;

  factory NotificationDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationDtoFromJson(json);
}
