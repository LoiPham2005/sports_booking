import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/customer/notifications/data/models/notification_dto.dart';
import 'package:sports_booking_mobile/features/customer/notifications/data/services/notifications_service.dart';
import 'package:sports_booking_mobile/shared/mock/mock_data.dart';

part 'notifications_notifier.g.dart';

/// UI model — UI tính `read = readAt != null`.
class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.read,
    this.dataJson,
  });

  final String id;
  final String type;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;
  final Map<String, dynamic>? dataJson;

  NotificationItem copyWith({bool? read}) => NotificationItem(
        id: id,
        type: type,
        title: title,
        body: body,
        createdAt: createdAt,
        read: read ?? this.read,
        dataJson: dataJson,
      );
}

NotificationItem _toUi(NotificationDto dto) => NotificationItem(
      id: dto.id,
      type: dto.type,
      title: dto.title,
      body: dto.body ?? '',
      createdAt: DateTime.parse(dto.createdAt).toLocal(),
      read: dto.readAt != null,
      dataJson: dto.dataJson,
    );

@riverpod
class NotificationsNotifier extends _$NotificationsNotifier
    with BaseNotifier<List<NotificationItem>> {
  late NotificationsService _service;

  @override
  Future<List<NotificationItem>> build() async {
    _service = NotificationsService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<NotificationItem>> _fetch() async {
    if (AppConfig.useMock) {
      // Mock: 4 thông báo theo time, có cái đã đọc, có cái chưa.
      final now = DateTime.now();
      return [
        NotificationItem(
          id: 'n1',
          type: 'payment_success',
          title: 'Thanh toán thành công',
          body: 'Booking ${MockData.bookings.first.code} đã được xác nhận.',
          createdAt: now.subtract(const Duration(hours: 1)),
          read: false,
        ),
        NotificationItem(
          id: 'n2',
          type: 'reminder',
          title: 'Sắp tới giờ chơi',
          body: 'Bạn có booking lúc 18:00 hôm nay tại sân Phú Mỹ Hưng.',
          createdAt: now.subtract(const Duration(hours: 3)),
          read: false,
        ),
        NotificationItem(
          id: 'n3',
          type: 'promo',
          title: 'Voucher 20%',
          body: 'Mã SPORT20 — giảm 20% sân cầu lông cuối tuần.',
          createdAt: now.subtract(const Duration(days: 1)),
          read: true,
        ),
        NotificationItem(
          id: 'n4',
          type: 'review',
          title: 'Mời đánh giá',
          body: 'Hãy chia sẻ cảm nhận về booking gần nhất của bạn.',
          createdAt: now.subtract(const Duration(days: 3)),
          read: true,
        ),
      ];
    }

    final list = await _service.getNotifications();
    return list.map(_toUi).toList();
  }

  Future<void> refresh() => runAsync(
        action: _fetch,
        keepPreviousOnLoading: true,
        emitEmptyForEmptyList: true,
      );

  /// Mark 1 thông báo đọc — optimistic local update.
  Future<void> markRead(String id) async {
    final current = state.value ?? const <NotificationItem>[];
    state = AsyncData(
      current.map((n) => n.id == id ? n.copyWith(read: true) : n).toList(),
    );
    if (AppConfig.useMock) return;
    try {
      await _service.markRead(id);
    } catch (_) {
      state = AsyncData(current);
      rethrow;
    }
  }

  /// Mark tất cả thông báo chưa đọc.
  Future<void> markAllRead() async {
    final current = state.value ?? const <NotificationItem>[];
    final unread = current.where((n) => !n.read).toList();
    state = AsyncData(current.map((n) => n.copyWith(read: true)).toList());
    if (AppConfig.useMock || unread.isEmpty) return;
    try {
      await Future.wait(unread.map((n) => _service.markRead(n.id)));
    } catch (_) {
      state = AsyncData(current);
      rethrow;
    }
  }
}

/// Đếm số thông báo chưa đọc — dùng cho badge ở home_tab.
@riverpod
int unreadNotificationsCount(Ref ref) {
  final list = ref.watch(notificationsProvider).value ?? const <NotificationItem>[];
  return list.where((n) => !n.read).length;
}
