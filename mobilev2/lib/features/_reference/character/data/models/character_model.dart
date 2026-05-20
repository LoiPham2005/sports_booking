import 'package:freezed_annotation/freezed_annotation.dart';

part 'character_model.freezed.dart';
part 'character_model.g.dart';

/// Domain model — không phụ thuộc graphql_codegen.
///
/// Service map từ generated types (Query$GetCharacters$...) sang model này
/// ở boundary data → presentation chỉ thấy class sạch.
@freezed
abstract class CharacterModel with _$CharacterModel {
  // GraphQL trả camelCase — bỏ snake auto-rename.
  @JsonSerializable(fieldRename: FieldRename.none)
  const factory CharacterModel({
    required String id,
    required String name,
    @Default('') String status,
    @Default('') String species,
    @Default('') String gender,
    @Default('') String image,
    @Default('') String type,
    DateTime? created,
  }) = _CharacterModel;

  factory CharacterModel.fromJson(Map<String, dynamic> json) =>
      _$CharacterModelFromJson(json);
}
