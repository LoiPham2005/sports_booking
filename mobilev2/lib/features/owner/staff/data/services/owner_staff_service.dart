import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:sports_booking_mobile/features/owner/staff/data/models/staff_dto.dart';

part 'owner_staff_service.g.dart';

@RestApi()
abstract class OwnerStaffService {
  factory OwnerStaffService(Dio dio) = _OwnerStaffService;

  /// `GET /owner/staff?venueId=` — list staff theo venue (optional).
  @GET('/owner/staff')
  Future<List<StaffMemberDto>> listStaff({@Query('venueId') String? venueId});

  /// `POST /owner/staff/invite` — gửi email mời staff. Token expire 7d.
  @POST('/owner/staff/invite')
  Future<StaffMemberDto> invite(@Body() InviteStaffRequest body);

  /// `PATCH /owner/staff/:id` — suspend/unsuspend/đổi role.
  @PATCH('/owner/staff/{id}')
  Future<StaffMemberDto> update(
    @Path('id') String id,
    @Body() UpdateStaffRequest body,
  );

  /// `DELETE /owner/staff/:id` — remove staff khỏi venue.
  @DELETE('/owner/staff/{id}')
  Future<void> remove(@Path('id') String id);
}
