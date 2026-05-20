// ════════════════════════════════════════════════════════════════
// 📁 lib/core/services/notification/notification_service.dart
// ════════════════════════════════════════════════════════════════
//
// Local notification (KHÔNG bao gồm push từ server — cần firebase_messaging).
//
// Cách dùng:
//   await getIt<NotificationService>().initialize();
//
//   // Đăng ký callback xử lý tap (1 lần ở AppInitializer hoặc page nào đó):
//   getIt<NotificationService>().onTap = (payload) {
//     if (payload == 'go_premium') appContext.go('/premium');
//   };
//
//   // Show notification:
//   await getIt<NotificationService>().showNotification(
//     id: 1,
//     title: 'Title',
//     body: 'Body',
//     payload: 'go_premium',
//   );

import 'dart:async';
import 'dart:io';

import 'package:sports_booking_mobile/core/services/utils/logger.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:injectable/injectable.dart';

/// 🔔 Local Notification Service
@LazySingleton()
class NotificationService {
  static const String _tag = 'NOTIFICATION';

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // Channel constants
  static const String _channelId = 'app_notification_channel';
  static const String _channelName = 'General Notifications';
  static const String _channelDescription =
      'This channel is used for general app notifications.';

  /// ⚡ Callback khi user tap notification. Caller (AppInitializer hoặc 1 service
  /// routing layer) set, tránh hardcode route ở đây.
  void Function(String? payload)? onTap;

  /// 🚀 Initialize Notification Service
  Future<void> initialize() async {
    try {
      const androidSettings = AndroidInitializationSettings(
        '@mipmap/ic_launcher',
      );

      const darwinSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
        macOS: darwinSettings,
      );

      await _notificationsPlugin.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      if (Platform.isAndroid) {
        await _createAndroidChannel();
      }

      Logger.success('Notification Service initialized', tag: _tag);
    } catch (e, stack) {
      Logger.error(
        'Failed to initialize Notification Service',
        error: e,
        stackTrace: stack,
        tag: _tag,
      );
    }
  }

  /// 🛠️ Create high importance channel for Android
  Future<void> _createAndroidChannel() async {
    const androidChannel = AndroidNotificationChannel(
      _channelId,
      _channelName,
      description: _channelDescription,
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(androidChannel);
  }

  /// 📲 Show a local notification
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    Importance importance = Importance.max,
    Priority priority = Priority.high,
  }) async {
    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: importance,
      priority: priority,
      ticker: 'ticker',
    );

    const darwinDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: darwinDetails,
      macOS: darwinDetails,
    );

    await _notificationsPlugin.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: details,
      payload: payload,
    );
  }

  /// 📅 Schedule a notification at specific time.
  ///
  /// ⚠️ Note: Cần khởi tạo timezone trước (gọi `tz.initializeTimeZones()` +
  /// `tz.setLocalLocation(...)`) và dùng `_notificationsPlugin.zonedSchedule(...)`.
  /// Hiện chỉ log — implement khi feature thực sự cần scheduled noti.
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
  }) async {
    Logger.warning(
      'scheduleNotification chưa implement (cần timezone setup). '
      'Yêu cầu: id=$id, title=$title, at=$scheduledDate',
      tag: _tag,
    );
  }

  /// 🗑️ Cancel notification
  Future<void> cancel(int id) async => _notificationsPlugin.cancel(id: id);

  /// 🧹 Cancel all
  Future<void> cancelAll() async => _notificationsPlugin.cancelAll();

  /// 🖱️ Handle notification tap — forward payload cho caller xử lý routing.
  void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    Logger.info('Notification tapped with payload: $payload', tag: _tag);
    onTap?.call(payload);
  }
}
