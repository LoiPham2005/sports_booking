import 'package:go_router/go_router.dart';
import 'package:injectable/injectable.dart';
import 'package:sports_booking_mobile/shared/routing/app_router.dart' as sports;

// ⚠️ PHASE 1 — Sports Booking port:
// Wrapper expose `appRouter` (untyped GoRouter ở lib/shared/routing/) qua
// DI để giữ tương thích với `App` widget (`getIt<AppRouter>().router`).
//
// Refactor sau:
//   - Chuyển sang @TypedGoRoute pattern của v2 (đọc skill: routing)
//   - Wire RouteGuards.authGuard + AuthRefreshNotifier
//   - Move toàn bộ route definition về `lib/routes/config/`
//   - Xoá `lib/shared/routing/` legacy folder
@LazySingleton()
class AppRouter {
  GoRouter get router => sports.appRouter;
}
