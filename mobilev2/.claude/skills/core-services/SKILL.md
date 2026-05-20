---
name: core-services
description: Services trong lib/core/services/ — AppAuth, Notification, Permission, AppVersion, QuickActions + utils Validators, DeviceInfo, ImagePickerUtils. Đọc khi cần auth flow, push notification local, request permission, check app version, force update dialog, hoặc pick ảnh.
---

# Core Services

## 📋 Danh sách services

| Service | Path | Plugin | Use case |
|---|---|---|---|
| `AppAuthNotifier` | `core/services/app_auth/` | — | Global auth state (Riverpod) |
| `NotificationService` | `core/services/notification/` | flutter_local_notifications | Local notification (KHÔNG push) |
| `PermissionService` | `core/services/permission/` | permission_handler | Request + auto dialog "Mở settings" |
| `AppVersionService` | `core/services/app_version/` | package_info_plus + firebase_remote_config | Force/optional update + dialog |
| `QuickActionsService` | `core/services/quick_actions/` | quick_actions | Home screen shortcuts |
| `Logger` | `core/services/utils/` | — | Pretty log + Crashlytics integration |
| `ImagePickerUtils` | `core/common/utils/` | image_picker + flutter_image_compress | Pick ảnh + compress + dialog |

## 🔐 AppAuthNotifier — Global auth state

**Path**: `lib/core/services/app_auth/app_auth_notifier.dart`

```dart
class AppAuthState {
  const AppAuthState({required this.isAuthenticated});
  final bool isAuthenticated;
}

@Riverpod(keepAlive: true)
class AppAuthNotifier extends _$AppAuthNotifier {
  @override
  AppAuthState build() {
    // Restore session từ SecureStorageService
    final token = getIt<SecureStorageService>().getAccessToken();
    return AppAuthState(isAuthenticated: token != null);
  }

  Future<void> login(String accessToken) async {
    await getIt<SecureStorageService>().setAccessToken(accessToken);
    state = const AppAuthState(isAuthenticated: true);
  }

  Future<void> logout() async {
    await getIt<SecureStorageService>().clearAll();
    state = const AppAuthState(isAuthenticated: false);
    // Reset DI để dispose services
    await resetAndReinitDependencies(environment: FlavorConfig.current.flavor.name);
  }
}
```

→ Dùng:
```dart
final auth = ref.watch(appAuthProvider);
if (auth.isAuthenticated) { ... }

await ref.read(appAuthProvider.notifier).login(token);
await ref.read(appAuthProvider.notifier).logout();
```

→ Trigger `AuthRefreshNotifier` → GoRouter chạy lại redirect.

## 📬 NotificationService

**Path**: `lib/core/services/notification/notification_service.dart`

### Setup
```dart
// AppInitializer:
await getIt<NotificationService>().initialize();

// Đăng ký callback routing (caller tự quyết định route):
getIt<NotificationService>().onTap = (payload) {
  switch (payload) {
    case 'go_premium': appContext.go('/premium');
    case 'open_voucher': appContext.go('/vouchers');
  }
};
```

### Show notification
```dart
await getIt<NotificationService>().showNotification(
  id: 1,
  title: 'Khuyến mãi mới!',
  body: 'Voucher giảm 50%',
  payload: 'open_voucher',
);

// Cancel
await getIt<NotificationService>().cancel(1);
await getIt<NotificationService>().cancelAll();
```

> ⚠️ `scheduleNotification()` chưa implement — cần `tz.initializeTimeZones()` trước. TODO trong code.

## 🔐 PermissionService

**Path**: `lib/core/services/permission/permission_service.dart`

```dart
final perm = getIt<PermissionService>();

// Single permission với auto dialog "Mở settings" nếu permanently denied
final ok = await perm.requestCamera(context);
final ok = await perm.requestPhotos(context);
final ok = await perm.requestLocation(context);
final ok = await perm.requestNotification(context);

// Generic
final ok = await perm.request(Permission.contacts, context: context);

// Multiple
final map = await perm.requestMultiple([
  Permission.camera,
  Permission.microphone,
], context: context);

// Check không request
final granted = await perm.isGranted(Permission.camera);

// Mở settings
await perm.openSettings();
```

> iOS Info.plist: phải có `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`...

## 🆙 AppVersionService — Force/optional update

**Path**: `lib/core/services/app_version/app_version_service.dart`

### Firebase Remote Config keys

| Key | Type | Mô tả |
|---|---|---|
| `force_update_version` | string | App version < này → bắt buộc update |
| `latest_version` | string | App version < này → optional update |
| `update_message` | string | Message trong dialog |
| `update_url_android` | string | Override Play Store URL |
| `update_url_ios` | string | Override App Store URL |

### Use (gọi từ Splash hoặc Settings page)

```dart
final svc = getIt<AppVersionService>();
final result = await svc.checkForUpdate(
  context: context,
  labels: AppVersionLabels.vi,  // hoặc .en
  storeIds: const StoreIds(
    androidPackage: 'com.flutter.base',
    iosAppId: '1234567890',
  ),
);

switch (result) {
  case UpdateCheckResult.forceUpdate: break;     // dialog đã hiện
  case UpdateCheckResult.upToDate: context.go(RouteNames.main);
  default: context.go(RouteNames.main);
}
```

→ Đã wire vào `AppInitializer._initAppVersion()` — fetch RemoteConfig ngay khi boot.

## ⚡ QuickActionsService — Home screen shortcuts

**Path**: `lib/core/services/quick_actions/quick_actions_service.dart`

### Setup
```dart
final qa = getIt<QuickActionsService>();
await qa.initialize(
  onAction: (type) {
    switch (type) {
      case 'search': appContext.go('/search');
      case 'scan': appContext.go('/scanner');
      case 'logout': ref.read(appAuthProvider.notifier).logout();
    }
  },
);

// Set list (đổi theo auth state)
await qa.setActions([
  const QuickActionItem(type: 'search', label: 'Tìm kiếm', icon: 'ic_shortcut_search'),
  const QuickActionItem(type: 'scan', label: 'Quét QR', icon: 'ic_shortcut_scan'),
]);
```

### Native icon paths

- Android: `android/app/src/main/res/drawable/ic_shortcut_{search,logout,login,scan}.xml` (đã có sẵn)
- iOS: `ios/Runner/Assets.xcassets/ic_shortcut_*.imageset/` (cần thêm PNG — đọc `QUICK_ACTIONS_README.md`)

## 📷 ImagePickerUtils

**Path**: `lib/core/common/utils/image_picker_utils.dart`

```dart
// Dialog chọn nguồn (gallery / camera)
final file = await ImagePickerUtils.showSourceDialog(context);

// Pick trực tiếp
final file = await ImagePickerUtils.pickFromGallery(context);
final file = await ImagePickerUtils.pickFromCamera(context);

// Pick nhiều
final files = await ImagePickerUtils.pickMultiple(context, maxCount: 5);

// Compress
final compressed = await ImagePickerUtils.compressImage(
  file,
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
);

// Placeholder color cho avatar default
final color = ImagePickerUtils.getPlaceholderColor(user.name);
```

→ Tự check + request permission (Camera, Photos).

## ✅ Validators

**Path**: `lib/core/common/utils/validators.dart`

```dart
// Sử dụng trong TextFormField
TextFormField(
  validator: Validators.email,
  // hoặc combine với lambda:
  validator: (v) => Validators.password(v, minLength: 8),
);

// Composite — multiple rules
TextFormField(
  validator: Validators.loginForm,  // email OR phone
);

// Methods chính
Validators.required(value, fieldName: 'Email')   // not empty
Validators.email(value)                           // email format
Validators.phoneVN(value)                         // VN phone (03/05/07/08/09)
Validators.username(value)                        // 3-20 alphanumeric
Validators.name(value)                            // VN name (chữ + space)
Validators.password(value, minLength: 6)          // basic
Validators.strongPassword(value)                  // upper + lower + digit + special
Validators.otp(value, length: 6)                  // 6 digits
Validators.url(value)
Validators.creditCard(value)                      // Luhn check
```

## 📱 DeviceInfo

**Path**: `lib/core/common/utils/device_info.dart`

```dart
// Platform checks
DeviceInfo.isWeb / isIOS / isAndroid / isMobile / isDesktop

// App info (cached)
await DeviceInfo.getPackageInfo();
await DeviceInfo.getAppVersion();    // '1.0.0'
await DeviceInfo.getBuildNumber();   // '1'
await DeviceInfo.getPackageName();   // 'com.flutter.base.dev'

// Device info (cached)
await DeviceInfo.getDeviceId();      // unique per device
await DeviceInfo.getModel();         // 'iPhone 15'
await DeviceInfo.getOSVersion();     // '17.4'
await DeviceInfo.isPhysicalDevice(); // false trên simulator

// Clear cache nếu cần
DeviceInfo.clearCache();
```

## 🔒 SafeCompleter — tránh "Future already completed"

**Path**: `lib/core/common/utils/safe_completer.dart`

```dart
final completer = SafeCompleter<String>();
completer.complete('first');
completer.complete('second');  // ignored, không throw

// Tương đương: Completer<T> + check isCompleted
```

→ Dùng cho async race condition (vd. dialog dismiss).

## 📝 Logger

**Path**: `lib/core/services/utils/logger.dart`

```dart
Logger.info('Message', tag: 'AUTH');
Logger.warning('Token expiring', tag: 'AUTH');
Logger.success('Login OK', tag: 'AUTH');
Logger.debug('Cache hit: user_123');

Logger.error(
  'Failed',
  error: exception,
  stackTrace: stackTrace,
  tag: 'API',
);

// HTTP logs (auto từ LoggingInterceptor)
Logger.httpRequest('POST', '/api/login', data: {...});
Logger.httpResponse('POST', '/api/login', 200, duration: ...);

// Table-formatted log cho debug ads
Logger.adTable('Inter loaded', tag: 'ADS', rows: [
  ('Type', 'inter'),
  ('Placement', 'splash'),
]);
```

→ Auto:
- Mask sensitive fields (password, token, otp, ...) trong release
- Send error → `FirebaseCrashlytics.instance.recordError()` nếu release
- Skip log nếu `FlavorConfig.current.enableLogging == false`

## 📂 Files quan trọng

| File | Mục đích |
|---|---|
| `lib/core/services/app_auth/app_auth_notifier.dart` | Global auth state |
| `lib/core/services/notification/notification_service.dart` | Local noti |
| `lib/core/services/permission/permission_service.dart` | Permission wrapper |
| `lib/core/services/app_version/app_version_service.dart` | Force update |
| `lib/core/services/quick_actions/quick_actions_service.dart` | Home shortcuts |
| `lib/core/services/utils/logger.dart` | Pretty logger |
| `lib/core/services/utils/navigation_service.dart` | Global navigator key |
| `lib/core/common/utils/validators.dart` | Form validators |
| `lib/core/common/utils/device_info.dart` | Device + app info |
| `lib/core/common/utils/image_picker_utils.dart` | Image picker + compress |
| `lib/core/common/utils/safe_completer.dart` | Safe Completer<T> |
