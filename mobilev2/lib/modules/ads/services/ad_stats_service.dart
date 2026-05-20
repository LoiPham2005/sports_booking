import 'package:flutter/foundation.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/analytics/analytics_service.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:injectable/injectable.dart';

/// Theo dõi ads: gửi Firebase Analytics (mọi môi trường) + in-memory stats (debug).
@lazySingleton
class AdAnalyticsService {
  AdAnalyticsService(this._analytics);

  final AnalyticsService _analytics;

  static const _tag = 'ADS STATS';

  // In-memory stats — chỉ dùng ở debug
  final Map<String, _AdStat> _stats = {};

  _AdStat _stat(String key) =>
      _stats.putIfAbsent(key, () => _AdStat(key));

  // ── Public API ────────────────────────────────────────────────

  void onAdRequested({required String adUnitName, required String adUnitId}) {
    _analytics.logEvent(
      name: 'ad_requested',
      parameters: {'ad_unit_name': adUnitName, 'ad_unit_id': adUnitId},
    );
    if (!kDebugMode) return;
    _stat(adUnitName).requests++;
    _logStats(adUnitName, event: 'requested');
  }

  void onAdImpression({required String adUnitName, required Ad ad}) {
    _analytics.logEvent(
      name: 'ad_impression_custom',
      parameters: {'ad_unit_name': adUnitName, 'ad_unit_id': ad.adUnitId},
    );
    if (!kDebugMode) return;
    _stat(adUnitName).impressions++;
    _logStats(adUnitName, event: 'shown ✅');
  }

  void onAdClicked({required String adUnitName}) {
    _analytics.logButtonClick(
      buttonName: 'ad_click',
      params: {'ad_unit_name': adUnitName},
    );
  }

  void onAdLoadFailed({
    required String adUnitName,
    required LoadAdError error,
  }) {
    _analytics.logEvent(
      name: 'ad_load_failed',
      parameters: {
        'ad_unit_name': adUnitName,
        'error_code': error.code,
        'error_message': error.message,
        'domain': error.domain,
      },
    );
    if (!kDebugMode) return;
    _stat(adUnitName).loadFailed++;
    _logStats(adUnitName, event: 'load failed ❌');
  }

  void onAdShowFailed({
    required String adUnitName,
    required AdError error,
  }) {
    _analytics.logEvent(
      name: 'ad_show_failed',
      parameters: {
        'ad_unit_name': adUnitName,
        'error_code': error.code,
        'error_message': error.message,
        'domain': error.domain,
      },
    );
    if (!kDebugMode) return;
    _stat(adUnitName).showFailed++;
    _logStats(adUnitName, event: 'show failed ❌');
  }

  void onAdAborted({required String adUnitName, required String reason}) {
    if (!kDebugMode) return;
    _stat(adUnitName).aborted++;
    _logStats(adUnitName, event: 'aborted ($reason)');
  }

  void onAdRevenue({
    required double valueMicros,
    required String currencyCode,
    required String adUnitName,
    required String adFormat,
  }) {
    _analytics.logAdRevenuePaid(
      value: valueMicros / 1_000_000,
      currency: currencyCode,
      adPlatform: 'AdMob',
      adSource: 'AdMob',
      adUnitName: adUnitName,
      adFormat: adFormat,
    );
  }

  // ── Debug summary ─────────────────────────────────────────────

  void logSummary() {
    if (!kDebugMode) return;
    if (_stats.isEmpty) {
      Logger.info('No ad stats yet this session', tag: _tag);
      return;
    }

    int totalReq = 0, totalImp = 0, totalFail = 0;
    final rows = <(String, String)>[];

    for (final s in _stats.values) {
      rows.add(('── ${s.adUnitName}', ''));
      rows.add(('  Requests', '${s.requests}'));
      rows.add(('  Shown', '${s.impressions}'));
      rows.add(('  Failed', '${s.loadFailed + s.showFailed}'));
      rows.add(('  Aborted', '${s.aborted}'));
      rows.add(('  Show rate', s.showRateLabel));
      totalReq += s.requests;
      totalImp += s.impressions;
      totalFail += s.loadFailed + s.showFailed + s.aborted;
    }

    final totalRate = totalReq == 0
        ? '—'
        : '${(totalImp / totalReq * 100).toStringAsFixed(1)}%';

    rows.add(('──────────────────────', ''));
    rows.add(('TOTAL Requests', '$totalReq'));
    rows.add(('TOTAL Shown', '$totalImp'));
    rows.add(('TOTAL Not shown', '$totalFail'));
    rows.add(('TOTAL Show rate', totalRate));

    Logger.adTable('Session Summary', tag: _tag, rows: rows);
  }

  void reset() {
    _stats.clear();
    if (kDebugMode) Logger.info('Stats reset', tag: _tag);
  }

  // ── Private ───────────────────────────────────────────────────

  void _logStats(String adUnitName, {required String event}) {
    final s = _stat(adUnitName);
    Logger.adTable(
      '$adUnitName — $event',
      tag: _tag,
      rows: [
        ('Requests', '${s.requests}'),
        ('Shown', '${s.impressions}'),
        ('Load failed', '${s.loadFailed}'),
        ('Show failed', '${s.showFailed}'),
        ('Aborted', '${s.aborted}'),
        if (event != 'requested') ('Show rate', s.showRateLabel),
      ],
    );
  }
}

class _AdStat {

  _AdStat(this.adUnitName);
  final String adUnitName;
  int requests = 0;
  int impressions = 0;
  int loadFailed = 0;
  int showFailed = 0;
  int aborted = 0;

  String get showRateLabel {
    if (requests == 0) return '—';
    return '${(impressions / requests * 100).toStringAsFixed(1)}% ($impressions/$requests)';
  }
}
