import 'package:flutter/material.dart';
import 'shared/routing/app_router.dart';
import 'shared/theme/app_theme.dart';

class SportsBookingApp extends StatelessWidget {
  const SportsBookingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Sports Booking',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
    );
  }
}
