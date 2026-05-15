import 'package:flutter/foundation.dart';

/// Trạng thái demo (UI mode) — giữ role cho staff portal.
/// Khi nối backend, thay bằng AuthService trả về role từ JWT.
enum StaffPortalRole { staff, manager }

class DemoState extends ChangeNotifier {
  DemoState._();
  static final instance = DemoState._();

  StaffPortalRole _staffRole = StaffPortalRole.staff;
  StaffPortalRole get staffRole => _staffRole;
  bool get isManager => _staffRole == StaffPortalRole.manager;

  void setStaffRole(StaffPortalRole role) {
    if (_staffRole != role) {
      _staffRole = role;
      notifyListeners();
    }
  }
}
