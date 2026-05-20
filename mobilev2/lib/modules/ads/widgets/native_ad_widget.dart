import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_placements.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_manager.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

enum NativeAdSize { small, medium }

class NativeAdWidget extends StatefulWidget {
  const NativeAdWidget({
    required this.placement,
    super.key,
    this.size = NativeAdSize.medium,
  });

  final PlacementKey placement;
  final NativeAdSize size;

  @override
  State<NativeAdWidget> createState() => _NativeAdWidgetState();
}

class _NativeAdWidgetState extends State<NativeAdWidget> {
  NativeAd? _nativeAd;
  bool _isLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadAd();
  }

  void _loadAd() {
    final unit = getIt<AdManager>().nativeUnit(widget.placement);
    if (unit == null) return;

    final factoryId =
        widget.size == NativeAdSize.small ? 'nativeSmall' : 'nativeMedium';

    _nativeAd = NativeAd(
      adUnitId: unit.resolvedId,
      factoryId: factoryId,
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (_) {
          if (!mounted) return;
          setState(() => _isLoaded = true);
        },
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          // ⚡ Set _nativeAd = null để State.dispose() KHÔNG gọi dispose lần 2
          // (gây exception "Ad already disposed").
          _nativeAd = null;
          Logger.warning(
            'NativeAd[${widget.placement.key}] failed: ${error.message}',
            tag: 'ADS',
          );
        },
      ),
    )..load();
  }

  @override
  void dispose() {
    _nativeAd?.dispose();
    _nativeAd = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoaded || _nativeAd == null) return const SizedBox.shrink();
    final height = widget.size == NativeAdSize.small ? 80.h : 300.h;
    return SizedBox(
      width: double.infinity,
      height: height,
      child: AdWidget(ad: _nativeAd!),
    );
  }
}
