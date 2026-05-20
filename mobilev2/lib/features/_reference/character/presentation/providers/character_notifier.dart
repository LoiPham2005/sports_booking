import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/models/character_model.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/services/character_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'character_notifier.g.dart';

/// Reference GraphQL Notifier — pattern chuẩn để follow theo.
///
/// Khác Retrofit notifier 1 chỗ duy nhất: service resolve từ `getIt`
/// thay vì `XxxService(ref.read(dioProvider))` — vì GraphQLClient là
/// singleton được register qua `@module GraphQLModule`.
@riverpod
class CharacterNotifier extends _$CharacterNotifier
    with BaseNotifier<List<CharacterModel>> {
  late CharacterService _service;

  @override
  Future<List<CharacterModel>> build() async {
    _service = getIt<CharacterService>();
    return _service.getCharacters();
  }

  Future<void> refresh() => runAsync(
        action: _service.getCharacters,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> search(String name) {
    final trimmed = name.trim();
    if (trimmed.isEmpty) return refresh();

    return runAsync(
      action: () => _service.searchCharacters(trimmed),
      cancelPrevious: true,
      keepPreviousOnLoading: true,
      emitEmptyForEmptyList: true,
    );
  }
}

/// Detail provider — family theo character id.
@riverpod
Future<CharacterModel> characterDetail(Ref ref, String id) async {
  final service = getIt<CharacterService>();
  return service.getCharacter(id);
}
