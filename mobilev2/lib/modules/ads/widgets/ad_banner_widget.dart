import 'package:flutter/material.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_config.dart';
import 'package:sports_booking_mobile/modules/ads/models/ad_placements.dart';
import 'package:sports_booking_mobile/modules/ads/services/ad_manager.dart';
import 'package:sports_booking_mobile/modules/ads/utils/ad_sizes.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdBannerWidget extends StatefulWidget {
  const AdBannerWidget({required this.placement, super.key});

  /// Placement type trong `AdConfig.banner` (vd: `BannerPlacement.home`).
  final BannerPlacement placement;

  @override
  State<AdBannerWidget> createState() => _AdBannerWidgetState();
}

class _AdBannerWidgetState extends State<AdBannerWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;
  bool _isLoading = false;
  AdSize? _adSize;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // ⚡ didChangeDependencies fires nhiều lần (rotate, keyboard, theme...).
    // 2 guard: _isLoaded (đã xong) HOẶC _isLoading (đang chạy) → bỏ qua.
    if (_isLoaded || _isLoading) return;
    _loadAd();
  }

  Future<void> _loadAd() async {
    if (_isLoaded || _isLoading) return;
    _isLoading = true;

    final size = await AdSizes.adaptiveBanner(context);
    if (!mounted) {
      _isLoading = false;
      return;
    }

    final unit = getIt<AdManager>().bannerUnit(widget.placement);
    if (unit == null) {
      _isLoading = false;
      return;
    }

    _bannerAd = BannerAd(
      adUnitId: unit.resolvedId,
      request: const AdRequest(),
      size: size,
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          if (!mounted) {
            ad.dispose();
            return;
          }
          setState(() {
            _bannerAd = ad as BannerAd;
            _isLoaded = true;
            _isLoading = false;
            _adSize = size;
          });
        },
        onAdFailedToLoad: (ad, err) {
          ad.dispose();
          // ⚡ Reset state để widget có thể retry trong didChangeDependencies sau.
          _bannerAd = null;
          _isLoading = false;
          Logger.warning(
            'BannerAd[${widget.placement.key}] failed: ${err.message}',
            tag: 'ADS',
          );
        },
      ),
    );
    // ignore: unawaited_futures
    _bannerAd?.load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    _bannerAd = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoaded || _bannerAd == null || _adSize == null) {
      return const SizedBox.shrink();
    }
    return Container(
      alignment: Alignment.center,
      width: _adSize!.width.toDouble(),
      height: _adSize!.height.toDouble(),
      child: AdWidget(ad: _bannerAd!),
    );
  }
}
