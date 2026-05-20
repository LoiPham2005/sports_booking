import Flutter
import GoogleMobileAds
import UIKit
import google_mobile_ads

/// Native ad factory MEDIUM (~300pt height) — render khi
/// `NativeAd(factoryId: 'nativeMedium', ...)` được gọi từ Dart.
///
/// XIB: `NativeAdMediumView.xib`
class NativeAdFactoryMedium: FLTNativeAdFactory {

    func createNativeAd(
        _ nativeAd: GADNativeAd,
        customOptions: [AnyHashable: Any]? = nil
    ) -> GADNativeAdView? {
        guard let nibObjects = Bundle.main.loadNibNamed(
            "NativeAdMediumView", owner: nil, options: nil),
              let adView = nibObjects.first as? GADNativeAdView
        else {
            return nil
        }

        // Bind data
        (adView.headlineView as? UILabel)?.text = nativeAd.headline

        if let body = nativeAd.body {
            (adView.bodyView as? UILabel)?.text = body
            adView.bodyView?.isHidden = false
        } else {
            adView.bodyView?.isHidden = true
        }

        if let cta = nativeAd.callToAction {
            (adView.callToActionView as? UIButton)?.setTitle(cta, for: .normal)
            adView.callToActionView?.isHidden = false
        } else {
            adView.callToActionView?.isHidden = true
        }

        if let icon = nativeAd.icon?.image {
            (adView.iconView as? UIImageView)?.image = icon
            adView.iconView?.isHidden = false
        } else {
            adView.iconView?.isHidden = true
        }

        if let advertiser = nativeAd.advertiser {
            (adView.advertiserView as? UILabel)?.text = advertiser
            adView.advertiserView?.isHidden = false
        } else {
            adView.advertiserView?.isHidden = true
        }

        // CTA không nên auto-click bởi user gesture
        adView.callToActionView?.isUserInteractionEnabled = false

        // Bắt buộc — AdMob dùng để track click & impression
        adView.nativeAd = nativeAd

        return adView
    }
}
