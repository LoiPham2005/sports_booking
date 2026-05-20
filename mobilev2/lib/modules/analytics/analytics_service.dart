import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:injectable/injectable.dart';

@LazySingleton()
class AnalyticsService {
  AnalyticsService() : _analytics = FirebaseAnalytics.instance;

  final FirebaseAnalytics _analytics;

  bool get _enabled => FlavorConfig.current.enableAnalytics;

  FirebaseAnalyticsObserver get observer =>
      FirebaseAnalyticsObserver(analytics: _analytics);

  /// Log custom event lên Firebase Analytics.
  /// Tự động bỏ qua nếu flavor disable analytics.
  Future<void> logEvent({
    required String name,
    Map<String, Object?>? parameters,
  }) async {
    if (!_enabled) return;
    try {
      await _analytics.logEvent(
        name: name,
        parameters: parameters?.map((k, v) => MapEntry(k, v as Object)),
      );
    } catch (e, s) {
      Logger.error('Analytics logEvent failed: $name', error: e, stackTrace: s);
    }
  }

  /// Helper — log button click event.
  Future<void> logButtonClick({
    required String buttonName,
    Map<String, Object?>? params,
  }) =>
      logEvent(
        name: 'button_click',
        parameters: {'button_name': buttonName, ...?params},
      );

  /// Log Ad revenue theo Firebase Ad Revenue spec (event name `ad_impression`).
  Future<void> logAdRevenuePaid({
    required double value,
    required String currency,
    required String adPlatform,
    required String adSource,
    required String adUnitName,
    required String adFormat,
  }) =>
      logEvent(
        name: 'ad_impression',
        parameters: {
          'value': value,
          'currency': currency,
          'ad_platform': adPlatform,
          'ad_source': adSource,
          'ad_unit_name': adUnitName,
          'ad_format': adFormat,
        },
      );

  Future<void> setUserId(String? id) async {
    if (!_enabled) return;
    await _analytics.setUserId(id: id);
  }

  Future<void> logScreenView(String screenName) async {
    if (!_enabled) return;
    await _analytics.logScreenView(screenName: screenName);
  }
}
