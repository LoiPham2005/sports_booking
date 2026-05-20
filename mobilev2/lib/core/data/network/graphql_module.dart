import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/data/storage/secure_storage_service.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:injectable/injectable.dart';

@module
abstract class GraphQLModule {
  /// 🌐 Public test endpoint — Rick & Morty GraphQL (KHÔNG auth).
  /// Đổi sang `false` khi backend nội bộ đã có `/graphql`.
  static const _useDemoEndpoint = true;

  static const _demoEndpoint = 'https://rickandmortyapi.com/graphql';

  static String get _endpointUrl => _useDemoEndpoint
      ? _demoEndpoint
      : '${FlavorConfig.current.apiBaseUrl}/graphql';

  @LazySingleton()
  GraphQLClient graphQLClient(SecureStorageService secureStorage) {
    Logger.info('🛰  GraphQL endpoint: $_endpointUrl', tag: 'GRAPHQL');

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
