import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/customer/notifications/data/models/notification_dto.dart';

part 'notifications_service.g.dart';

@RestApi()
abstract class NotificationsService {
  factory NotificationsService(Dio dio) = _NotificationsService;

  /// `GET /me/notifications` — feed in-app, sort desc theo createdAt.
  @GET('/me/notifications')
  Future<List<NotificationDto>> getNotifications();

  /// `POST /me/notifications/:id/read` — mark 1 thông báo đã đọc.
  @POST('/me/notifications/{id}/read')
  Future<void> markRead(@Path('id') String id);
}
