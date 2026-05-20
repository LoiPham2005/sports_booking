---
name: design-system
description: Theme tokens (color/dimension/text) + AppTheme + Localization (ARB + LocaleNotifier + auto-translate). Đọc khi style widget, đổi màu, thêm theme variant, hoặc dịch text.
---

# Design System — Theme + Localization

## 🎨 Architecture

```
lib/design/
├── theme/
│   ├── app_theme.dart                # AppTheme.fromVariant() → ThemeData
│   ├── app_component_themes.dart     # Material component themes
│   ├── styles/
│   │   ├── app_color_tokens.dart     # AppColorTokens (4 variants)
│   │   ├── app_dimensions.dart       # AppDimensions (constants)
│   │   └── app_text_styles.dart      # AppTextStyles (TextTheme builder)
│   └── providers/
│       └── theme_notifier.dart       # ThemeNotifier + AppThemeVariant enum
└── l10n/
    ├── providers/
    │   └── locale_notifier.dart      # LocaleNotifier (vi/en)
    └── translations/
        ├── app_en.arb
        └── app_vi.arb
```

## 🌈 AppColorTokens — 4 variants

**Path**: `lib/design/theme/styles/app_color_tokens.dart`

```dart
@immutable
class AppColorTokens {
  const AppColorTokens({
    required this.primary, this.onPrimary,
    required this.secondary, this.onSecondary,
    required this.surface, this.onSurface, this.surfaceVariant,
    required this.background, this.onBackground,
    required this.error, this.onError,
    required this.success, this.warning, this.info,
    required this.outline, this.shadow,
    required this.textPrimary, this.textSecondary, this.textTertiary,
    required this.divider, this.disabled,
    required this.red, this.green,
  });

  factory AppColorTokens.light() => ...;
  factory AppColorTokens.dark() => ...;
  factory AppColorTokens.red() => ...;    // Theme đỏ
  factory AppColorTokens.green() => ...;  // Theme xanh

  ColorScheme toColorScheme(Brightness brightness);
}
```

→ Dùng trong widget:
```dart
final tokens = AppColorTokens.light(); // hoặc của theme hiện tại
Container(color: tokens.surface, ...)
Text(text, style: TextStyle(color: tokens.textPrimary))
```

## 🎭 AppThemeVariant + ThemeNotifier

**Path**: `lib/design/theme/providers/theme_notifier.dart`

```dart
enum AppThemeVariant {
  light('Sáng'),
  dark('Tối'),
  red('Đỏ'),
  green('Xanh');

  const AppThemeVariant(this.label);
  final String label;
}

@Riverpod(keepAlive: true)
class ThemeNotifier extends _$ThemeNotifier {
  @override
  AppThemeVariant build() {
    // Restore từ LocalStorageService
  }

  Future<void> set(AppThemeVariant variant) async {
    state = variant;
    await getIt<LocalStorageService>().setString('theme_variant', variant.name);
  }
}
```

→ UI consume:
```dart
final variant = ref.watch(themeProvider);
ref.read(themeProvider.notifier).set(AppThemeVariant.green);
```

## 📐 AppTheme.fromVariant()

**Path**: `lib/design/theme/app_theme.dart`

```dart
abstract class AppTheme {
  static ThemeData fromVariant(AppThemeVariant variant) {
    final tokens = switch (variant) {
      AppThemeVariant.light => AppColorTokens.light(),
      AppThemeVariant.dark => AppColorTokens.dark(),
      AppThemeVariant.red => AppColorTokens.red(),
      AppThemeVariant.green => AppColorTokens.green(),
    };
    final brightness =
        variant == AppThemeVariant.dark ? Brightness.dark : Brightness.light;
    return _build(tokens, brightness);
  }
}
```

→ Setup trong `app.dart`:
```dart
final themeVariant = ref.watch(themeProvider);
MaterialApp.router(
  theme: AppTheme.fromVariant(themeVariant),
  ...
)
```

## ➕ Thêm theme variant mới

1. **Thêm factory** vào `AppColorTokens`:
   ```dart
   factory AppColorTokens.purple() => const AppColorTokens(
     primary: Color(0xFF7C3AED),
     // ... 22 fields còn lại
   );
   ```
2. **Thêm enum value**:
   ```dart
   enum AppThemeVariant {
     light('Sáng'), dark('Tối'), red('Đỏ'), green('Xanh'),
     purple('Tím'),  // ← thêm
   }
   ```
3. **Thêm case** vào `AppTheme.fromVariant()`:
   ```dart
   AppThemeVariant.purple => AppColorTokens.purple(),
   ```
4. `make gen` — UI Settings tự cập nhật vì dùng `.values`

## 📏 AppDimensions — spacing constants

**Path**: `lib/design/theme/styles/app_dimensions.dart`

```dart
abstract class AppDimensions {
  // Spacing
  static const double space2 = 2;
  static const double space4 = 4;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space24 = 24;
  // ...

  // Border radius
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;

  // Component sizes
  static const double buttonHeightMd = 44;
  static const double inputHeight = 48;

  // Icon sizes
  static const double iconMd = 20;
  static const double iconLg = 24;
}
```

→ Dùng thẳng:
```dart
SizedBox(height: AppDimensions.space16)
EdgeInsets.all(AppDimensions.space24)
```

→ Hoặc kết hợp `flutter_screenutil`:
```dart
SizedBox(height: 16.h)
EdgeInsets.all(24.w)
```

## ✏️ AppTextStyles

**Path**: `lib/design/theme/styles/app_text_styles.dart`

```dart
abstract class AppTextStyles {
  static const String fontFamily = 'Inter';

  static TextTheme theme(AppColorTokens t) => TextTheme(
    displayLarge: TextStyle(fontSize: 57, ...),
    headlineLarge: TextStyle(fontSize: 32, ...),
    titleLarge: TextStyle(fontSize: 22, ...),
    bodyLarge: TextStyle(fontSize: 16, ...),
    labelLarge: TextStyle(fontSize: 14, ...),
    // ... Material 3 type scale
  );
}
```

→ Dùng:
```dart
Text(text, style: Theme.of(context).textTheme.titleLarge)
// hoặc shortcut
Text(text, style: context.textTheme.titleLarge)
```

## 🌍 Localization

### Setup

**Path**: `lib/design/l10n/`

```
translations/
├── app_en.arb           # English
└── app_vi.arb           # Vietnamese (default)
```

**l10n.yaml** (root):
```yaml
arb-dir: lib/design/l10n/translations
template-arb-file: app_vi.arb
output-localization-file: app_localizations.dart
output-dir: lib/gen/l10n
nullable-getter: false
```

### Thêm key mới

1. Edit `app_vi.arb`:
   ```json
   {
     "welcome": "Chào mừng",
     "@welcome": { "description": "Welcome message" }
   }
   ```
2. Sync sang `app_en.arb`:
   ```bash
   make l10n-sync-translate    # auto-translate qua Google + gen-l10n
   # hoặc:
   make l10n-sync              # chỉ copy missing keys (placeholder)
   ```
3. `make l10n` — generate `lib/gen/l10n/app_localizations.dart`
4. Dùng:
   ```dart
   Text(context.l10n.welcome)
   ```

→ `context.l10n` từ `lib/core/common/extensions/l10n_extensions.dart`:
```dart
extension L10nX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}
```

### LocaleNotifier

**Path**: `lib/design/l10n/providers/locale_notifier.dart`

```dart
@Riverpod(keepAlive: true)
class LocaleNotifier extends _$LocaleNotifier {
  @override
  Locale build() {
    // Restore từ LocalStorageService, default 'vi'
  }

  Future<void> set(Locale locale) async {
    state = locale;
    await getIt<LocalStorageService>().setString('locale', locale.languageCode);
  }
}
```

→ Dùng:
```dart
final locale = ref.watch(localeProvider);
ref.read(localeProvider.notifier).set(const Locale('en'));
```

## 🔄 Tool tự động sync ARB

**Path**: `tools/l10n_sync.dart`

```bash
make l10n-sync                # Copy keys thiếu từ en → vi (giữ raw)
make l10n-sync-translate      # + auto-translate qua Google + gen-l10n
```

→ Phù hợp khi:
- Thêm 1 key vào `app_vi.arb` mà chưa có ở `app_en.arb`
- Muốn translate batch tự động

## 📂 Files quan trọng

| File | Vai trò |
|---|---|
| `lib/design/theme/styles/app_color_tokens.dart` | 4 color variants (light/dark/red/green) |
| `lib/design/theme/styles/app_dimensions.dart` | Spacing + sizes constants |
| `lib/design/theme/styles/app_text_styles.dart` | TextTheme builder |
| `lib/design/theme/app_theme.dart` | `fromVariant()` resolver |
| `lib/design/theme/providers/theme_notifier.dart` | ThemeNotifier + enum |
| `lib/design/l10n/providers/locale_notifier.dart` | LocaleNotifier |
| `lib/design/l10n/translations/app_*.arb` | Translations |
| `lib/core/common/extensions/l10n_extensions.dart` | `context.l10n` shortcut |
| `tools/l10n_sync.dart` | CLI tool sync ARB |

## ❌ Anti-patterns

```dart
// ❌ Hard-code màu trong widget
Container(color: Colors.blue)

// ✅ Dùng tokens từ theme
Container(color: Theme.of(context).colorScheme.primary)

// ❌ Hard-code text trong widget
Text('Welcome')

// ✅ Dùng context.l10n
Text(context.l10n.welcome)

// ❌ Tạo MaterialApp 2 lần (theme + darkTheme)
MaterialApp(theme: light, darkTheme: dark, themeMode: ThemeMode.system)

// ✅ V2 dùng 1 theme — variant chọn cả light/dark
MaterialApp.router(theme: AppTheme.fromVariant(themeVariant))
```
