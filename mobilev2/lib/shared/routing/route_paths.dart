class RoutePaths {
  RoutePaths._();

  static const splash = '/';
  static const onboarding = '/onboarding';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const main = '/main';

  // OWNER
  static const owner = '/owner';
  static const ownerQrScan = '/owner/qr-scan';
  static const ownerWalkIn = '/owner/walk-in';
  static const ownerPayout = '/owner/payout';
  static const ownerReports = '/owner/reports';
  static const ownerVenueCreate = '/owner/venues/create';
  static String ownerVenueEdit(String id) => '/owner/venues/$id/edit';
  static const ownerVenueEditParam = '/owner/venues/:id/edit';
  static const ownerStaff = '/owner/staff';
  static const ownerStaffInvite = '/owner/staff/invite';
  static const ownerSettings = '/owner/settings';
  static const ownerHelp = '/owner/help';
  static String ownerBookingDetail(String id) => '/owner/bookings/$id';
  static const ownerBookingDetailParam = '/owner/bookings/:id';

  // STAFF
  static const staff = '/staff';
  static const staffQrScan = '/staff/qr-scan';
  static const staffPricing = '/staff/pricing';
  static const staffTeam = '/staff/team';
  static const staffShiftReport = '/staff/shift-report';
  static const staffProfile = '/staff/profile';
  static const staffChangePassword = '/staff/change-password';
  static const staffHelp = '/staff/help';
  static String staffBookingDetail(String id) => '/staff/bookings/$id';
  static const staffBookingDetailParam = '/staff/bookings/:id';

  static const venues = '/venues';
  static const venuesMap = '/venues/map';
  static String venueDetail(String id) => '/venues/$id';
  static const venueDetailParam = '/venues/:id';

  static const bookingNew = '/booking/new';
  static const bookingResult = '/booking/result';
  static String bookingDetail(String id) => '/bookings/$id';
  static const bookingDetailParam = '/bookings/:id';

  static const favorites = '/account/favorites';
  static const notifications = '/account/notifications';
  static const settings = '/account/settings';
  static const profile = '/account/profile';
}
