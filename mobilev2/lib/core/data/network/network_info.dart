import 'package:injectable/injectable.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

abstract class NetworkInfo {
  Future<bool> get isConnected;
  Stream<bool> get onStatusChange;
}

@LazySingleton(as: NetworkInfo)
class NetworkInfoImpl implements NetworkInfo {
  NetworkInfoImpl(this._checker);

  final InternetConnection _checker;

  @override
  Future<bool> get isConnected => _checker.hasInternetAccess;

  @override
  Stream<bool> get onStatusChange =>
      _checker.onStatusChange.map((s) => s == InternetStatus.connected);
}
