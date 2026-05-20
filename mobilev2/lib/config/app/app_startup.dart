import 'package:sports_booking_mobile/core/services/utils/logger.dart';

class AppStartupResult {
  const AppStartupResult({
    required this.isFirstRun,
    required this.hasNetwork,
    required this.needsUpdate,
  });

  final bool isFirstRun;
  final bool hasNetwork;
  final bool needsUpdate;
}

abstract class AppStartup {
  static Future<AppStartupResult> launch() async {
    Logger.info('Running startup checks...');
    return const AppStartupResult(
      isFirstRun: false,
      hasNetwork: true,
      needsUpdate: false,
    );
  }
}
