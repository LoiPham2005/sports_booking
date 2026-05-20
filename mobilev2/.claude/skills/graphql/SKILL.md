---
name: graphql
description: GraphQL với graphql_flutter + graphql_codegen (type-safe). DI qua `@module GraphQLModule`, mỗi feature có `schema.graphql` + `*.graphql` queries → build_runner sinh class Options/Variables/Query. Đọc khi cần gọi GraphQL API thay vì REST, thêm endpoint mới, hoặc setup feature GraphQL cho dự án mới.
---

# GraphQL — `graphql_flutter` + `graphql_codegen`

## 🎯 Triết lý

✅ **DÙNG codegen** (không viết string + Map):
- Type-safe — `Variables$Query$GetCharacters(page: 1)` chứ không phải `{'page': 1}`
- Schema đổi → compile error báo ngay
- IDE autocomplete cho field/variable
- Vẫn linh hoạt — query là file `.graphql` riêng, sửa dễ

## 📂 Cấu trúc 1 feature GraphQL

```
features/_reference/character/                  ← reference đầy đủ
  data/
    schema.graphql                              ← subset schema (types ta dùng)
    queries/
      get_characters.graphql                    ← raw GraphQL query
      search_characters.graphql
      get_character.graphql
      ┗── *.graphql.dart                        ← AUTO-GEN (Options/Variables/Query classes)
    models/
      character_model.dart                      ← Freezed model (domain)
    services/
      character_service.dart                    ← Map generated types → CharacterModel
  presentation/
    providers/
      character_notifier.dart                   ← BaseNotifier — gọi service
    pages/
      character_list_page.dart
      character_detail_page.dart
```

## 🔌 DI: GraphQLClient

**Path**: `lib/core/data/network/graphql_module.dart`

```dart
@module
abstract class GraphQLModule {
  /// Đổi `false` khi backend nội bộ đã có /graphql.
  static const _useDemoEndpoint = true;
  static const _demoEndpoint = 'https://rickandmortyapi.com/graphql';

  static String get _endpointUrl => _useDemoEndpoint
      ? _demoEndpoint
      : '${FlavorConfig.current.apiBaseUrl}/graphql';

  @LazySingleton()
  GraphQLClient graphQLClient(SecureStorageService secureStorage) {
    final httpLink = HttpLink(_endpointUrl);
    final authLink = AuthLink(
      getToken: () async {
        final token = await secureStorage.read('access_token');
        return token != null ? 'Bearer $token' : null;
      },
    );
    return GraphQLClient(
      link: authLink.concat(httpLink),
      cache: GraphQLCache(store: InMemoryStore()),
      defaultPolicies: DefaultPolicies(
        query: Policies(fetch: FetchPolicy.networkOnly),
        mutate: Policies(fetch: FetchPolicy.networkOnly),
      ),
    );
  }
}
```

→ Service inject qua constructor: `CharacterService(this._client)` rồi `getIt<CharacterService>()`.

## 🔨 Build config

### `pubspec.yaml`
```yaml
dependencies:
  graphql_flutter: ^5.2.1

dev_dependencies:
  graphql_codegen: ^3.0.1
```

### `build.yaml`
```yaml
builders:
  graphql_codegen:
    generate_for:
      - lib/features/_reference/character/**     # ← thêm path feature mới
    options:
      scalars:
        ID:
          type: String
        DateTime:
          type: DateTime
          fromJsonFunctionName: DateTime.parse
          toJsonFunctionName: toIso8601String
      clients:
        - graphql_flutter
```

→ Mỗi feature GraphQL phải add vào `generate_for` (nếu không, file `.graphql.dart` không được sinh).

### Chạy gen
```bash
make gen      # = fvm dart run build_runner build --delete-conflicting-outputs
```

## 📝 Viết query

### 1. Schema (subset)
**`data/schema.graphql`**:
```graphql
type Query {
  characters(page: Int, filter: FilterCharacter): Characters
  character(id: ID!): Character
}

type Character {
  id: ID
  name: String
  status: String
  species: String
}

input FilterCharacter {
  name: String
}
```

→ **Tip**: với backend nội bộ, dùng GraphQL introspection để pull schema full:
```bash
npx graphql-cli get-schema -e prod
```

### 2. Query file
**`data/queries/get_characters.graphql`**:
```graphql
query GetCharacters($page: Int!) {
  characters(page: $page) {
    info { count pages next prev }
    results { id name status species image }
  }
}
```

### 3. Sau `make gen`
File `get_characters.graphql.dart` xuất hiện:
- `Query$GetCharacters` — root response type
- `Query$GetCharacters$characters$results` — nested type
- `Variables$Query$GetCharacters({required int page})`
- `Options$Query$GetCharacters(...)`
- Extension `query$GetCharacters` trên `GraphQLClient`

## 🧱 Service pattern

**`data/services/character_service.dart`**:
```dart
@LazySingleton()
class CharacterService {
  CharacterService(this._client);
  final GraphQLClient _client;

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
}
```

### ✅ Quy tắc service
1. **Map generated types → Domain model ở boundary** — presentation không biết về graphql_codegen
2. **`fetchPolicy` chuẩn**:
   - `FetchPolicy.networkOnly` — luôn fetch (mặc định an toàn)
   - `FetchPolicy.cacheAndNetwork` — show cache trước, refresh từ network
   - `FetchPolicy.cacheFirst` — chỉ fetch khi cache miss
3. **Throw `result.exception!`** khi `hasException` → notifier handle qua `runAsync`
4. **`whereType<Query$X$results>()`** filter null khỏi list (results là List<X?>)

## 🎯 Notifier pattern

**`presentation/providers/character_notifier.dart`**:
```dart
@riverpod
class CharacterNotifier extends _$CharacterNotifier
    with BaseNotifier<List<CharacterModel>> {
  late CharacterService _service;

  @override
  Future<List<CharacterModel>> build() async {
    _service = getIt<CharacterService>();           // ← KHÁC Retrofit: từ getIt
    return _service.getCharacters();
  }

  Future<void> refresh() => runAsync(
        action: _service.getCharacters,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  Future<void> search(String name) {
    if (name.trim().isEmpty) return refresh();
    return runAsync(
      action: () => _service.searchCharacters(name.trim()),
      cancelPrevious: true,
      keepPreviousOnLoading: true,
    );
  }
}
```

### Detail provider (family)
```dart
@riverpod
Future<CharacterModel> characterDetail(Ref ref, String id) async {
  return getIt<CharacterService>().getCharacter(id);
}

// Page:
ref.watch(characterDetailProvider(id));
ref.invalidate(characterDetailProvider(id));   // force refetch
```

### Khác Retrofit notifier?
**1 dòng duy nhất** — service resolve qua `getIt` thay vì `Service(ref.read(dioProvider))`, vì `GraphQLClient` là `@LazySingleton` được `@module` register, không phụ thuộc Riverpod scope.

## 🧪 Mutation pattern

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user { id name email }
  }
}
```

```dart
Future<AuthResponse> login(String email, String password) async {
  final result = await _client.mutate$Login(
    Options$Mutation$Login(
      variables: Variables$Mutation$Login(email: email, password: password),
    ),
  );
  if (result.hasException) throw result.exception!;
  final data = result.parsedData!.login;
  return AuthResponse(accessToken: data.accessToken, ...);
}
```

→ Notifier dùng `runAsync` với `successMessage` cho mutation:
```dart
Future<void> login(String email, String password) => runAsync(
      action: () => _service.login(email, password),
      successMessage: 'Đăng nhập thành công',
    );
```

## ⚠️ Lưu ý quan trọng

### Per-flavor endpoint
```dart
// graphql_module.dart
static String get _endpointUrl => switch (FlavorConfig.current.flavor) {
  AppFlavor.dev => 'https://api-dev.example.com/graphql',
  AppFlavor.stg => 'https://api-stg.example.com/graphql',
  AppFlavor.prod => 'https://api.example.com/graphql',
};
```

### Token refresh
`AuthLink.getToken` chạy mỗi request → đọc từ `SecureStorageService` luôn lấy token mới nhất. Khi 401:
- Notifier catch `OperationException` → check `graphqlErrors` có code `UNAUTHENTICATED` → trigger refresh-token flow → retry.
- Hoặc thêm custom `ErrorLink` trong chain.

### Cache invalidation
```dart
// Clear toàn bộ
_client.cache.store.reset();

// Manual write/read
_client.writeQuery(Options$Query$GetCharacters(...).asRequest, data: ...);
```

### Subscription (real-time)
Đổi link sang `Link.split` để chia HTTP/WebSocket:
```dart
final wsLink = WebSocketLink('wss://api/graphql');
final link = Link.split((req) => req.isSubscription, wsLink, httpLink);
```
→ Chưa setup trong v2 — thêm khi có nhu cầu.

## 🚀 Workflow tạo feature GraphQL mới

1. **Tạo thư mục**: `features/{name}/data/{queries,models,services}/`
2. **schema.graphql** — copy subset từ backend (introspect hoặc tay)
3. **{query_name}.graphql** — mỗi query 1 file
4. **build.yaml** — thêm path vào `graphql_codegen.generate_for`
5. **Model** — Freezed `XxxModel` (`fieldRename: FieldRename.none` cho GraphQL camelCase)
6. **`make gen`** — sinh `.graphql.dart`, `.freezed.dart`, `.g.dart`
7. **Service** — `@LazySingleton()`, inject `GraphQLClient`, map generated → model
8. **`make gen`** — register `XxxService` vào DI
9. **Notifier** — `@riverpod class XxxNotifier extends _$XxxNotifier with BaseNotifier<T>`, service từ `getIt`
10. **Page** — pattern như voucher (`HookConsumerWidget` + `useAsyncValueChange` + switch state)
11. **Route** — `@TypedGoRoute<XxxRoute>(path: '/x')` trong `lib/routes/config/app_routes.dart`
12. **`make gen`** lần cuối — sinh route mixin

## ❌ Anti-patterns

```dart
// ❌ String query thuần (mất type-safety)
const query = r'''query GetUser($id: ID!) { user(id: $id) { id name } }''';
await _client.query(QueryOptions(document: gql(query), variables: {'id': id}));

// ✅ Codegen
await _client.query$GetUser(
  Options$Query$GetUser(variables: Variables$Query$GetUser(id: id)),
);

// ❌ Trả thẳng generated type lên notifier/page
Future<Query$GetCharacters$characters?> getCharacters() async { ... }

// ✅ Map về domain model
Future<List<CharacterModel>> getCharacters() async { ... }

// ❌ Service biết Riverpod
class CharacterService {
  CharacterService(this._ref);
  final Ref _ref;
}

// ✅ Service chỉ biết GraphQLClient
class CharacterService {
  CharacterService(this._client);
  final GraphQLClient _client;
}

// ❌ Endpoint hard-code trong service
class CharacterService {
  final _client = GraphQLClient(link: HttpLink('https://...'), ...);
}

// ✅ Inject từ @module
class CharacterService {
  CharacterService(this._client);
  final GraphQLClient _client;   // từ getIt qua GraphQLModule
}
```

## 📂 Files quan trọng

| File | Mục đích |
|---|---|
| `lib/core/data/network/graphql_module.dart` | `@module GraphQLModule` đăng ký `GraphQLClient` |
| `lib/features/_reference/character/` | **Reference đầy đủ** — schema + 3 queries + service + notifier + 2 pages |
| `build.yaml` (section `graphql_codegen`) | Generator config + `generate_for` list |
| `pubspec.yaml` | `graphql_flutter` (dep) + `graphql_codegen` (dev_dep) |

## 🆚 So sánh với REST/Retrofit

| Aspect | REST (Retrofit) | GraphQL (codegen) |
|---|---|---|
| Service annotation | `@RestApi()` | `@LazySingleton()` |
| Endpoint def | `@GET('/url')` annotation | File `.graphql` riêng |
| Type-safe variables | `@Body() Req` Freezed | `Variables$Query$X` codegen |
| Response | `ApiResponse<T>` Freezed | `Query$X` codegen + map → Model |
| DI inject | `ref.read(dioProvider)` | `getIt<GraphQLClient>()` |
| Notifier method | `runUnwrap` (auto unwrap) | `runAsync` (service trả T) |
| Codegen | `retrofit_generator` | `graphql_codegen` |

→ Trong cùng 1 project có thể **mix cả 2** — REST cho endpoint truyền thống, GraphQL cho query phức tạp (multi-resource trong 1 request).
