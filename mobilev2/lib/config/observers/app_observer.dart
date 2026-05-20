import 'package:flutter/widgets.dart';

class AppObserver extends WidgetsBindingObserver {
  AppObserver({this.onResume, this.onPause, this.onDetach});

  final VoidCallback? onResume;
  final VoidCallback? onPause;
  final VoidCallback? onDetach;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        onResume?.call();
      case AppLifecycleState.paused:
        onPause?.call();
      case AppLifecycleState.detached:
        onDetach?.call();
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
        break;
    }
  }
}
