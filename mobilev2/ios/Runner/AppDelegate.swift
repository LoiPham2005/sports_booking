import Flutter
import UIKit
import google_mobile_ads

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    // ⚡ Register native ad factories — `factoryId` phải match Dart:
    //    NativeAd(factoryId: 'nativeMedium', ...) / 'nativeSmall'
    let mediumFactory = NativeAdFactoryMedium()
    let smallFactory = NativeAdFactorySmall()

    FLTGoogleMobileAdsPlugin.registerNativeAdFactory(
      engineBridge.pluginRegistry,
      factoryId: "nativeMedium",
      nativeAdFactory: mediumFactory
    )
    FLTGoogleMobileAdsPlugin.registerNativeAdFactory(
      engineBridge.pluginRegistry,
      factoryId: "nativeSmall",
      nativeAdFactory: smallFactory
    )
  }
}
