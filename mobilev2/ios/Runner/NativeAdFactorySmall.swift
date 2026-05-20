import Flutter
import GoogleMobileAds
import UIKit
import google_mobile_ads

/// Native ad factory SMALL (~80pt height) — banner-like.
/// XIB: `NativeAdSmallView.xib`
class NativeAdFactorySmall: FLTNativeAdFactory {

    func createNativeAd(
        _ nativeAd: GADNativeAd,
        customOptions: [AnyHashable: Any]? = nil
    ) -> GADNativeAdView? {
        guard let nibObjects = Bundle.main.loadNibNamed(
            "NativeAdSmallView", owner: nil, options: nil),
              let adView = nibObjects.first as? GADNativeAdView
        else {
            return nil
        }

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

        adView.callToActionView?.isUserInteractionEnabled = false
        adView.nativeAd = nativeAd

        return adView
    }
}
