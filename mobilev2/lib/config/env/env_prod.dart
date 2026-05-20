import 'package:envied/envied.dart';

part 'env_prod.g.dart';

@Envied(path: '.env.prod', obfuscate: true)
abstract class EnvProd {
  @EnviedField(varName: 'API_BASE_URL')
  static final String apiBaseUrl = _EnvProd.apiBaseUrl;

  @EnviedField(varName: 'API_KEY')
  static final String apiKey = _EnvProd.apiKey;
}
