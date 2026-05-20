import 'package:flutter/widgets.dart';
import 'package:sports_booking_mobile/core/base/di/global_providers.dart';
import 'package:sports_booking_mobile/core/services/app_auth/app_auth_notifier.dart';
import 'package:sports_booking_mobile/routes/config/route_names.dart';
import 'package:go_router/go_router.dart';

class RouteGuards {
  const RouteGuards();

  String? authGuard(BuildContext context, GoRouterState state) {
    final auth = globalContainer.read(appAuthProvider);
    final loc = state.matchedLocation;

    final publicPaths = {RouteNames.splash, RouteNames.login, RouteNames.register};
    final isPublic = publicPaths.contains(loc);

    if (!auth.isAuthenticated && !isPublic) return RouteNames.login;
    if (auth.isAuthenticated && loc == RouteNames.login) return RouteNames.main;
    return null;
  }
}
