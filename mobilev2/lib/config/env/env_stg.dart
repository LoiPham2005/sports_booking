import 'package:envied/envied.dart';

part 'env_stg.g.dart';

@Envied(path: '.env.stg', obfuscate: true)
abstract class EnvStg {
  @EnviedField(varName: 'API_BASE_URL')
  static final String apiBaseUrl = _EnvStg.apiBaseUrl;

  @EnviedField(varName: 'API_KEY')
  static final String apiKey = _EnvStg.apiKey;
}
