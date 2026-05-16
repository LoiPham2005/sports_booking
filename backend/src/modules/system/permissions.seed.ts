import { Role } from '@prisma/client';

/**
 * Danh sách permission mặc định — seed vào DB lần đầu.
 * Chỉ thêm mới ở đây, không sửa key đã tồn tại (sẽ break gán role).
 */
export interface PermissionSeed {
  key: string;
  category: string;
  description: string;
}

export const DEFAULT_PERMISSIONS: PermissionSeed[] = [
  // Venue
  { key: 'venue.list', category: 'Venue', description: 'Xem danh sách tất cả venue' },
  { key: 'venue.approve', category: 'Venue', description: 'Duyệt venue do owner nộp' },
  { key: 'venue.reject', category: 'Venue', description: 'Từ chối venue' },
  { key: 'venue.suspend', category: 'Venue', description: 'Đình chỉ venue' },

  // Booking
  { key: 'booking.list_all', category: 'Booking', description: 'Xem tất cả booking trong hệ thống' },
  { key: 'booking.cancel_any', category: 'Booking', description: 'Hủy bất kỳ booking nào' },
  { key: 'booking.refund', category: 'Booking', description: 'Hoàn tiền booking' },

  // User
  { key: 'user.list', category: 'User', description: 'Xem danh sách user' },
  { key: 'user.suspend', category: 'User', description: 'Khóa tài khoản user' },
  { key: 'user.delete', category: 'User', description: 'Xóa tài khoản user' },
  { key: 'user.change_role', category: 'User', description: 'Đổi role user (chỉ SUPER_ADMIN)' },

  // Review
  { key: 'review.hide', category: 'Review', description: 'Ẩn đánh giá vi phạm' },

  // Voucher
  { key: 'voucher.create', category: 'Voucher', description: 'Tạo voucher mới' },
  { key: 'voucher.update', category: 'Voucher', description: 'Cập nhật voucher' },
  { key: 'voucher.delete', category: 'Voucher', description: 'Xóa voucher' },

  // Payout
  { key: 'payout.approve', category: 'Payout', description: 'Duyệt yêu cầu payout cho owner' },
  { key: 'payout.reject', category: 'Payout', description: 'Từ chối payout' },

  // Dispute
  { key: 'dispute.resolve', category: 'Dispute', description: 'Xử lý khiếu nại' },

  // Report
  { key: 'report.view', category: 'Report', description: 'Xem báo cáo doanh thu, GMV' },
  { key: 'audit.view', category: 'Audit', description: 'Xem audit log' },

  // System (chỉ SUPER_ADMIN nên có)
  { key: 'system.settings', category: 'System', description: 'Cập nhật cài đặt hệ thống' },
  { key: 'system.feature_flag', category: 'System', description: 'Bật/tắt feature flag' },
  { key: 'system.permissions', category: 'System', description: 'Cập nhật permission cho các role' },
];

/**
 * Mặc định gán permission cho từng role (chỉ áp dụng khi DB trống lần đầu).
 */
export const DEFAULT_ROLE_GRANTS: Record<Role, string[]> = {
  CUSTOMER: [],
  OWNER: [],
  STAFF: [],
  ADMIN: [
    'venue.list',
    'venue.approve',
    'venue.reject',
    'venue.suspend',
    'booking.list_all',
    'booking.cancel_any',
    'booking.refund',
    'user.list',
    'user.suspend',
    'review.hide',
    'voucher.create',
    'voucher.update',
    'voucher.delete',
    'payout.approve',
    'payout.reject',
    'dispute.resolve',
    'report.view',
    'audit.view',
  ],
  SUPER_ADMIN: [], // Sẽ được gán toàn bộ trong seeder
};
