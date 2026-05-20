import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_placements.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_manager.dart';
import 'package:injectable/injectable.dart';

/// Gắn vào MaterialApp để theo dõi vòng đời.
/// Tự động hiển thị App Open ad khi app resume từ background.
@lazySingleton
class AdLifecycleObserver extends WidgetsBindingObserver {
  AdLifecycleObserver(this._adManager);

  final AdManager _adManager;

  void init() {
    WidgetsBinding.instance.addObserver(this);
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _adManager.showAppOpen(AppOpenPlacement.resume);
    }
  }
}
