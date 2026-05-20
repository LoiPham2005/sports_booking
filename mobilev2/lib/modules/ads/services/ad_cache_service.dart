import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:injectable/injectable.dart';

@lazySingleton
class AdCacheService {
  final Map<String, Ad> _cache = {};
  final Map<String, DateTime> _loadTimes = {};

  /// Thời gian hết hạn mặc định của Ad (1 giờ theo policy).
  static const Duration _expiry = Duration(hours: 1);

  void set(String key, Ad ad) {
    _cache[key]?.dispose();
    _cache[key] = ad;
    _loadTimes[key] = DateTime.now();
  }

  T? get<T extends Ad>(String key) {
    final ad = _cache[key];
    final loadTime = _loadTimes[key];

    if (ad == null || loadTime == null) return null;

    // Kiểm tra hết hạn
    if (DateTime.now().difference(loadTime) > _expiry) {
      remove(key);
      return null;
    }

    return ad as T;
  }

  void remove(String key) {
    _cache[key]?.dispose();
    _cache.remove(key);
    _loadTimes.remove(key);
  }

  bool isReady(String key) {
    return get(key) != null;
  }

  void clear() {
    for (final ad in _cache.values) {
      ad.dispose();
    }
    _cache.clear();
    _loadTimes.clear();
  }
}
