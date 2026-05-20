import 'package:sports_booking_mobile/config/app/flavor_config.dart';
import 'package:sports_booking_mobile/config/env/env_dev.dart';
import 'package:sports_booking_mobile/config/env/env_prod.dart';
import 'package:sports_booking_mobile/config/env/env_stg.dart';

abstract class Env {
  static String get apiBaseUrl => switch (FlavorConfig.current.flavor) {
        AppFlavor.dev => EnvDev.apiBaseUrl,
        AppFlavor.stg => EnvStg.apiBaseUrl,
        AppFlavor.prod => EnvProd.apiBaseUrl,
      };

  static String get apiKey => switch (FlavorConfig.current.flavor) {
        AppFlavor.dev => EnvDev.apiKey,
        AppFlavor.stg => EnvStg.apiKey,
        AppFlavor.prod => EnvProd.apiKey,
      };
}
