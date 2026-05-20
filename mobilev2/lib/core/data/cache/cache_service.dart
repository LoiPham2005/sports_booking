import 'package:injectable/injectable.dart';

@LazySingleton()
class CacheService {
  final Map<String, _Entry> _store = {};

  T? get<T>(String key) {
    final entry = _store[key];
    if (entry == null) return null;
    if (entry.isExpired) {
      _store.remove(key);
      return null;
    }
    return entry.value as T?;
  }

  void set<T>(String key, T value, {Duration? ttl}) {
    _store[key] = _Entry(
      value: value,
      expiresAt: ttl == null ? null : DateTime.now().add(ttl),
    );
  }

  void remove(String key) => _store.remove(key);
  void clear() => _store.clear();
  bool contains(String key) => _store.containsKey(key) && !_store[key]!.isExpired;
}

class _Entry {
  _Entry({required this.value, this.expiresAt});
  final Object? value;
  final DateTime? expiresAt;
  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
}
