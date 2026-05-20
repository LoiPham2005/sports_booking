import 'package:sports_booking_mobile/features/_reference/character/data/models/character_model.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/queries/get_character.graphql.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/queries/get_characters.graphql.dart';
import 'package:sports_booking_mobile/features/_reference/character/data/queries/search_characters.graphql.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:injectable/injectable.dart';

/// GraphQL service dùng types AUTO-GENERATED bởi graphql_codegen.
///
/// So với raw GraphQL (string + Map):
///   ✅ Type-safe — variables là class, autocomplete IDE
///   ✅ Schema đổi → compile error báo ngay
///   ✅ Không phải parse JSON tay
///
/// Pattern: service map generated types → domain model ở boundary.
/// Presentation không biết gì về graphql_codegen.
@LazySingleton()
class CharacterService {
  CharacterService(this._client);

  final GraphQLClient _client;

  /// GET list characters (paginated).
  Future<List<CharacterModel>> getCharacters({int page = 1}) async {
    final result = await _client.query$GetCharacters(
      Options$Query$GetCharacters(
        variables: Variables$Query$GetCharacters(page: page),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) throw result.exception!;

    final results = result.parsedData?.characters?.results ?? [];
    return results
        .whereType<Query$GetCharacters$characters$results>()
        .map((c) => CharacterModel(
              id: c.id ?? '',
              name: c.name ?? '',
              status: c.status ?? '',
              species: c.species ?? '',
              gender: c.gender ?? '',
              image: c.image ?? '',
            ))
        .toList();
  }

  /// SEARCH characters by name (filter).
  Future<List<CharacterModel>> searchCharacters(String name) async {
    final result = await _client.query$SearchCharacters(
      Options$Query$SearchCharacters(
        variables: Variables$Query$SearchCharacters(name: name),
      ),
    );

    if (result.hasException) throw result.exception!;

    final results = result.parsedData?.characters?.results ?? [];
    return results
        .whereType<Query$SearchCharacters$characters$results>()
        .map((c) => CharacterModel(
              id: c.id ?? '',
              name: c.name ?? '',
              status: c.status ?? '',
              species: c.species ?? '',
              gender: c.gender ?? '',
              image: c.image ?? '',
            ))
        .toList();
  }

  /// GET detail 1 character.
  Future<CharacterModel> getCharacter(String id) async {
    final result = await _client.query$GetCharacter(
      Options$Query$GetCharacter(
        variables: Variables$Query$GetCharacter(id: id),
      ),
    );

    if (result.hasException) throw result.exception!;

    final data = result.parsedData?.character;
    if (data == null) {
      throw Exception('Character $id không tồn tại');
    }
    return CharacterModel(
      id: data.id ?? id,
      name: data.name ?? '',
      status: data.status ?? '',
      species: data.species ?? '',
      gender: data.gender ?? '',
      image: data.image ?? '',
      type: data.type ?? '',
      created: data.created == null ? null : DateTime.tryParse(data.created!),
    );
  }
}
