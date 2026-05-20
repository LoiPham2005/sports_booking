import 'dart:async';
import 'package:flutter/widgets.dart' as widgets;
import 'package:gql/ast.dart';
import 'package:graphql/client.dart' as graphql;
import 'package:graphql_flutter/graphql_flutter.dart' as graphql_flutter;

class Variables$Query$SearchCharacters {
  factory Variables$Query$SearchCharacters({required String name}) =>
      Variables$Query$SearchCharacters._({r'name': name});

  Variables$Query$SearchCharacters._(this._$data);

  factory Variables$Query$SearchCharacters.fromJson(Map<String, dynamic> data) {
    final result$data = <String, dynamic>{};
    final l$name = data['name'];
    result$data['name'] = (l$name as String);
    return Variables$Query$SearchCharacters._(result$data);
  }

  Map<String, dynamic> _$data;

  String get name => (_$data['name'] as String);

  Map<String, dynamic> toJson() {
    final result$data = <String, dynamic>{};
    final l$name = name;
    result$data['name'] = l$name;
    return result$data;
  }

  CopyWith$Variables$Query$SearchCharacters<Variables$Query$SearchCharacters>
  get copyWith => CopyWith$Variables$Query$SearchCharacters(this, (i) => i);

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Variables$Query$SearchCharacters ||
        runtimeType != other.runtimeType) {
      return false;
    }
    final l$name = name;
    final lOther$name = other.name;
    if (l$name != lOther$name) {
      return false;
    }
    return true;
  }

  @override
  int get hashCode {
    final l$name = name;
    return Object.hashAll([l$name]);
  }
}

abstract class CopyWith$Variables$Query$SearchCharacters<TRes> {
  factory CopyWith$Variables$Query$SearchCharacters(
    Variables$Query$SearchCharacters instance,
    TRes Function(Variables$Query$SearchCharacters) then,
  ) = _CopyWithImpl$Variables$Query$SearchCharacters;

  factory CopyWith$Variables$Query$SearchCharacters.stub(TRes res) =
      _CopyWithStubImpl$Variables$Query$SearchCharacters;

  TRes call({String? name});
}

class _CopyWithImpl$Variables$Query$SearchCharacters<TRes>
    implements CopyWith$Variables$Query$SearchCharacters<TRes> {
  _CopyWithImpl$Variables$Query$SearchCharacters(this._instance, this._then);

  final Variables$Query$SearchCharacters _instance;

  final TRes Function(Variables$Query$SearchCharacters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({Object? name = _undefined}) => _then(
    Variables$Query$SearchCharacters._({
      ..._instance._$data,
      if (name != _undefined && name != null) 'name': (name as String),
    }),
  );
}

class _CopyWithStubImpl$Variables$Query$SearchCharacters<TRes>
    implements CopyWith$Variables$Query$SearchCharacters<TRes> {
  _CopyWithStubImpl$Variables$Query$SearchCharacters(this._res);

  TRes _res;

  call({String? name}) => _res;
}

class Query$SearchCharacters {
  Query$SearchCharacters({this.characters, this.$__typename = 'Query'});

  factory Query$SearchCharacters.fromJson(Map<String, dynamic> json) {
    final l$characters = json['characters'];
    final l$$__typename = json['__typename'];
    return Query$SearchCharacters(
      characters: l$characters == null
          ? null
          : Query$SearchCharacters$characters.fromJson(
              (l$characters as Map<String, dynamic>),
            ),
      $__typename: (l$$__typename as String),
    );
  }

  final Query$SearchCharacters$characters? characters;

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
    if (other is! Query$SearchCharacters || runtimeType != other.runtimeType) {
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

extension UtilityExtension$Query$SearchCharacters on Query$SearchCharacters {
  CopyWith$Query$SearchCharacters<Query$SearchCharacters> get copyWith =>
      CopyWith$Query$SearchCharacters(this, (i) => i);
}

abstract class CopyWith$Query$SearchCharacters<TRes> {
  factory CopyWith$Query$SearchCharacters(
    Query$SearchCharacters instance,
    TRes Function(Query$SearchCharacters) then,
  ) = _CopyWithImpl$Query$SearchCharacters;

  factory CopyWith$Query$SearchCharacters.stub(TRes res) =
      _CopyWithStubImpl$Query$SearchCharacters;

  TRes call({
    Query$SearchCharacters$characters? characters,
    String? $__typename,
  });
  CopyWith$Query$SearchCharacters$characters<TRes> get characters;
}

class _CopyWithImpl$Query$SearchCharacters<TRes>
    implements CopyWith$Query$SearchCharacters<TRes> {
  _CopyWithImpl$Query$SearchCharacters(this._instance, this._then);

  final Query$SearchCharacters _instance;

  final TRes Function(Query$SearchCharacters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({
    Object? characters = _undefined,
    Object? $__typename = _undefined,
  }) => _then(
    Query$SearchCharacters(
      characters: characters == _undefined
          ? _instance.characters
          : (characters as Query$SearchCharacters$characters?),
      $__typename: $__typename == _undefined || $__typename == null
          ? _instance.$__typename
          : ($__typename as String),
    ),
  );

  CopyWith$Query$SearchCharacters$characters<TRes> get characters {
    final local$characters = _instance.characters;
    return local$characters == null
        ? CopyWith$Query$SearchCharacters$characters.stub(_then(_instance))
        : CopyWith$Query$SearchCharacters$characters(
            local$characters,
            (e) => call(characters: e),
          );
  }
}

class _CopyWithStubImpl$Query$SearchCharacters<TRes>
    implements CopyWith$Query$SearchCharacters<TRes> {
  _CopyWithStubImpl$Query$SearchCharacters(this._res);

  TRes _res;

  call({Query$SearchCharacters$characters? characters, String? $__typename}) =>
      _res;

  CopyWith$Query$SearchCharacters$characters<TRes> get characters =>
      CopyWith$Query$SearchCharacters$characters.stub(_res);
}

const documentNodeQuerySearchCharacters = DocumentNode(
  definitions: [
    OperationDefinitionNode(
      type: OperationType.query,
      name: NameNode(value: 'SearchCharacters'),
      variableDefinitions: [
        VariableDefinitionNode(
          variable: VariableNode(name: NameNode(value: 'name')),
          type: NamedTypeNode(name: NameNode(value: 'String'), isNonNull: true),
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
                name: NameNode(value: 'filter'),
                value: ObjectValueNode(
                  fields: [
                    ObjectFieldNode(
                      name: NameNode(value: 'name'),
                      value: VariableNode(name: NameNode(value: 'name')),
                    ),
                  ],
                ),
              ),
            ],
            directives: [],
            selectionSet: SelectionSetNode(
              selections: [
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
Query$SearchCharacters _parserFn$Query$SearchCharacters(
  Map<String, dynamic> data,
) => Query$SearchCharacters.fromJson(data);
typedef OnQueryComplete$Query$SearchCharacters =
    FutureOr<void> Function(Map<String, dynamic>?, Query$SearchCharacters?);

class Options$Query$SearchCharacters
    extends graphql.QueryOptions<Query$SearchCharacters> {
  Options$Query$SearchCharacters({
    String? operationName,
    required Variables$Query$SearchCharacters variables,
    graphql.FetchPolicy? fetchPolicy,
    graphql.ErrorPolicy? errorPolicy,
    graphql.CacheRereadPolicy? cacheRereadPolicy,
    Object? optimisticResult,
    Query$SearchCharacters? typedOptimisticResult,
    Duration? pollInterval,
    graphql.Context? context,
    OnQueryComplete$Query$SearchCharacters? onComplete,
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
                 data == null ? null : _parserFn$Query$SearchCharacters(data),
               ),
         onError: onError,
         document: documentNodeQuerySearchCharacters,
         parserFn: _parserFn$Query$SearchCharacters,
       );

  final OnQueryComplete$Query$SearchCharacters? onCompleteWithParsed;

  @override
  List<Object?> get properties => [
    ...super.onComplete == null
        ? super.properties
        : super.properties.where((property) => property != onComplete),
    onCompleteWithParsed,
  ];
}

class WatchOptions$Query$SearchCharacters
    extends graphql.WatchQueryOptions<Query$SearchCharacters> {
  WatchOptions$Query$SearchCharacters({
    String? operationName,
    required Variables$Query$SearchCharacters variables,
    graphql.FetchPolicy? fetchPolicy,
    graphql.ErrorPolicy? errorPolicy,
    graphql.CacheRereadPolicy? cacheRereadPolicy,
    Object? optimisticResult,
    Query$SearchCharacters? typedOptimisticResult,
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
         document: documentNodeQuerySearchCharacters,
         pollInterval: pollInterval,
         eagerlyFetchResults: eagerlyFetchResults,
         carryForwardDataOnException: carryForwardDataOnException,
         fetchResults: fetchResults,
         parserFn: _parserFn$Query$SearchCharacters,
       );
}

class FetchMoreOptions$Query$SearchCharacters extends graphql.FetchMoreOptions {
  FetchMoreOptions$Query$SearchCharacters({
    required graphql.UpdateQuery updateQuery,
    required Variables$Query$SearchCharacters variables,
  }) : super(
         updateQuery: updateQuery,
         variables: variables.toJson(),
         document: documentNodeQuerySearchCharacters,
       );
}

extension ClientExtension$Query$SearchCharacters on graphql.GraphQLClient {
  Future<graphql.QueryResult<Query$SearchCharacters>> query$SearchCharacters(
    Options$Query$SearchCharacters options,
  ) async => await this.query(options);

  graphql.ObservableQuery<Query$SearchCharacters> watchQuery$SearchCharacters(
    WatchOptions$Query$SearchCharacters options,
  ) => this.watchQuery(options);

  void writeQuery$SearchCharacters({
    required Query$SearchCharacters data,
    required Variables$Query$SearchCharacters variables,
    bool broadcast = true,
  }) => this.writeQuery(
    graphql.Request(
      operation: graphql.Operation(document: documentNodeQuerySearchCharacters),
      variables: variables.toJson(),
    ),
    data: data.toJson(),
    broadcast: broadcast,
  );

  Query$SearchCharacters? readQuery$SearchCharacters({
    required Variables$Query$SearchCharacters variables,
    bool optimistic = true,
  }) {
    final result = this.readQuery(
      graphql.Request(
        operation: graphql.Operation(
          document: documentNodeQuerySearchCharacters,
        ),
        variables: variables.toJson(),
      ),
      optimistic: optimistic,
    );
    return result == null ? null : Query$SearchCharacters.fromJson(result);
  }
}

graphql_flutter.QueryHookResult<Query$SearchCharacters>
useQuery$SearchCharacters(Options$Query$SearchCharacters options) =>
    graphql_flutter.useQuery(options);
graphql.ObservableQuery<Query$SearchCharacters> useWatchQuery$SearchCharacters(
  WatchOptions$Query$SearchCharacters options,
) => graphql_flutter.useWatchQuery(options);

class Query$SearchCharacters$Widget
    extends graphql_flutter.Query<Query$SearchCharacters> {
  Query$SearchCharacters$Widget({
    widgets.Key? key,
    required Options$Query$SearchCharacters options,
    required graphql_flutter.QueryBuilder<Query$SearchCharacters> builder,
  }) : super(key: key, options: options, builder: builder);
}

class Query$SearchCharacters$characters {
  Query$SearchCharacters$characters({
    this.results,
    this.$__typename = 'Characters',
  });

  factory Query$SearchCharacters$characters.fromJson(
    Map<String, dynamic> json,
  ) {
    final l$results = json['results'];
    final l$$__typename = json['__typename'];
    return Query$SearchCharacters$characters(
      results: (l$results as List<dynamic>?)
          ?.map(
            (e) => e == null
                ? null
                : Query$SearchCharacters$characters$results.fromJson(
                    (e as Map<String, dynamic>),
                  ),
          )
          .toList(),
      $__typename: (l$$__typename as String),
    );
  }

  final List<Query$SearchCharacters$characters$results?>? results;

  final String $__typename;

  Map<String, dynamic> toJson() {
    final _resultData = <String, dynamic>{};
    final l$results = results;
    _resultData['results'] = l$results?.map((e) => e?.toJson()).toList();
    final l$$__typename = $__typename;
    _resultData['__typename'] = l$$__typename;
    return _resultData;
  }

  @override
  int get hashCode {
    final l$results = results;
    final l$$__typename = $__typename;
    return Object.hashAll([
      l$results == null ? null : Object.hashAll(l$results.map((v) => v)),
      l$$__typename,
    ]);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    if (other is! Query$SearchCharacters$characters ||
        runtimeType != other.runtimeType) {
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

extension UtilityExtension$Query$SearchCharacters$characters
    on Query$SearchCharacters$characters {
  CopyWith$Query$SearchCharacters$characters<Query$SearchCharacters$characters>
  get copyWith => CopyWith$Query$SearchCharacters$characters(this, (i) => i);
}

abstract class CopyWith$Query$SearchCharacters$characters<TRes> {
  factory CopyWith$Query$SearchCharacters$characters(
    Query$SearchCharacters$characters instance,
    TRes Function(Query$SearchCharacters$characters) then,
  ) = _CopyWithImpl$Query$SearchCharacters$characters;

  factory CopyWith$Query$SearchCharacters$characters.stub(TRes res) =
      _CopyWithStubImpl$Query$SearchCharacters$characters;

  TRes call({
    List<Query$SearchCharacters$characters$results?>? results,
    String? $__typename,
  });
  TRes results(
    Iterable<Query$SearchCharacters$characters$results?>? Function(
      Iterable<
        CopyWith$Query$SearchCharacters$characters$results<
          Query$SearchCharacters$characters$results
        >?
      >?,
    )
    _fn,
  );
}

class _CopyWithImpl$Query$SearchCharacters$characters<TRes>
    implements CopyWith$Query$SearchCharacters$characters<TRes> {
  _CopyWithImpl$Query$SearchCharacters$characters(this._instance, this._then);

  final Query$SearchCharacters$characters _instance;

  final TRes Function(Query$SearchCharacters$characters) _then;

  static const _undefined = <dynamic, dynamic>{};

  TRes call({Object? results = _undefined, Object? $__typename = _undefined}) =>
      _then(
        Query$SearchCharacters$characters(
          results: results == _undefined
              ? _instance.results
              : (results as List<Query$SearchCharacters$characters$results?>?),
          $__typename: $__typename == _undefined || $__typename == null
              ? _instance.$__typename
              : ($__typename as String),
        ),
      );

  TRes results(
    Iterable<Query$SearchCharacters$characters$results?>? Function(
      Iterable<
        CopyWith$Query$SearchCharacters$characters$results<
          Query$SearchCharacters$characters$results
        >?
      >?,
    )
    _fn,
  ) => call(
    results: _fn(
      _instance.results?.map(
        (e) => e == null
            ? null
            : CopyWith$Query$SearchCharacters$characters$results(e, (i) => i),
      ),
    )?.toList(),
  );
}

class _CopyWithStubImpl$Query$SearchCharacters$characters<TRes>
    implements CopyWith$Query$SearchCharacters$characters<TRes> {
  _CopyWithStubImpl$Query$SearchCharacters$characters(this._res);

  TRes _res;

  call({
    List<Query$SearchCharacters$characters$results?>? results,
    String? $__typename,
  }) => _res;

  results(_fn) => _res;
}

class Query$SearchCharacters$characters$results {
  Query$SearchCharacters$characters$results({
    this.id,
    this.name,
    this.status,
    this.species,
    this.gender,
    this.image,
    this.$__typename = 'Character',
  });

  factory Query$SearchCharacters$characters$results.fromJson(
    Map<String, dynamic> json,
  ) {
    final l$id = json['id'];
    final l$name = json['name'];
    final l$status = json['status'];
    final l$species = json['species'];
    final l$gender = json['gender'];
    final l$image = json['image'];
    final l$$__typename = json['__typename'];
    return Query$SearchCharacters$characters$results(
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
    if (other is! Query$SearchCharacters$characters$results ||
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

extension UtilityExtension$Query$SearchCharacters$characters$results
    on Query$SearchCharacters$characters$results {
  CopyWith$Query$SearchCharacters$characters$results<
    Query$SearchCharacters$characters$results
  >
  get copyWith =>
      CopyWith$Query$SearchCharacters$characters$results(this, (i) => i);
}

abstract class CopyWith$Query$SearchCharacters$characters$results<TRes> {
  factory CopyWith$Query$SearchCharacters$characters$results(
    Query$SearchCharacters$characters$results instance,
    TRes Function(Query$SearchCharacters$characters$results) then,
  ) = _CopyWithImpl$Query$SearchCharacters$characters$results;

  factory CopyWith$Query$SearchCharacters$characters$results.stub(TRes res) =
      _CopyWithStubImpl$Query$SearchCharacters$characters$results;

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

class _CopyWithImpl$Query$SearchCharacters$characters$results<TRes>
    implements CopyWith$Query$SearchCharacters$characters$results<TRes> {
  _CopyWithImpl$Query$SearchCharacters$characters$results(
    this._instance,
    this._then,
  );

  final Query$SearchCharacters$characters$results _instance;

  final TRes Function(Query$SearchCharacters$characters$results) _then;

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
    Query$SearchCharacters$characters$results(
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

class _CopyWithStubImpl$Query$SearchCharacters$characters$results<TRes>
    implements CopyWith$Query$SearchCharacters$characters$results<TRes> {
  _CopyWithStubImpl$Query$SearchCharacters$characters$results(this._res);

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
