---
name: firebase-flavors
description: Multi-flavor (dev/stg/prod) + Firebase setup per flavor. Đọc khi setup Firebase project mới, đổi bundle ID, troubleshoot flavorizr, hoặc cấu hình build native (AndroidManifest, Info.plist, Gradle).
---

# Multi-flavor + Firebase Setup

## 🎯 Architecture

### 3 entry files
```
lib/
├── main_common.dart      # Zone, error handler, AppInitializer
├── main_dev.dart         # FlavorConfig.setFlavor(dev) → mainCommon()
├── main_stg.dart         # FlavorConfig.setFlavor(stg) → mainCommon()
└── main_prod.dart        # FlavorConfig.setFlavor(prod) → mainCommon()
```

### Bundle IDs (`flavorizr.yaml`)
| Flavor | Android applicationId | iOS bundleId | App name |
|---|---|---|---|
| dev | `com.flutter.base.dev` | `com.flutter.base.dev` | `AppDev` |
| stg | `com.flutter.base.stg` | `com.flutter.base.stg` | `AppStg` |
| prod | `com.flutter.base` | `com.flutter.base` | `App` |

### FlavorConfig
```dart
// lib/config/app/flavor_config.dart
enum AppFlavor { dev, stg, prod }

@immutable
class FlavorConfig {
  // Set 1 lần ở main_*.dart
  static void setFlavor(AppFlavor flavor) { ... }

  static FlavorConfig get current { ... }
  static bool get isDev / isStg / isProd;

  final AppFlavor flavor;
  final String apiBaseUrl;
  final String appName;
  final bool enableLogging;       // dev: true, stg: true, prod: false
  final bool enableCrashlytics;   // dev: false, stg: true, prod: true
  final bool enableAnalytics;     // dev: false, stg: true, prod: true
}
```

## 🔥 Firebase per-flavor

### File locations (EDIT THẲNG — không qua intermediate folder)

```
android/app/src/dev/google-services.json
android/app/src/stg/google-services.json
android/app/src/prod/google-services.json

ios/Runner/dev/GoogleService-Info.plist
ios/Runner/stg/GoogleService-Info.plist
ios/Runner/prod/GoogleService-Info.plist
```

→ Đặt files thật vào đây trực tiếp. **KHÔNG** dùng `firebase/` folder intermediate.

### Khi đổi Firebase project

```bash
# 1. Download config mới từ Firebase Console
# 2. Replace files vào 6 vị trí trên
# 3. flutter clean (Android cache)
# 4. make run-dev
# Done. KHÔNG cần gen-flavor.
```

### iOS Xcode tự chọn theo scheme

Flavorizr đã setup Run Script Phase trong `Runner.xcodeproj` để copy đúng plist theo scheme:
- Build scheme `Runner-dev` → load `ios/Runner/dev/GoogleService-Info.plist`
- Build scheme `Runner-stg` → load `ios/Runner/stg/...`
- Build scheme `Runner-prod` → load `ios/Runner/prod/...`

### Android Gradle plugins

**`android/settings.gradle.kts`** đã có:
```kotlin
id("com.google.gms.google-services") version "4.4.2" apply false
id("com.google.firebase.crashlytics") version "3.0.2" apply false
```

**`android/app/build.gradle.kts`** đã apply:
```kotlin
plugins {
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}
```

→ Build cần `google-services.json` ở `android/app/src/{flavor}/` — nếu thiếu sẽ fail với "No matching client for package name".

## 🔧 flutter_flavorizr

### ⚠️ KHÔNG idempotent

Mỗi lần `make gen-flavor` chạy full → OVERWRITE:
- `lib/app.dart`
- `ios/Runner/Info.plist`
- `android/app/build.gradle.kts`
- Tạo template `lib/flavors.dart`, `lib/main.dart`, `lib/pages/`

### flavorizr.yaml có `instructions:` block bảo vệ

```yaml
# Mặc định chỉ chạy assets:download/extract + google:firebase + clean
# (KHÔNG touch app.dart/Info.plist/build.gradle.kts)
instructions:
  - assets:download
  - assets:extract
  - google:firebase
  - assets:clean
```

→ `make gen-flavor` an toàn — chỉ copy Firebase configs.

### Khi nào RE-INIT flavor từ đầu?

Hiếm. Chỉ khi:
- Đổi bundle ID toàn diện
- Add flavor mới (vd. `staging2`)

Workflow:
1. Comment block `instructions:` trong flavorizr.yaml
2. Chạy `make gen-flavor` (chấp nhận full run)
3. `git checkout -- lib/app.dart ios/Runner/Info.plist android/app/build.gradle.kts`
4. `rm -rf lib/flavors.dart lib/main.dart lib/pages .tmp assets.tmp.zip`
5. Uncomment lại `instructions:` block

## 📱 Native config

### AndroidManifest.xml — đã setup
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="com.android.vending.BILLING"/>

<application android:label="@string/app_name" ...>
    <!-- AdMob App ID — test ID, đổi khi release -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-3940256099942544~3347511713"/>
</application>
```

### iOS Info.plist — đã setup
```xml
<!-- AdMob -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>

<!-- App Tracking Transparency -->
<key>NSUserTrackingUsageDescription</key>
<string>Quyền truy cập IDFA giúp chúng tôi...</string>

<!-- ImagePicker -->
<key>NSCameraUsageDescription</key>
<key>NSPhotoLibraryUsageDescription</key>
<key>NSPhotoLibraryAddUsageDescription</key>
<key>NSMicrophoneUsageDescription</key>

<!-- SKAdNetwork (15 IDs) -->
<key>SKAdNetworkItems</key>
<array>...</array>
```

→ Đổi message phù hợp app khi release.

## 🔑 Android Release Signing

### key.properties.example template

```properties
storeFile=upload-keystore.jks
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
storePassword=YOUR_STORE_PASSWORD
```

### Setup (production)

```bash
# 1. Tạo keystore (1 lần — backup ra 2+ nơi)
keytool -genkey -v -keystore android/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# 2. Copy template + điền giá trị thật
cp android/key.properties.example android/key.properties

# 3. Test
make aab-prod
# → log "Using release keystore" (KHÔNG có ⚠️ fallback debug)
```

### Smart signing pattern

`android/app/build.gradle.kts` tự fallback:
- `key.properties` + keystore tồn tại → release signing + R8 minify + ProGuard
- Không có → debug signing (dev vẫn `flutter run --release` được)

### ProGuard rules

`android/app/proguard-rules.pro` đã có keep clauses cho:
- Flutter, Firebase, Google Mobile Ads
- Retrofit/OkHttp/Gson
- Kotlin coroutines
- flutter_local_notifications, RevenueCat, permission_handler

## 🚀 Production checklist

| Item | File | Action |
|---|---|---|
| AdMob App ID Android | `AndroidManifest.xml` | Thay test ID |
| AdMob App ID iOS | `Info.plist GADApplicationIdentifier` | Thay test ID |
| RevenueCat keys | `AppConstants.revenueCatGoogleKey/AppleKey` | Replace `placeholder` |
| Android signing | `android/key.properties` | Tạo + điền |
| Permission messages iOS | `Info.plist NSXxxUsageDescription` | Sửa cho phù hợp |
| Firebase project | Console + 6 config files | Real (không phải v1 stale) |

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `flavorizr.yaml` | Bundle IDs + Firebase paths + instructions block |
| `lib/config/app/flavor_config.dart` | FlavorConfig singleton |
| `android/app/build.gradle.kts` | Plugins + signing + R8 + dependencies |
| `android/app/flavorizr.gradle.kts` | productFlavors (auto-gen) |
| `android/app/proguard-rules.pro` | Keep rules cho deps |
| `android/key.properties.example` | Template signing |
| `ios/Runner/Info.plist` | AdMob + ATT + permissions |
| `android/app/src/{flavor}/google-services.json` | Firebase Android per-flavor |
| `ios/Runner/{flavor}/GoogleService-Info.plist` | Firebase iOS per-flavor |

## ❌ Anti-patterns

```dart
// ❌ Đọc bundle ID hard-coded
const packageId = 'com.example.app';

// ✅ Đọc từ DeviceInfo
final packageId = await DeviceInfo.getPackageName();

// ❌ Switch theo string flavor
if (env == 'dev') { ... }

// ✅ FlavorConfig getters
if (FlavorConfig.isDev) { ... }
```
