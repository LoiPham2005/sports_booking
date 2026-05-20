import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/customer/account/notifications_page.dart';
import '../../features/customer/account/favorites_page.dart';
import '../../features/customer/account/profile_page.dart';
import '../../features/customer/account/settings_page.dart';
import '../../features/auth/forgot_password_page.dart';
import '../../features/auth/login_page.dart';
import '../../features/auth/register_page.dart';
import '../../features/customer/bookings/booking_detail_page.dart';
import '../../features/customer/bookings/booking_new_page.dart';
import '../../features/customer/bookings/booking_result_page.dart';
import '../../features/customer/main/main_shell.dart';
import '../../features/owner/owner_booking_detail_page.dart';
import '../../features/owner/owner_help_page.dart';
import '../../features/owner/owner_payout_page.dart';
import '../../features/owner/owner_qr_scan_page.dart';
import '../../features/owner/owner_reports_page.dart';
import '../../features/owner/owner_settings_page.dart';
import '../../features/owner/owner_shell.dart';
import '../../features/owner/owner_staff_invite_page.dart';
import '../../features/owner/owner_staff_page.dart';
import '../../features/owner/owner_venue_create_page.dart';
import '../../features/owner/owner_venue_edit_page.dart';
import '../../features/owner/owner_walk_in_page.dart';
import '../../features/splash/onboarding_page.dart';
import '../../features/splash/splash_page.dart';
import '../../features/staff/staff_booking_detail_page.dart';
import '../../features/staff/staff_change_password_page.dart';
import '../../features/staff/staff_help_page.dart';
import '../../features/staff/staff_pricing_page.dart';
import '../../features/staff/staff_profile_page.dart';
import '../../features/staff/staff_qr_scan_page.dart';
import '../../features/staff/staff_shell.dart';
import '../../features/staff/staff_shift_report_page.dart';
import '../../features/staff/staff_team_page.dart';
import '../../features/customer/venues/venue_detail_page.dart';
import '../../features/customer/venues/venues_map_page.dart';
import '../../features/customer/venues/venues_page.dart';
import 'route_paths.dart';

final appRouter = GoRouter(
  initialLocation: RoutePaths.splash,
  routes: [
    GoRoute(path: RoutePaths.splash, builder: (_, __) => const SplashPage()),
    GoRoute(
        path: RoutePaths.onboarding,
        builder: (_, __) => const OnboardingPage()),
    GoRoute(path: RoutePaths.login, builder: (_, __) => const LoginPage()),
    GoRoute(
        path: RoutePaths.register, builder: (_, __) => const RegisterPage()),
    GoRoute(
        path: RoutePaths.forgotPassword,
        builder: (_, __) => const ForgotPasswordPage()),

    GoRoute(path: RoutePaths.main, builder: (_, __) => const MainShell()),

    GoRoute(path: RoutePaths.venues, builder: (_, __) => const VenuesPage()),
    GoRoute(
        path: RoutePaths.venuesMap,
        builder: (_, __) => const VenuesMapPage()),
    GoRoute(
      path: RoutePaths.venueDetailParam,
      builder: (_, state) => VenueDetailPage(id: state.pathParameters['id']!),
    ),

    GoRoute(
        path: RoutePaths.bookingNew,
        builder: (_, __) => const BookingNewPage()),
    GoRoute(
      path: RoutePaths.bookingResult,
      builder: (_, state) => BookingResultPage(
        status: state.uri.queryParameters['status'] ?? 'success',
        method: state.uri.queryParameters['method'] ?? 'vnpay',
      ),
    ),
    GoRoute(
      path: RoutePaths.bookingDetailParam,
      builder: (_, state) => BookingDetailPage(id: state.pathParameters['id']!),
    ),

    GoRoute(
        path: RoutePaths.favorites, builder: (_, __) => const FavoritesPage()),
    GoRoute(
        path: RoutePaths.notifications,
        builder: (_, __) => const NotificationsPage()),
    GoRoute(path: RoutePaths.profile, builder: (_, __) => const ProfilePage()),
    GoRoute(
        path: RoutePaths.settings, builder: (_, __) => const SettingsPage()),

    // OWNER
    GoRoute(path: RoutePaths.owner, builder: (_, __) => const OwnerShell()),
    GoRoute(
        path: RoutePaths.ownerQrScan,
        builder: (_, __) => const OwnerQrScanPage()),
    GoRoute(
        path: RoutePaths.ownerWalkIn,
        builder: (_, __) => const OwnerWalkInPage()),
    GoRoute(
        path: RoutePaths.ownerPayout,
        builder: (_, __) => const OwnerPayoutPage()),
    GoRoute(
        path: RoutePaths.ownerReports,
        builder: (_, __) => const OwnerReportsPage()),
    GoRoute(
      path: RoutePaths.ownerVenueCreate,
      builder: (_, __) => const OwnerVenueCreatePage(),
    ),
    GoRoute(
      path: RoutePaths.ownerStaff,
      builder: (_, __) => const OwnerStaffPage(),
    ),
    GoRoute(
      path: RoutePaths.ownerStaffInvite,
      builder: (_, __) => const OwnerStaffInvitePage(),
    ),
    GoRoute(
      path: RoutePaths.ownerSettings,
      builder: (_, __) => const OwnerSettingsPage(),
    ),
    GoRoute(
      path: RoutePaths.ownerHelp,
      builder: (_, __) => const OwnerHelpPage(),
    ),
    GoRoute(
      path: RoutePaths.ownerVenueEditParam,
      builder: (_, state) =>
          OwnerVenueEditPage(id: state.pathParameters['id']!),
    ),
    GoRoute(
      path: RoutePaths.ownerBookingDetailParam,
      builder: (_, state) =>
          OwnerBookingDetailPage(id: state.pathParameters['id']!),
    ),

    // STAFF
    GoRoute(path: RoutePaths.staff, builder: (_, __) => const StaffShell()),
    GoRoute(
        path: RoutePaths.staffQrScan,
        builder: (_, __) => const StaffQrScanPage()),
    GoRoute(
        path: RoutePaths.staffPricing,
        builder: (_, __) => const StaffPricingPage()),
    GoRoute(
        path: RoutePaths.staffTeam, builder: (_, __) => const StaffTeamPage()),
    GoRoute(
      path: RoutePaths.staffShiftReport,
      builder: (_, __) => const StaffShiftReportPage(),
    ),
    GoRoute(
      path: RoutePaths.staffProfile,
      builder: (_, __) => const StaffProfilePage(),
    ),
    GoRoute(
      path: RoutePaths.staffChangePassword,
      builder: (_, __) => const StaffChangePasswordPage(),
    ),
    GoRoute(
      path: RoutePaths.staffHelp,
      builder: (_, __) => const StaffHelpPage(),
    ),
    GoRoute(
      path: RoutePaths.staffBookingDetailParam,
      builder: (_, state) =>
          StaffBookingDetailPage(id: state.pathParameters['id']!),
    ),
  ],
  errorBuilder: (_, state) => Scaffold(
    appBar: AppBar(title: const Text('Not found')),
    body: Center(child: Text(state.error?.toString() ?? '404')),
  ),
);
