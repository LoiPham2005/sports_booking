import 'dart:async';
import 'package:flutter/widgets.dart' as widgets;
import 'package:gql/ast.dart';
import 'package:graphql/client.dart' as graphql;
import 'package:graphql_flutter/graphql_flutter.dart' as graphql_flutter;

class Variables$Query$GetCharacters {
  factory Variables$Query$GetCharacters({required int page}) =>
      Variables$Query$GetCharacters._({r'page': page});

  Variables$Query$GetCharacters._(this._$data);

  factory Variables$Query$GetCharacters.fromJson(Map<String, dynamic> data) {
    final result$data = <String, dynamic>{};
    final l$page = data['page'];
    result$data['page'] = (l$page as int);
    return Variables$Query$GetCharacters._(result$data);
  }

  Map<String, dynamic> _$data;

  int get page => (_$data['page'] as int);

  Map<String, dynamic> toJson() {
    final result$data = <String, dynamic>{};
    final l$page = page;
    result$data['page'] = l$page;
    return result$data;
  }

  CopyWith$Variables$Query$GetCharacters<Variables$Query$GetCharacters>
  get copyWith => CopyWith$Variables$Query$GetCharacters(this, (i) => i);

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Variables$Query$GetCharacters ||
        runtimeType != other.runtimeType) {
      return false;
    }
    final l$page = page;
    final lOther$page = other.page;
    if (l$page != lOther$page) {
      return false;
    }
    return true;
  }

  @override
  int get hashCode {
    final l$page = page;
    return Object.hashAll([l$page]);
  }
}

abstract class CopyWith$Variables$Query$GetCharacters<TRes> {
  factory CopyWith$Variables$Query$GetCharacters(
    Variables$Query$GetCharacters instance,
    TRes Function(Variables$Query$GetCharacters) then,
  ) = _CopyWithImpl$Variables$Query$GetCharacters;

  factory CopyWith$Variables$Query$GetCharacters.stub(TRes res) =
      _CopyWithStubImpl$Variables$Query$GetCharacters;

  TRes call({int? page});
}

class _CopyWithImpl$Variables$Query$GetCharacters<TRes>
    implements CopyWith$Variables$Query$GetCharacters<TRes> {
  _CopyWithImpl$Variables$Query$GetCharacters(this._instance, this._then);

  final Variables$Query$GetCharacters _instance;

  final TRes Function(Variables$Query$GetCharacters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({Object? page = _undefined}) => _then(
    Variables$Query$GetCharacters._({
      ..._instance._$data,
      if (page != _undefined && page != null) 'page': (page as int),
    }),
  );
}

class _CopyWithStubImpl$Variables$Query$GetCharacters<TRes>
    implements CopyWith$Variables$Query$GetCharacters<TRes> {
  _CopyWithStubImpl$Variables$Query$GetCharacters(this._res);

  TRes _res;

  call({int? page}) => _res;
}

class Query$GetCharacters {
  Query$GetCharacters({this.characters, this.$__typename = 'Query'});

  factory Query$GetCharacters.fromJson(Map<String, dynamic> json) {
    final l$characters = json['characters'];
    final l$$__typename = json['__typename'];
    return Query$GetCharacters(
      characters: l$characters == null
          ? null
          : Query$GetCharacters$characters.fromJson(
              (l$characters as Map<String, dynamic>),
            ),
      $__typename: (l$$__typename as String),
    );
  }

  final Query$GetCharacters$characters? characters;

  final String $__typename;

  Map<String, dynamic> toJson() {
    final _resultData = <String, dynamic>{};
    final l$characters = characters;
    _resultData['characters'] = l$characters?.toJson();
    final l$$__typename = $__typename;
    _resultData['__typename'] = l$$__typename;
    return _resultData;
  }

  @override
  int get hashCode {
    final l$characters = characters;
    final l$$__typename = $__typename;
    return Object.hashAll([l$characters, l$$__typename]);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Query$GetCharacters || runtimeType != other.runtimeType) {
      return false;
    }
    final l$characters = characters;
    final lOther$characters = other.characters;
    if (l$characters != lOther$characters) {
      return false;
    }
    final l$$__typename = $__typename;
    final lOther$$__typename = other.$__typename;
    if (l$$__typename != lOther$$__typename) {
      return false;
    }
    return true;
  }
}

extension UtilityExtension$Query$GetCharacters on Query$GetCharacters {
  CopyWith$Query$GetCharacters<Query$GetCharacters> get copyWith =>
      CopyWith$Query$GetCharacters(this, (i) => i);
}

abstract class CopyWith$Query$GetCharacters<TRes> {
  factory CopyWith$Query$GetCharacters(
    Query$GetCharacters instance,
    TRes Function(Query$GetCharacters) then,
  ) = _CopyWithImpl$Query$GetCharacters;

  factory CopyWith$Query$GetCharacters.stub(TRes res) =
      _CopyWithStubImpl$Query$GetCharacters;

  TRes call({Query$GetCharacters$characters? characters, String? $__typename});
  CopyWith$Query$GetCharacters$characters<TRes> get characters;
}

class _CopyWithImpl$Query$GetCharacters<TRes>
    implements CopyWith$Query$GetCharacters<TRes> {
  _CopyWithImpl$Query$GetCharacters(this._instance, this._then);

  final Query$GetCharacters _instance;

  final TRes Function(Query$GetCharacters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({
    Object? characters = _undefined,
    Object? $__typename = _undefined,
  }) => _then(
    Query$GetCharacters(
      characters: characters == _undefined
          ? _instance.characters
          : (characters as Query$GetCharacters$characters?),
      $__typename: $__typename == _undefined || $__typename == null
          ? _instance.$__typename
          : ($__typename as String),
    ),
  );

  CopyWith$Query$GetCharacters$characters<TRes> get characters {
    final local$characters = _instance.characters;
    return local$characters == null
        ? CopyWith$Query$GetCharacters$characters.stub(_then(_instance))
        : CopyWith$Query$GetCharacters$characters(
            local$characters,
            (e) => call(characters: e),
          );
  }
}

class _CopyWithStubImpl$Query$GetCharacters<TRes>
    implements CopyWith$Query$GetCharacters<TRes> {
  _CopyWithStubImpl$Query$GetCharacters(this._res);

  TRes _res;

  call({Query$GetCharacters$characters? characters, String? $__typename}) =>
      _res;

  CopyWith$Query$GetCharacters$characters<TRes> get characters =>
      CopyWith$Query$GetCharacters$characters.stub(_res);
}

const documentNodeQueryGetCharacters = DocumentNode(
  definitions: [
    OperationDefinitionNode(
      type: OperationType.query,
      name: NameNode(value: 'GetCharacters'),
      variableDefinitions: [
        VariableDefinitionNode(
          variable: VariableNode(name: NameNode(value: 'page')),
          type: NamedTypeNode(name: NameNode(value: 'Int'), isNonNull: true),
          defaultValue: DefaultValueNode(value: null),
          directives: [],
        ),
      ],
      directives: [],
      selectionSet: SelectionSetNode(
        selections: [
          FieldNode(
            name: NameNode(value: 'characters'),
            alias: null,
            arguments: [
              ArgumentNode(
                name: NameNode(value: 'page'),
                value: VariableNode(name: NameNode(value: 'page')),
              ),
            ],
            directives: [],
            selectionSet: SelectionSetNode(
              selections: [
                FieldNode(
                  name: NameNode(value: 'info'),
                  alias: null,
                  arguments: [],
                  directives: [],
                  selectionSet: SelectionSetNode(
                    selections: [
                      FieldNode(
                        name: NameNode(value: 'count'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'pages'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'next'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'prev'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: '__typename'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                    ],
                  ),
                ),
                FieldNode(
                  name: NameNode(value: 'results'),
                  alias: null,
                  arguments: [],
                  directives: [],
                  selectionSet: SelectionSetNode(
                    selections: [
                      FieldNode(
                        name: NameNode(value: 'id'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'name'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'status'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'species'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'gender'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: 'image'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                      FieldNode(
                        name: NameNode(value: '__typename'),
                        alias: null,
                        arguments: [],
                        directives: [],
                        selectionSet: null,
                      ),
                    ],
                  ),
                ),
                FieldNode(
                  name: NameNode(value: '__typename'),
                  alias: null,
                  arguments: [],
                  directives: [],
                  selectionSet: null,
                ),
              ],
            ),
          ),
          FieldNode(
            name: NameNode(value: '__typename'),
            alias: null,
            arguments: [],
            directives: [],
            selectionSet: null,
          ),
        ],
      ),
    ),
  ],
);
Query$GetCharacters _parserFn$Query$GetCharacters(Map<String, dynamic> data) =>
    Query$GetCharacters.fromJson(data);
typedef OnQueryComplete$Query$GetCharacters =
    FutureOr<void> Function(Map<String, dynamic>?, Query$GetCharacters?);

class Options$Query$GetCharacters
    extends graphql.QueryOptions<Query$GetCharacters> {
  Options$Query$GetCharacters({
    String? operationName,
    required Variables$Query$GetCharacters variables,
    graphql.FetchPolicy? fetchPolicy,
    graphql.ErrorPolicy? errorPolicy,
    graphql.CacheRereadPolicy? cacheRereadPolicy,
    Object? optimisticResult,
    Query$GetCharacters? typedOptimisticResult,
    Duration? pollInterval,
    graphql.Context? context,
    OnQueryComplete$Query$GetCharacters? onComplete,
    graphql.OnQueryError? onError,
  }) : onCompleteWithParsed = onComplete,
       super(
         variables: variables.toJson(),
         operationName: operationName,
         fetchPolicy: fetchPolicy,
         errorPolicy: errorPolicy,
         cacheRereadPolicy: cacheRereadPolicy,
         optimisticResult: optimisticResult ?? typedOptimisticResult?.toJson(),
         pollInterval: pollInterval,
         context: context,
         onComplete: onComplete == null
             ? null
             : (data) => onComplete(
                 data,
                 data == null ? null : _parserFn$Query$GetCharacters(data),
               ),
         onError: onError,
         document: documentNodeQueryGetCharacters,
         parserFn: _parserFn$Query$GetCharacters,
       );

  final OnQueryComplete$Query$GetCharacters? onCompleteWithParsed;

  @override
  List<Object?> get properties => [
    ...super.onComplete == null
        ? super.properties
        : super.properties.where((property) => property != onComplete),
    onCompleteWithParsed,
  ];
}

class WatchOptions$Query$GetCharacters
    extends graphql.WatchQueryOptions<Query$GetCharacters> {
  WatchOptions$Query$GetCharacters({
    String? operationName,
    required Variables$Query$GetCharacters variables,
    graphql.FetchPolicy? fetchPolicy,
    graphql.ErrorPolicy? errorPolicy,
    graphql.CacheRereadPolicy? cacheRereadPolicy,
    Object? optimisticResult,
    Query$GetCharacters? typedOptimisticResult,
    graphql.Context? context,
    Duration? pollInterval,
    bool? eagerlyFetchResults,
    bool carryForwardDataOnException = true,
    bool fetchResults = false,
  }) : super(
         variables: variables.toJson(),
         operationName: operationName,
         fetchPolicy: fetchPolicy,
         errorPolicy: errorPolicy,
         cacheRereadPolicy: cacheRereadPolicy,
         optimisticResult: optimisticResult ?? typedOptimisticResult?.toJson(),
         context: context,
         document: documentNodeQueryGetCharacters,
         pollInterval: pollInterval,
         eagerlyFetchResults: eagerlyFetchResults,
         carryForwardDataOnException: carryForwardDataOnException,
         fetchResults: fetchResults,
         parserFn: _parserFn$Query$GetCharacters,
       );
}

class FetchMoreOptions$Query$GetCharacters extends graphql.FetchMoreOptions {
  FetchMoreOptions$Query$GetCharacters({
    required graphql.UpdateQuery updateQuery,
    required Variables$Query$GetCharacters variables,
  }) : super(
         updateQuery: updateQuery,
         variables: variables.toJson(),
         document: documentNodeQueryGetCharacters,
       );
}

extension ClientExtension$Query$GetCharacters on graphql.GraphQLClient {
  Future<graphql.QueryResult<Query$GetCharacters>> query$GetCharacters(
    Options$Query$GetCharacters options,
  ) async => await this.query(options);

  graphql.ObservableQuery<Query$GetCharacters> watchQuery$GetCharacters(
    WatchOptions$Query$GetCharacters options,
  ) => this.watchQuery(options);

  void writeQuery$GetCharacters({
    required Query$GetCharacters data,
    required Variables$Query$GetCharacters variables,
    bool broadcast = true,
  }) => this.writeQuery(
    graphql.Request(
      operation: graphql.Operation(document: documentNodeQueryGetCharacters),
      variables: variables.toJson(),
    ),
    data: data.toJson(),
    broadcast: broadcast,
  );

  Query$GetCharacters? readQuery$GetCharacters({
    required Variables$Query$GetCharacters variables,
    bool optimistic = true,
  }) {
    final result = this.readQuery(
      graphql.Request(
        operation: graphql.Operation(document: documentNodeQueryGetCharacters),
        variables: variables.toJson(),
      ),
      optimistic: optimistic,
    );
    return result == null ? null : Query$GetCharacters.fromJson(result);
  }
}

graphql_flutter.QueryHookResult<Query$GetCharacters> useQuery$GetCharacters(
  Options$Query$GetCharacters options,
) => graphql_flutter.useQuery(options);
graphql.ObservableQuery<Query$GetCharacters> useWatchQuery$GetCharacters(
  WatchOptions$Query$GetCharacters options,
) => graphql_flutter.useWatchQuery(options);

class Query$GetCharacters$Widget
    extends graphql_flutter.Query<Query$GetCharacters> {
  Query$GetCharacters$Widget({
    widgets.Key? key,
    required Options$Query$GetCharacters options,
    required graphql_flutter.QueryBuilder<Query$GetCharacters> builder,
  }) : super(key: key, options: options, builder: builder);
}

class Query$GetCharacters$characters {
  Query$GetCharacters$characters({
    this.info,
    this.results,
    this.$__typename = 'Characters',
  });

  factory Query$GetCharacters$characters.fromJson(Map<String, dynamic> json) {
    final l$info = json['info'];
    final l$results = json['results'];
    final l$$__typename = json['__typename'];
    return Query$GetCharacters$characters(
      info: l$info == null
          ? null
          : Query$GetCharacters$characters$info.fromJson(
              (l$info as Map<String, dynamic>),
            ),
      results: (l$results as List<dynamic>?)
          ?.map(
            (e) => e == null
                ? null
                : Query$GetCharacters$characters$results.fromJson(
                    (e as Map<String, dynamic>),
                  ),
          )
          .toList(),
      $__typename: (l$$__typename as String),
    );
  }

  final Query$GetCharacters$characters$info? info;

  final List<Query$GetCharacters$characters$results?>? results;

  final String $__typename;

  Map<String, dynamic> toJson() {
    final _resultData = <String, dynamic>{};
    final l$info = info;
    _resultData['info'] = l$info?.toJson();
    final l$results = results;
    _resultData['results'] = l$results?.map((e) => e?.toJson()).toList();
    final l$$__typename = $__typename;
    _resultData['__typename'] = l$$__typename;
    return _resultData;
  }

  @override
  int get hashCode {
    final l$info = info;
    final l$results = results;
    final l$$__typename = $__typename;
    return Object.hashAll([
      l$info,
      l$results == null ? null : Object.hashAll(l$results.map((v) => v)),
      l$$__typename,
    ]);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Query$GetCharacters$characters ||
        runtimeType != other.runtimeType) {
      return false;
    }
    final l$info = info;
    final lOther$info = other.info;
    if (l$info != lOther$info) {
      return false;
    }
    final l$results = results;
    final lOther$results = other.results;
    if (l$results != null && lOther$results != null) {
      if (l$results.length != lOther$results.length) {
        return false;
      }
      for (int i = 0; i < l$results.length; i++) {
        final l$results$entry = l$results[i];
        final lOther$results$entry = lOther$results[i];
        if (l$results$entry != lOther$results$entry) {
          return false;
        }
      }
    } else if (l$results != lOther$results) {
      return false;
    }
    final l$$__typename = $__typename;
    final lOther$$__typename = other.$__typename;
    if (l$$__typename != lOther$$__typename) {
      return false;
    }
    return true;
  }
}

extension UtilityExtension$Query$GetCharacters$characters
    on Query$GetCharacters$characters {
  CopyWith$Query$GetCharacters$characters<Query$GetCharacters$characters>
  get copyWith => CopyWith$Query$GetCharacters$characters(this, (i) => i);
}

abstract class CopyWith$Query$GetCharacters$characters<TRes> {
  factory CopyWith$Query$GetCharacters$characters(
    Query$GetCharacters$characters instance,
    TRes Function(Query$GetCharacters$characters) then,
  ) = _CopyWithImpl$Query$GetCharacters$characters;

  factory CopyWith$Query$GetCharacters$characters.stub(TRes res) =
      _CopyWithStubImpl$Query$GetCharacters$characters;

  TRes call({
    Query$GetCharacters$characters$info? info,
    List<Query$GetCharacters$characters$results?>? results,
    String? $__typename,
  });
  CopyWith$Query$GetCharacters$characters$info<TRes> get info;
  TRes results(
    Iterable<Query$GetCharacters$characters$results?>? Function(
      Iterable<
        CopyWith$Query$GetCharacters$characters$results<
          Query$GetCharacters$characters$results
        >?
      >?,
    )
    _fn,
  );
}

class _CopyWithImpl$Query$GetCharacters$characters<TRes>
    implements CopyWith$Query$GetCharacters$characters<TRes> {
  _CopyWithImpl$Query$GetCharacters$characters(this._instance, this._then);

  final Query$GetCharacters$characters _instance;

  final TRes Function(Query$GetCharacters$characters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({
    Object? info = _undefined,
    Object? results = _undefined,
    Object? $__typename = _undefined,
  }) => _then(
    Query$GetCharacters$characters(
      info: info == _undefined
          ? _instance.info
          : (info as Query$GetCharacters$characters$info?),
      results: results == _undefined
          ? _instance.results
          : (results as List<Query$GetCharacters$characters$results?>?),
      $__typename: $__typename == _undefined || $__typename == null
          ? _instance.$__typename
          : ($__typename as String),
    ),
  );

  CopyWith$Query$GetCharacters$characters$info<TRes> get info {
    final local$info = _instance.info;
    return local$info == null
        ? CopyWith$Query$GetCharacters$characters$info.stub(_then(_instance))
        : CopyWith$Query$GetCharacters$characters$info(
            local$info,
            (e) => call(info: e),
          );
  }

  TRes results(
    Iterable<Query$GetCharacters$characters$results?>? Function(
      Iterable<
        CopyWith$Query$GetCharacters$characters$results<
          Query$GetCharacters$characters$results
        >?
      >?,
    )
    _fn,
  ) => call(
    results: _fn(
      _instance.results?.map(
        (e) => e == null
            ? null
            : CopyWith$Query$GetCharacters$characters$results(e, (i) => i),
      ),
    )?.toList(),
  );
}

class _CopyWithStubImpl$Query$GetCharacters$characters<TRes>
    implements CopyWith$Query$GetCharacters$characters<TRes> {
  _CopyWithStubImpl$Query$GetCharacters$characters(this._res);

  TRes _res;

  call({
    Query$GetCharacters$characters$info? info,
    List<Query$GetCharacters$characters$results?>? results,
    String? $__typename,
  }) => _res;

  CopyWith$Query$GetCharacters$characters$info<TRes> get info =>
      CopyWith$Query$GetCharacters$characters$info.stub(_res);

  results(_fn) => _res;
}

class Query$GetCharacters$characters$info {
  Query$GetCharacters$characters$info({
    this.count,
    this.pages,
    this.next,
    this.prev,
    this.$__typename = 'Info',
  });

  factory Query$GetCharacters$characters$info.fromJson(
    Map<String, dynamic> json,
  ) {
    final l$count = json['count'];
    final l$pages = json['pages'];
    final l$next = json['next'];
    final l$prev = json['prev'];
    final l$$__typename = json['__typename'];
    return Query$GetCharacters$characters$info(
      count: (l$count as int?),
      pages: (l$pages as int?),
      next: (l$next as int?),
      prev: (l$prev as int?),
      $__typename: (l$$__typename as String),
    );
  }

  final int? count;

  final int? pages;

  final int? next;

  final int? prev;

  final String $__typename;

  Map<String, dynamic> toJson() {
    final _resultData = <String, dynamic>{};
    final l$count = count;
    _resultData['count'] = l$count;
    final l$pages = pages;
    _resultData['pages'] = l$pages;
    final l$next = next;
    _resultData['next'] = l$next;
    final l$prev = prev;
    _resultData['prev'] = l$prev;
    final l$$__typename = $__typename;
    _resultData['__typename'] = l$$__typename;
    return _resultData;
  }

  @override
  int get hashCode {
    final l$count = count;
    final l$pages = pages;
    final l$next = next;
    final l$prev = prev;
    final l$$__typename = $__typename;
    return Object.hashAll([l$count, l$pages, l$next, l$prev, l$$__typename]);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Query$GetCharacters$characters$info ||
        runtimeType != other.runtimeType) {
      return false;
    }
    final l$count = count;
    final lOther$count = other.count;
    if (l$count != lOther$count) {
      return false;
    }
    final l$pages = pages;
    final lOther$pages = other.pages;
    if (l$pages != lOther$pages) {
      return false;
    }
    final l$next = next;
    final lOther$next = other.next;
    if (l$next != lOther$next) {
      return false;
    }
    final l$prev = prev;
    final lOther$prev = other.prev;
    if (l$prev != lOther$prev) {
      return false;
    }
    final l$$__typename = $__typename;
    final lOther$$__typename = other.$__typename;
    if (l$$__typename != lOther$$__typename) {
      return false;
    }
    return true;
  }
}

extension UtilityExtension$Query$GetCharacters$characters$info
    on Query$GetCharacters$characters$info {
  CopyWith$Query$GetCharacters$characters$info<
    Query$GetCharacters$characters$info
  >
  get copyWith => CopyWith$Query$GetCharacters$characters$info(this, (i) => i);
}

abstract class CopyWith$Query$GetCharacters$characters$info<TRes> {
  factory CopyWith$Query$GetCharacters$characters$info(
    Query$GetCharacters$characters$info instance,
    TRes Function(Query$GetCharacters$characters$info) then,
  ) = _CopyWithImpl$Query$GetCharacters$characters$info;

  factory CopyWith$Query$GetCharacters$characters$info.stub(TRes res) =
      _CopyWithStubImpl$Query$GetCharacters$characters$info;

  TRes call({
    int? count,
    int? pages,
    int? next,
    int? prev,
    String? $__typename,
  });
}

class _CopyWithImpl$Query$GetCharacters$characters$info<TRes>
    implements CopyWith$Query$GetCharacters$characters$info<TRes> {
  _CopyWithImpl$Query$GetCharacters$characters$info(this._instance, this._then);

  final Query$GetCharacters$characters$info _instance;

  final TRes Function(Query$GetCharacters$characters$info) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({
    Object? count = _undefined,
    Object? pages = _undefined,
    Object? next = _undefined,
    Object? prev = _undefined,
    Object? $__typename = _undefined,
  }) => _then(
    Query$GetCharacters$characters$info(
      count: count == _undefined ? _instance.count : (count as int?),
      pages: pages == _undefined ? _instance.pages : (pages as int?),
      next: next == _undefined ? _instance.next : (next as int?),
      prev: prev == _undefined ? _instance.prev : (prev as int?),
      $__typename: $__typename == _undefined || $__typename == null
          ? _instance.$__typename
          : ($__typename as String),
    ),
  );
}

class _CopyWithStubImpl$Query$GetCharacters$characters$info<TRes>
    implements CopyWith$Query$GetCharacters$characters$info<TRes> {
  _CopyWithStubImpl$Query$GetCharacters$characters$info(this._res);

  TRes _res;

  call({int? count, int? pages, int? next, int? prev, String? $__typename}) =>
      _res;
}

class Query$GetCharacters$characters$results {
  Query$GetCharacters$characters$results({
    this.id,
    this.name,
    this.status,
    this.species,
    this.gender,
    this.image,
    this.$__typename = 'Character',
  });

  factory Query$GetCharacters$characters$results.fromJson(
    Map<String, dynamic> json,
  ) {
    final l$id = json['id'];
    final l$name = json['name'];
    final l$status = json['status'];
    final l$species = json['species'];
    final l$gender = json['gender'];
    final l$image = json['image'];
    final l$$__typename = json['__typename'];
    return Query$GetCharacters$characters$results(
      id: (l$id as String?),
      name: (l$name as String?),
      status: (l$status as String?),
      species: (l$species as String?),
      gender: (l$gender as String?),
      image: (l$image as String?),
      $__typename: (l$$__typename as String),
    );
  }

  final String? id;

  final String? name;

  final String? status;

  final String? species;

  final String? gender;

  final String? image;

  final String $__typename;

  Map<String, dynamic> toJson() {
    final _resultData = <String, dynamic>{};
    final l$id = id;
    _resultData['id'] = l$id;
    final l$name = name;
    _resultData['name'] = l$name;
    final l$status = status;
    _resultData['status'] = l$status;
    final l$species = species;
    _resultData['species'] = l$species;
    final l$gender = gender;
    _resultData['gender'] = l$gender;
    final l$image = image;
    _resultData['image'] = l$image;
    final l$$__typename = $__typename;
    _resultData['__typename'] = l$$__typename;
    return _resultData;
  }

  @override
  int get hashCode {
    final l$id = id;
    final l$name = name;
    final l$status = status;
    final l$species = species;
    final l$gender = gender;
    final l$image = image;
    final l$$__typename = $__typename;
    return Object.hashAll([
      l$id,
      l$name,
      l$status,
      l$species,
      l$gender,
      l$image,
      l$$__typename,
    ]);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Query$GetCharacters$characters$results ||
        runtimeType != other.runtimeType) {
      return false;
    }
    final l$id = id;
    final lOther$id = other.id;
    if (l$id != lOther$id) {
      return false;
    }
    final l$name = name;
    final lOther$name = other.name;
    if (l$name != lOther$name) {
      return false;
    }
    final l$status = status;
    final lOther$status = other.status;
    if (l$status != lOther$status) {
      return false;
    }
    final l$species = species;
    final lOther$species = other.species;
    if (l$species != lOther$species) {
      return false;
    }
    final l$gender = gender;
    final lOther$gender = other.gender;
    if (l$gender != lOther$gender) {
      return false;
    }
    final l$image = image;
    final lOther$image = other.image;
    if (l$image != lOther$image) {
      return false;
    }
    final l$$__typename = $__typename;
    final lOther$$__typename = other.$__typename;
    if (l$$__typename != lOther$$__typename) {
      return false;
    }
    return true;
  }
}

extension UtilityExtension$Query$GetCharacters$characters$results
    on Query$GetCharacters$characters$results {
  CopyWith$Query$GetCharacters$characters$results<
    Query$GetCharacters$characters$results
  >
  get copyWith =>
      CopyWith$Query$GetCharacters$characters$results(this, (i) => i);
}

abstract class CopyWith$Query$GetCharacters$characters$results<TRes> {
  factory CopyWith$Query$GetCharacters$characters$results(
    Query$GetCharacters$characters$results instance,
    TRes Function(Query$GetCharacters$characters$results) then,
  ) = _CopyWithImpl$Query$GetCharacters$characters$results;

  factory CopyWith$Query$GetCharacters$characters$results.stub(TRes res) =
      _CopyWithStubImpl$Query$GetCharacters$characters$results;

  TRes call({
    String? id,
    String? name,
    String? status,
    String? species,
    String? gender,
    String? image,
    String? $__typename,
  });
}

class _CopyWithImpl$Query$GetCharacters$characters$results<TRes>
    implements CopyWith$Query$GetCharacters$characters$results<TRes> {
  _CopyWithImpl$Query$GetCharacters$characters$results(
    this._instance,
    this._then,
  );

  final Query$GetCharacters$characters$results _instance;

  final TRes Function(Query$GetCharacters$characters$results) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({
    Object? id = _undefined,
    Object? name = _undefined,
    Object? status = _undefined,
    Object? species = _undefined,
    Object? gender = _undefined,
    Object? image = _undefined,
    Object? $__typename = _undefined,
  }) => _then(
    Query$GetCharacters$characters$results(
      id: id == _undefined ? _instance.id : (id as String?),
      name: name == _undefined ? _instance.name : (name as String?),
      status: status == _undefined ? _instance.status : (status as String?),
      species: species == _undefined ? _instance.species : (species as String?),
      gender: gender == _undefined ? _instance.gender : (gender as String?),
      image: image == _undefined ? _instance.image : (image as String?),
      $__typename: $__typename == _undefined || $__typename == null
          ? _instance.$__typename
          : ($__typename as String),
    ),
  );
}

class _CopyWithStubImpl$Query$GetCharacters$characters$results<TRes>
    implements CopyWith$Query$GetCharacters$characters$results<TRes> {
  _CopyWithStubImpl$Query$GetCharacters$characters$results(this._res);

  TRes _res;

  call({
    String? id,
    String? name,
    String? status,
    String? species,
    String? gender,
    String? image,
    String? $__typename,
  }) => _res;
}
