# ✅ Checklist khi clone flutter_base2

> Theo đúng thứ tự dưới đây để đảm bảo project chạy được lần đầu.

---

## 1. Cài đặt môi trường

- [ ] Cài [FVM](https://fvm.app/): `dart pub global activate fvm`
- [ ] Cài Flutter SDK theo `.fvmrc`: `fvm install`
- [ ] Cài [Mason CLI](https://pub.dev/packages/mason_cli): `dart pub global activate mason_cli`
- [ ] Cài `lcov` (cho coverage): `brew install lcov`

---

## 2. Đổi tên & branding

- [ ] `make rename-package name="your_app"` — đổi name trong pubspec & imports
- [ ] `make rename-app name="Your App"` — đổi display name
- [ ] `make rename-bundle-id name="com.your.company.app"` — đổi bundle id
- [ ] Cập nhật `flavorizr.yaml`:
  - app.name cho mỗi flavor
  - android.applicationId
  - ios.bundleId
- [ ] Chạy `make gen-flavor` để generate flavor configs

---

## 3. Assets & icon

- [ ] Thay logo ở `assets/images/splash_logo.png` và `splash_logo_dark.png`
- [ ] Thay app icon ở `assets/icons/app_icon.png` (+ dev / stg variants)
- [ ] `make gen-icons` — generate launcher icons
- [ ] `make gen-splash` — generate native splash

---

## 4. Firebase setup

> 📌 Đặt config files **THẲNG** vào vị trí native (KHÔNG dùng intermediate
> folder). Đây là pattern chuẩn theo [Flutter docs](https://docs.flutter.dev/deployment/flavors).

- [ ] Tạo 3 Firebase projects trên [Firebase Console](https://console.firebase.google.com)
  (hoặc 1 project + 3 apps khác bundle ID)
- [ ] Thêm Android + iOS app vào mỗi project với bundle ID khớp `flavorizr.yaml`:

  | Flavor | Android applicationId | iOS bundleId |
  |---|---|---|
  | dev | `com.flutter.base.dev` | `com.flutter.base.dev` |
  | stg | `com.flutter.base.stg` | `com.flutter.base.stg` |
  | prod | `com.flutter.base` | `com.flutter.base` |

- [ ] Download config files & đặt **THẲNG** vào 6 vị trí native:

  **Android** (3 files):
  ```
  android/app/src/dev/google-services.json
  android/app/src/stg/google-services.json
  android/app/src/prod/google-services.json
  ```

  **iOS** (3 files — Xcode đã add references + build phase chọn theo scheme):
  ```
  ios/Runner/dev/GoogleService-Info.plist
  ios/Runner/stg/GoogleService-Info.plist
  ios/Runner/prod/GoogleService-Info.plist
  ```

> 💡 **KHÔNG cần** chạy `make gen-flavor` sau khi update Firebase configs —
> chỉ cần thay file trực tiếp.

---

## 5. Environment variables

- [ ] `cp .env.example .env.dev` — điền giá trị dev
- [ ] `cp .env.example .env.stg` — điền giá trị stg
- [ ] `cp .env.example .env.prod` — điền giá trị prod
- [ ] Kiểm tra `.gitignore` đã ignore `.env.*` (trừ `.env.example`)

---

## 5b. AdMob (nếu dùng ads)

- [ ] Đăng ký account ở [apps.admob.com](https://apps.admob.com)
- [ ] Lấy **App ID** thật (vd `ca-app-pub-XXXXXXXX~YYYYYYYY`)
- [ ] Thay App ID test trong:
  - `android/app/src/main/AndroidManifest.xml` (`<meta-data com.google.android.gms.ads.APPLICATION_ID>`)
  - `ios/Runner/Info.plist` (`GADApplicationIdentifier`)
- [ ] Tạo Ad Units (banner / interstitial / rewarded / native) trên AdMob console
- [ ] Cập nhật `lib/modules/ads/utils/ad_defaults.dart` — replace test IDs nếu dùng config local
- [ ] (Optional) Setup Firebase Remote Config key `ad_config` cho remote tuning

---

## 5c. RevenueCat (nếu dùng IAP)

- [ ] Đăng ký account ở [revenuecat.com](https://www.revenuecat.com)
- [ ] Tạo Apple + Google API keys
- [ ] Cập nhật `lib/core/common/constants/app_constants.dart`:
  - `revenueCatGoogleKey` — replace `'goog_placeholder'`
  - `revenueCatAppleKey` — replace `'appl_placeholder'`
  - `premiumEntitlement` — match với entitlement ID trên RevenueCat dashboard
- [ ] Setup products trên App Store Connect + Play Console
- [ ] Mapping products trên RevenueCat dashboard

---

## 5d. iOS Quick Actions (nếu dùng)

- [ ] Tạo 12 PNG icon trong `ios/Runner/Assets.xcassets/ic_shortcut_*.imageset/`
  - 4 shortcut × 3 scale (1x/2x/3x) = 12 files
  - Đọc `ios/Runner/Assets.xcassets/QUICK_ACTIONS_README.md` để biết cách dùng SF Symbols / Material Icons
- [ ] Xoá `QUICK_ACTIONS_README.md` sau khi add đủ

---

## 5e. iOS Permission messages (sửa cho phù hợp app)

`ios/Runner/Info.plist` đã có template VN — sửa lại cho phù hợp với use case thực:

- [ ] `NSCameraUsageDescription` — ví dụ: "Để upload avatar / chụp ảnh đăng bài"
- [ ] `NSPhotoLibraryUsageDescription` — ví dụ: "Để chọn ảnh từ thư viện"
- [ ] `NSLocationWhenInUseUsageDescription` — thêm nếu app dùng location
- [ ] `NSUserTrackingUsageDescription` — sửa message cho ATT prompt phù hợp

---

## 6. Generate code

- [ ] `make get` — pub get
- [ ] `make l10n` — generate localizations
- [ ] `make gen` — build_runner build
- [ ] Hoặc `make full-gen` để chạy 1 lệnh tất cả

---

## 7. Verify

- [ ] `make analyze` — không có lỗi
- [ ] `make format` — code đã format
- [ ] `make test` — tests pass
- [ ] `make run-dev` — app chạy trên emulator/device

---

## 8. CI/CD (tuỳ chọn)

- [ ] Tạo repo trên GitHub
- [ ] Push code lên
- [ ] Thêm secrets vào GitHub Actions:
  - `FIREBASE_TOKEN`
  - `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
  - `APPLE_ID`, `APP_SPECIFIC_PASSWORD` (cho iOS)
- [ ] Verify `.github/workflows/` chạy đúng trên PR

---

## 9. Trước khi production release

### Android — Release signing

- [ ] Tạo upload keystore (1 lần, lưu nơi an toàn):
  ```bash
  keytool -genkey -v -keystore android/upload-keystore.jks \
    -keyalg RSA -keysize 2048 -validity 10000 -alias upload
  ```
- [ ] `cp android/key.properties.example android/key.properties` — điền 4 giá trị thật
- [ ] Verify `.gitignore` đã skip `key.properties` + `*.jks` (đã có sẵn)
- [ ] Test release build: `make apk-prod` → Gradle log "Release keystore" (KHÔNG có ⚠️ fallback debug)
- [ ] Backup `upload-keystore.jks` + password ra **ít nhất 2 nơi** (mất = không update app trên Play Store được)

### Pre-release verify

- [ ] Bật Crashlytics trong Firebase Console
- [ ] Cấu hình Remote Config defaults
- [ ] Set up Play Console + App Store Connect
- [ ] `make aab-prod` — build AAB với keystore thật
- [ ] Test trên TestFlight / Internal Testing track
- [ ] Update version trong `pubspec.yaml`: `version: 1.0.0+1`

---

## 10. Cập nhật thường xuyên

- [ ] `make upgrade` — nâng cấp deps (test kỹ trước khi commit)
- [ ] Theo dõi Flutter stable channel
- [ ] Check `flutter pub outdated` mỗi tháng
