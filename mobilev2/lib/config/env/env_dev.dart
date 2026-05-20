import 'package:envied/envied.dart';

part 'env_dev.g.dart';

@Envied(path: '.env.dev', obfuscate: true)
abstract class EnvDev {
  @EnviedField(varName: 'API_BASE_URL')
  static final String apiBaseUrl = _EnvDev.apiBaseUrl;

  @EnviedField(varName: 'API_KEY')
  static final String apiKey = _EnvDev.apiKey;
}
