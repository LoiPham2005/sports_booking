import 'package:flutter/widgets.dart';
import 'package:injectable/injectable.dart';

@LazySingleton()
class NavigationService {
  final GlobalKey<NavigatorState> rootNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'rootNavigator');
  final GlobalKey<NavigatorState> shellNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'shellNavigator');

  BuildContext? get currentContext => rootNavigatorKey.currentContext;
  NavigatorState? get currentState => rootNavigatorKey.currentState;

  Future<T?> push<T>(Route<T> route) async =>
      currentState?.push<T>(route);

  void pop<T>([T? result]) => currentState?.pop<T>(result);

  bool canPop() => currentState?.canPop() ?? false;
}
