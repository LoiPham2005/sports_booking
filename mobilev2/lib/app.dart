import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:sports_booking_mobile/core/base/di/global_providers.dart';
import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/core/common/constants/app_constants.dart';
import 'package:sports_booking_mobile/core/common/utils/error_utils.dart';
import 'package:sports_booking_mobile/routes/config/app_router.dart';
import 'package:sports_booking_mobile/shared/theme/app_theme.dart' as sports_theme;
import 'package:sports_booking_mobile/shared/widgets/states/app_error_screen.dart';
import 'package:toastification/toastification.dart';

// ⚠️ PHASE 1 — Sports Booking port:
// - Theme: dùng tạm `shared/theme/AppTheme` (port từ sports_booking gốc)
// - Router: sports's untyped GoRouter qua AppRouter wrapper
// - Locale + design system của v2 (design/l10n, design/theme) chưa wire — refactor sau
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return UncontrolledProviderScope(
      container: globalContainer,
      child: ScreenUtilInit(
        designSize: const Size(
          AppConstants.designWidth,
          AppConstants.designHeight,
        ),
        minTextAdapt: true,
        splitScreenMode: true,
        builder: (_, _) => const _AppContent(),
      ),
    );
  }
}

class _AppContent extends StatelessWidget {
  const _AppContent();

  @override
  Widget build(BuildContext context) {
    final router = getIt<AppRouter>().router;

    return ToastificationWrapper(
      child: MaterialApp.router(
        debugShowCheckedModeBanner: false,
        title: AppConstants.appName,
        theme: sports_theme.AppTheme.light(),
        darkTheme: sports_theme.AppTheme.dark(),
        themeMode: ThemeMode.light,
        routerConfig: router,
        builder: (context, child) {
          ErrorWidget.builder = (details) => AppErrorScreen(
                details: details,
                location: ErrorUtils.extractLocation(details),
              );
          return FlutterSmartDialog.init()(context, child);
        },
      ),
    );
  }
}
