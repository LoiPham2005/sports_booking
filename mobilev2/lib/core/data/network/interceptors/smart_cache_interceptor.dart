import 'dart:convert';

import 'package:dio/dio.dart';

class SmartCacheInterceptor extends Interceptor {
  SmartCacheInterceptor({this.ttl = const Duration(minutes: 5)});

  final Duration ttl;
  final Map<String, _CacheEntry> _store = {};

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method.toUpperCase() != 'GET') return handler.next(options);
    final useCache = options.extra['use_cache'] == true;
    if (!useCache) return handler.next(options);

    final key = _keyFor(options);
    final entry = _store[key];
    if (entry != null && !entry.isExpired) {
      return handler.resolve(
        Response(
          requestOptions: options,
          data: jsonDecode(entry.body),
          statusCode: 200,
          extra: {'from_cache': true},
        ),
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(Response<dynamic> response, ResponseInterceptorHandler handler) {
    final options = response.requestOptions;
    if (options.method.toUpperCase() == 'GET' &&
        options.extra['use_cache'] == true &&
        response.statusCode == 200) {
      _store[_keyFor(options)] = _CacheEntry(
        body: jsonEncode(response.data),
        expiresAt: DateTime.now().add(ttl),
      );
    }
    handler.next(response);
  }

  String _keyFor(RequestOptions o) => '${o.uri}|${jsonEncode(o.queryParameters)}';

  void clear() => _store.clear();
}

class _CacheEntry {
  _CacheEntry({required this.body, required this.expiresAt});
  final String body;
  final DateTime expiresAt;
  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
