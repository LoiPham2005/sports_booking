import 'package:freezed_annotation/freezed_annotation.dart';

part 'sport_dto.freezed.dart';
part 'sport_dto.g.dart';

/// SportDto — khớp Prisma `Sport` model + aggregate `count` từ backend.
///
/// Field server: `nameVi`, `nameEn`, `icon`, `defaultSlotMinutes`, `isActive`.
/// Mock cũ chỉ có `name + icon + count` → adapter `toUi()` map về [Sport]
/// (UI model trong `shared/mock/mock_data.dart`) qua `nameVi`.
@freezed
abstract class SportDto with _$SportDto {
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory SportDto({
    required String id,
    required String slug,
    required String nameVi,
    required String nameEn,
    String? icon,
    @Default(60) int defaultSlotMinutes,
    @Default(true) bool isActive,
    @Default(0) int count,
  }) = _SportDto;

  factory SportDto.fromJson(Map<String, dynamic> json) =>
      _$SportDtoFromJson(json);
}
