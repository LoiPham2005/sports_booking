---
name: shared-ui-extensions
description: Catalog Shared widgets (AppScaffold, AppButton, AppTextField, dialogs, state widgets) + Common extensions (context/string/datetime/list/number/widget/assets/l10n) + Shared models (BaseEntity, CommonParam, NoParams) + UseCase base. Đọc khi build page mới và muốn biết có gì sẵn để tái sử dụng, hoặc thấy code lặp cần check xem đã có extension/helper chưa.
---

# Shared Widgets + Extensions + Models

## 🧩 Shared widgets (lib/shared/widgets/)

### `AppScaffold` — base scaffold + auto unfocus

```dart
AppScaffold(
  appBar: AppBar(title: Text(context.l10n.title)),
  body: ...,
  unfocusOnTap: true,    // default true — tap ngoài → đóng keyboard
  safeArea: true,        // default true
  resizeToAvoidBottomInset: true,
  floatingActionButton: ...,
  bottomNavigationBar: ...,
)
```

→ Khác `Scaffold` thường:
1. Tap ngoài tự dismiss keyboard (`unfocusOnTap`)
2. Body bọc `SafeArea` mặc định
3. Background dùng theme nếu không truyền

→ **Luôn dùng AppScaffold** thay `Scaffold` cho mọi page (trừ khi cần custom hành vi).

### `AppButton` — 3 variants × 3 sizes

```dart
AppButton(
  label: 'Đăng nhập',
  onPressed: () => ...,
  variant: AppButtonVariant.filled,   // filled | outlined | text
  size: AppButtonSize.md,              // sm (40) | md (48) | lg (56)
  icon: Icons.login,
  isLoading: state.isLoading,          // show CircularProgress
  expand: true,                        // full width (default true)
)
```

→ `isLoading: true` hoặc `onPressed: null` → disabled. Loading hiển thị spinner thay text/icon.

### `AppTextField` — TextFormField wrapper

```dart
AppTextField(
  controller: emailCtl,
  label: context.l10n.email,
  hint: 'you@example.com',
  prefixIcon: const Icon(Icons.email_outlined),
  keyboardType: TextInputType.emailAddress,
  textInputAction: TextInputAction.next,
  validator: Validators.email,
  onChanged: (v) => ...,
)
```

→ Decoration auto-theme từ `inputDecorationTheme`. Validator nên dùng từ `Validators` (skill `core-services`).

### State widgets (lib/shared/widgets/states/)

```dart
// Loading — center spinner + optional message
LoadingWidget(message: 'Đang tải...');

// Empty — icon + title + optional message + optional action
EmptyWidget(
  title: 'Chưa có sản phẩm',
  message: 'Thử thêm filter khác',
  icon: Icons.inbox_outlined,    // default
  action: AppButton(label: 'Reset', onPressed: notifier.refresh),
);

// Error retry — icon + message + retry button
ErrorRetry(
  message: state.error.toString(),
  onRetry: notifier.refresh,
  icon: Icons.cloud_off,    // default Icons.error_outline
);
```

→ Dùng trong `switch (state)` ở page (đọc `skill: state-management`).

### `AppConfirmationDialog`

```dart
final confirmed = await AppConfirmationDialog.show(
  context,
  title: 'Xoá sản phẩm?',
  message: 'Hành động này không thể hoàn tác.',
  confirmText: 'Xoá',
  cancelText: 'Huỷ',
  destructive: true,   // confirm button → màu error
);

if (confirmed) {
  await ref.read(productProvider.notifier).delete(id);
}
```

→ `destructive: true` style confirm button bằng `colorScheme.error`.

## 🪄 BuildContext extensions (`context_extensions.dart`)

```dart
// Theme & MediaQuery
context.theme;          // ThemeData
context.colors;         // ColorScheme
context.textTheme;      // TextTheme
context.isDark;         // theme.brightness == Brightness.dark

context.mq;             // MediaQueryData
context.screenSize;     // Size
context.screenWidth;    // double
context.screenHeight;
context.padding;        // safeArea padding
context.viewInsets;     // keyboard inset
context.isKeyboardOpen; // viewInsets.bottom > 0

// Focus
context.unfocus();      // = FocusScope.of(this).unfocus()
context.hideKeyboard(); // alias

// Navigation (Material — KHÔNG dùng cho go_router routes)
context.nav;
context.navPush(SettingsPage());
context.navPop();
context.canNavPop;
```

**Global**:
```dart
appContext;          // BuildContext (throw nếu router chưa ready)
appContextOrNull;    // BuildContext?
```

→ `appContext` dùng trong service/observer (ngoài widget tree). Đọc skill `app-boot`.

## 🌐 l10n extension (`l10n_extensions.dart`)

```dart
context.l10n.welcome;     // shortcut cho AppLocalizations.of(context).welcome
context.l10n.helloUser(userName);
```

→ Luôn dùng `context.l10n.X` thay `AppLocalizations.of(context)!.X`.

## ✂️ String extensions (`string_extensions.dart`)

```dart
// State
''.isBlank;            // true
'  '.isBlank;          // true
'x'.isNotBlank;        // true

// Case
'hello'.capitalize;    // 'Hello'
'hello world'.titleCase;  // 'Hello World'

// Validation
'a@b.c'.isEmail;             // true
'0987654321'.isValidPhoneVN; // true (đầu số 03/05/07/08/09)
'+1234567890'.isValidPhone;  // true (generic 8-15 digits)

// Manipulation
'long text...'.truncate(10);             // 'long te...'
'Hà Nội'.removeDiacritics();             // 'Ha Noi'
'0987654321'.maskPhone();                // '098****321'
'john.doe@gmail.com'.maskEmail();        // 'j*******@gmail.com'

// Parsing
'42'.toIntOrDefault();        // 42
'abc'.toIntOrDefault(0);      // 0

// Nullable
String? x;
x.isNullOrEmpty;              // true
x.isNullOrBlank;
x.orEmpty();                  // ''
```

## 📅 DateTime extensions (`datetime_extensions.dart`)

```dart
final dt = DateTime.now();

dt.isToday;            // bool
dt.isYesterday;        // bool

dt.format();                 // 'dd/MM/yyyy'
dt.format('yyyy-MM-dd');     // custom pattern
dt.formatTime();             // 'HH:mm'
dt.formatDateTime();         // 'dd/MM/yyyy HH:mm'
dt.timeAgo;                  // 'Vừa xong' / '5 phút trước' / '2 giờ trước' / '3 ngày trước'
```

## 🔢 Number extensions (`number_extensions.dart`)

### Duration constructors

```dart
3.milliseconds   // Duration(milliseconds: 3)
5.seconds        // Duration(seconds: 5)
2.minutes        // Duration(minutes: 2)
1.hours
7.days

// Dùng:
await Future.delayed(500.milliseconds);
Timer(10.seconds, () => ...);
```

### Number formatting

```dart
1234567.toCurrency();                         // '1.234.567 ₫'
50000.toCurrency(symbol: '\$', locale: 'en_US'); // '$50,000'

0.456.toPercentage();                         // '45.6%'
0.456.toPercentage(decimals: 0);              // '46%'

3.14159.roundTo(2);                           // 3.14
```

## 📜 List extensions (`list_extensions.dart`)

```dart
// Distinct theo key
users.distinctBy((u) => u.id);

// Group thành Map
orders.groupBy((o) => o.status);
// → {'paid': [...], 'pending': [...]}

// Min/max theo metric
products.maxBy((p) => p.price);    // most expensive (or null if empty)
products.minBy((p) => p.price);

// Chia chunk
[1, 2, 3, 4, 5].chunk(2);          // [[1,2], [3,4], [5]]

// Numeric list
[1, 2, 3].sum;                     // 6
[1, 2, 3].average;                 // 2.0
```

## 🎨 Widget chain extensions (`widget_extensions.dart`)

```dart
Text('Hello')
  .paddingAll(16.w)
  .center()
  .onTap(() => print('tap'))

Text('x').paddingSymmetric(h: 16, v: 8);
Text('x').paddingOnly(l: 8, t: 4);

Text('x').expanded(flex: 2);
Text('x').flexible();

Text('x').onTap(() {});           // GestureDetector — no ripple
Text('x').inkWell(onTap: () {});  // InkWell — ripple (cần Material)

Image.asset(...).rounded(radius: 12);

state.value != null
  ? const LoadingWidget()
  : Container().visible(false);   // = SizedBox.shrink()

Container().opacity(0.5);
```

> ⚠️ `paddingAll` trả `Padding` **non-const** → trong ListView item rebuild nhiều, dùng `const Padding(...)` thẳng để giữ const tree.

## 🖼️ Asset path extensions (`assets_extensions.dart`)

```dart
'assets/icons/logo.svg'.toSvg(width: 24, color: Colors.red);
'assets/images/banner.png'.toImage(fit: BoxFit.cover);
'assets/lottie/loading.json'.lottie(repeat: true);

// Auto-detect SVG/raster
'assets/any.svg_or_png'.toWidget(width: 100);

// Predicates
'a.svg'.isSvg;       // true
'a.png'.isImage;     // true
'a.json'.isLottie;
```

## 📦 Shared models

### `BaseEntity` — Equatable wrapper

**Path**: `lib/shared/models/base/base_entity.dart`

```dart
abstract class BaseEntity extends Equatable {
  const BaseEntity();

  @override
  bool? get stringify => true;   // toString debug-friendly
}
```

→ **Khi nào dùng**: cho **Domain entity** (khi có Domain layer). Cho **Data model** dùng `@freezed` thay vì BaseEntity.

```dart
// Domain entity
class User extends BaseEntity {
  const User({required this.id, required this.name});
  final String id;
  final String name;

  @override
  List<Object?> get props => [id, name];
}
```

### `CommonParam` — Filter/pagination params chuẩn

**Path**: `lib/shared/models/base/common_param.dart`

```dart
@freezed
abstract class CommonParam with _$CommonParam {
  const factory CommonParam({
    @JsonKey(name: 'page') @Default(1) int page,
    @JsonKey(name: 'per_page') @Default(20) int perPage,
    @JsonKey(name: 'sort') String? sort,
    @JsonKey(name: 'order') String? order,        // 'asc' | 'desc'
    @JsonKey(name: 'q') String? query,
  }) = _CommonParam;

  factory CommonParam.fromJson(Map<String, dynamic> json) =>
      _$CommonParamFromJson(json);
}
```

→ Dùng làm `@Queries() CommonParam` cho list endpoint:
```dart
@GET('/products')
Future<ApiResponse<ApiPaginatedData<ProductModel>>> list(
  @Queries() CommonParam params,
);

// Call:
service.list(const CommonParam(page: 1, perPage: 20, query: 'laptop'));
```

→ Feature-specific filter → tạo `ProductFilterParam` riêng (kế thừa style — `@freezed` + `@JsonKey`).

### `NoParams` — UseCase không có input

**Path**: `lib/core/base/usecases/usecase.dart`

```dart
class NoParams {
  const NoParams();
}

abstract class NoParamUseCase<Type> {
  const NoParamUseCase();
  Future<Result<Type>> call();
}

abstract class UseCase<Type, Params> {
  const UseCase();
  Future<Result<Type>> call(Params params);
}
```

→ **Khi nào dùng UseCase**: chỉ khi có **Domain layer** (Repository + UseCase). Feature đơn giản → service inject thẳng vào notifier (đọc `skill: state-management`).

```dart
@LazySingleton()
class GetProductsUseCase extends UseCase<List<Product>, ProductFilter> {
  const GetProductsUseCase(this._repo);
  final ProductRepository _repo;

  @override
  Future<Result<List<Product>>> call(ProductFilter params) =>
      _repo.getProducts(params);
}

// In notifier:
final useCase = getIt<GetProductsUseCase>();
Future<void> load() => runResult(action: () => useCase(filter));
```

## ✅ Quy tắc tái sử dụng

1. **Trước khi viết util mới** → grep extension hiện có:
   ```bash
   grep -r "extension.*on String" lib/core/common/extensions/
   ```
2. **Trước khi viết widget mới** → check `lib/shared/widgets/` có chưa
3. **Page mới**: bắt buộc dùng `AppScaffold`, `AppButton`, `AppTextField`, `LoadingWidget`/`EmptyWidget`/`ErrorRetry`
4. **Text styling**: `context.textTheme.X` + `context.colors.X` (KHÔNG hard-code màu)
5. **i18n**: `context.l10n.X` (KHÔNG hard-code text)
6. **Spacing**: `AppDimensions.spaceX` hoặc `X.w/h` (screenutil) — KHÔNG magic numbers

## 📂 Files quan trọng

| File | Mục đích |
|---|---|
| `lib/shared/widgets/base/app_scaffold.dart` | AppScaffold + auto unfocus |
| `lib/shared/widgets/base/app_button.dart` | 3 variant × 3 size button |
| `lib/shared/widgets/base/app_text_field.dart` | Standard TextFormField |
| `lib/shared/widgets/states/loading_widget.dart` | Center spinner |
| `lib/shared/widgets/states/empty_widget.dart` | Empty state + optional action |
| `lib/shared/widgets/states/error_widget.dart` | `ErrorRetry` widget |
| `lib/shared/widgets/dialogs/app_confirmation_dialog.dart` | Confirm dialog với destructive style |
| `lib/core/common/extensions/context_extensions.dart` | BuildContextX + appContext |
| `lib/core/common/extensions/l10n_extensions.dart` | `context.l10n` |
| `lib/core/common/extensions/string_extensions.dart` | StringX + NullableStringX |
| `lib/core/common/extensions/datetime_extensions.dart` | DateTimeX (format, timeAgo) |
| `lib/core/common/extensions/list_extensions.dart` | ListX (distinct/group/chunk) + NumericListX (sum/avg) |
| `lib/core/common/extensions/number_extensions.dart` | DurationX (`.seconds`) + NumberFormatX (currency/%) |
| `lib/core/common/extensions/widget_extensions.dart` | WidgetX (padding/center/onTap/...) |
| `lib/core/common/extensions/assets_extensions.dart` | AssetPathX (.toSvg / .toImage / .lottie) |
| `lib/shared/models/base/base_entity.dart` | Equatable base cho Domain entity |
| `lib/shared/models/base/common_param.dart` | CommonParam (page/perPage/sort/q) |
| `lib/core/base/usecases/usecase.dart` | UseCase + NoParams (Domain layer) |
