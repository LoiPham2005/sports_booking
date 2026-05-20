import 'package:freezed_annotation/freezed_annotation.dart';

part 'review_dto.freezed.dart';
part 'review_dto.g.dart';

/// ReviewDto — khớp Prisma `Review` model.
/// API trả nested `user: { fullName, avatarUrl }` qua relation.
@freezed
abstract class ReviewDto with _$ReviewDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory ReviewDto({
    required String id,
    required String userId,
    required String venueId,
    required String bookingId,
    required int rating,
    String? content,
    String? ownerReply,
    String? ownerRepliedAt,
    @Default('VISIBLE') String status,
    required String createdAt,
    ReviewUserDto? user,
  }) = _ReviewDto;

  factory ReviewDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewDtoFromJson(json);
}

/// Slim user info gắn vào review qua relation include.
@freezed
abstract class ReviewUserDto with _$ReviewUserDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory ReviewUserDto({
    required String id,
    required String fullName,
    String? avatarUrl,
  }) = _ReviewUserDto;

  factory ReviewUserDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewUserDtoFromJson(json);
}
