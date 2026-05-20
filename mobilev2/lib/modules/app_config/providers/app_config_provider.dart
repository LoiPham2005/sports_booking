import 'dart:async';

import 'package:sports_booking_mobile/core/base/di/injection.dart';
import 'package:sports_booking_mobile/modules/app_config/models/app_config_snapshot.dart';
import 'package:sports_booking_mobile/modules/app_config/services/app_config_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_config_provider.g.dart';

/// Watch reactive snapshot của AppConfig.
///
/// Cách dùng trong page:
/// ```dart
/// final cfg = ref.watch(appConfigSnapshotProvider);
/// if (cfg.isMaintenance) return MaintenanceScreen(message: cfg.maintenanceMessage);
/// if (cfg.hasNotice) ShowNoticeBanner(title: cfg.noticeTitle, ...);
/// ```
@Riverpod(keepAlive: true)
Stream<AppConfigSnapshot> appConfigSnapshot(Ref ref) {
  final svc = getIt<AppConfigService>();

  late final void Function() listener;
  final controller = StreamController<AppConfigSnapshot>.broadcast(
    onListen: () {
      // Emit giá trị hiện tại ngay khi có subscriber đầu tiên.
    },
  );

  listener = () => controller.add(svc.snapshot.value);
  svc.snapshot.addListener(listener);

  ref.onDispose(() {
    svc.snapshot.removeListener(listener);
    controller.close();
  });

  // Emit initial value.
  Future<void>.microtask(() => controller.add(svc.snapshot.value));

  return controller.stream;
}
