import 'package:freezed_annotation/freezed_annotation.dart';

part 'common_param.freezed.dart';
part 'common_param.g.dart';

@freezed
abstract class CommonParam with _$CommonParam {
  const factory CommonParam({
    @JsonKey(name: 'page') @Default(1) int page,
    @JsonKey(name: 'per_page') @Default(20) int perPage,
    @JsonKey(name: 'sort') String? sort,
    @JsonKey(name: 'order') String? order,
    @JsonKey(name: 'q') String? query,
  }) = _CommonParam;

  factory CommonParam.fromJson(Map<String, dynamic> json) =>
      _$CommonParamFromJson(json);
}
