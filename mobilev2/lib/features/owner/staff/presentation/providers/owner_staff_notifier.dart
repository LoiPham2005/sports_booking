import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:sports_booking_mobile/core/base/di/dio_provider.dart';
import 'package:sports_booking_mobile/core/base/riverpod/base_notifier.dart';
import 'package:sports_booking_mobile/core/common/constants/app_config.dart';
import 'package:sports_booking_mobile/features/owner/staff/data/models/staff_dto.dart';
import 'package:sports_booking_mobile/features/owner/staff/data/services/owner_staff_service.dart';

part 'owner_staff_notifier.g.dart';

@riverpod
class OwnerStaffNotifier extends _$OwnerStaffNotifier
    with BaseNotifier<List<StaffMemberDto>> {
  late OwnerStaffService _service;
  String? _venueFilter;

  @override
  Future<List<StaffMemberDto>> build() async {
    _service = OwnerStaffService(ref.read(dioProvider));
    return _fetch();
  }

  Future<List<StaffMemberDto>> _fetch() async {
    if (AppConfig.useMock) {
      return const [
        StaffMemberDto(
          id: 's1',
          venueId: 'v1',
          userId: 'u-mgr',
          email: 'manager@sportsbooking.local',
          role: 'MANAGER',
          inviteStatus: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00.000Z',
          venue: StaffVenueInline(id: 'v1', name: 'Sân Phú Mỹ Hưng'),
          user: StaffUserInline(
            id: 'u-mgr',
            fullName: 'Lê Hoàng',
            email: 'manager@sportsbooking.local',
            phone: '0901111111',
          ),
        ),
        StaffMemberDto(
          id: 's2',
          venueId: 'v1',
          userId: 'u-stf',
          email: 'staff@sportsbooking.local',
          role: 'STAFF',
          inviteStatus: 'ACTIVE',
          createdAt: '2026-01-05T00:00:00.000Z',
          venue: StaffVenueInline(id: 'v1', name: 'Sân Phú Mỹ Hưng'),
          user: StaffUserInline(
            id: 'u-stf',
            fullName: 'Trần Hùng',
            email: 'staff@sportsbooking.local',
            phone: '0902222222',
          ),
        ),
      ];
    }
    return _service.listStaff(venueId: _venueFilter);
  }

  Future<void> filterByVenue(String? venueId) {
    _venueFilter = venueId;
    return runAsync(
      action: _fetch,
      cancelPrevious: true,
      keepPreviousOnLoading: true,
      emitEmptyForEmptyList: true,
    );
  }

  Future<void> refresh() => runAsync(action: _fetch, keepPreviousOnLoading: true);

  Future<void> invite({
    required String email,
    required String venueId,
    String role = 'STAFF',
  }) =>
      runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service.invite(
              InviteStaffRequest(email: email, venueId: venueId, role: role),
            );
          }
          return _fetch();
        },
        successMessage: 'Đã gửi lời mời',
        errorMessage: 'Mời thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> suspend(String id) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service
                .update(id, const UpdateStaffRequest(inviteStatus: 'SUSPENDED'));
          }
          return _fetch();
        },
        successMessage: 'Đã đình chỉ',
        errorMessage: 'Đình chỉ thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> activate(String id) => runAsync(
        action: () async {
          if (!AppConfig.useMock) {
            await _service
                .update(id, const UpdateStaffRequest(inviteStatus: 'ACTIVE'));
          }
          return _fetch();
        },
        successMessage: 'Đã kích hoạt',
        errorMessage: 'Kích hoạt thất bại',
        keepPreviousOnLoading: true,
      );

  Future<void> remove(String id) => runAsync(
        action: () async {
          if (!AppConfig.useMock) await _service.remove(id);
          return _fetch();
        },
        successMessage: 'Đã xoá staff',
        errorMessage: 'Xoá thất bại',
        keepPreviousOnLoading: true,
      );
}
