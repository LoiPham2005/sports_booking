import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:sports_booking_mobile/features/customer/sports/data/models/sport_dto.dart';

part 'court_dto.freezed.dart';
part 'court_dto.g.dart';

/// CourtDto — khớp Prisma `Court` model.
///
/// Surface = enum string (NATURAL_GRASS/ARTIFICIAL_GRASS/WOOD/EPOXY/CLAY/
/// RUBBER/CONCRETE). UI map qua label tiếng Việt qua bảng SURFACES_LABEL.
@freezed
abstract class CourtDto with _$CourtDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory CourtDto({
    required String id,
    required String venueId,
    required String sportId,
    required String name,
    required String surface,
    @Default(false) bool indoor,
    @Default(10) int capacity,
    @Default(60) int slotDurationMinutes,
    @Default(true) bool isActive,
    SportDto? sport,
  }) = _CourtDto;

  factory CourtDto.fromJson(Map<String, dynamic> json) =>
      _$CourtDtoFromJson(json);
}

/// Surface enum label (vi) — dùng ở UI hiện danh sách sân.
const courtSurfaceLabel = <String, String>{
  'NATURAL_GRASS': 'Cỏ tự nhiên',
  'ARTIFICIAL_GRASS': 'Cỏ nhân tạo',
  'WOOD': 'Sàn gỗ',
  'EPOXY': 'Sơn epoxy',
  'CLAY': 'Đất nện',
  'RUBBER': 'Cao su',
  'CONCRETE': 'Bê tông',
};
