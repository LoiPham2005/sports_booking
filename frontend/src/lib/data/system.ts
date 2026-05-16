/**
 * Data layer cho Super Admin.
 */
import { USE_MOCK } from '@/lib/api/config';
import {
  systemApi,
  type AdminUserListItem,
  type FeatureFlagDto,
  type PermissionMatrixDto,
  type SystemSettings,
  type UpdateSettingsInput,
} from '@/lib/api/endpoints/system';
import type { Role } from '@/lib/api/types';

const MOCK_SETTINGS: SystemSettings = {
  commissionPercent: 10,
  bookingHoldMinutes: 10,
  paymentTimeoutMinutes: 15,
  defaultCancelPolicy: {
    hours24Refund: 100,
    hours12Refund: 50,
    under12Refund: 0,
  },
  payoutSchedule: 'WEEKLY_MON',
  vatPercent: 0,
};
let mockSettingsState: SystemSettings = { ...MOCK_SETTINGS };

const MOCK_ADMINS: AdminUserListItem[] = [
  {
    id: 'u1',
    email: 'super@sportsbooking.local',
    fullName: 'Super Admin',
    avatarUrl: null,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 365 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'u2',
    email: 'admin@sportsbooking.local',
    fullName: 'Admin Demo',
    avatarUrl: null,
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 200 * 24 * 3600_000).toISOString(),
  },
];
const mockAdminsState = [...MOCK_ADMINS];

const MOCK_FLAGS: FeatureFlagDto[] = [
  {
    key: 'recurring_bookings',
    enabled: false,
    description: 'Đặt sân định kỳ',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  },
  {
    key: 'voucher_apply_customer',
    enabled: true,
    description: 'Customer áp dụng voucher khi checkout',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  },
  {
    key: 'realtime_calendar',
    enabled: false,
    description: 'WebSocket update lịch booking realtime',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  },
  {
    key: 'fcm_push',
    enabled: false,
    description: 'Push notification qua FCM',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  },
  {
    key: 'dark_mode_ui',
    enabled: false,
    description: 'Toggle dark mode trên web/mobile',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  },
];
const mockFlagsState = [...MOCK_FLAGS];

// ─────── Settings ───────

export async function getSystemSettings(): Promise<SystemSettings> {
  if (USE_MOCK) return mockSettingsState;
  return systemApi.getSettings();
}

export async function updateSystemSettings(body: UpdateSettingsInput): Promise<SystemSettings> {
  if (USE_MOCK) {
    mockSettingsState = { ...mockSettingsState, ...body } as SystemSettings;
    return mockSettingsState;
  }
  return systemApi.updateSettings(body);
}

// ─────── Admins ───────

export async function listAdmins(): Promise<AdminUserListItem[]> {
  if (USE_MOCK) return mockAdminsState;
  return systemApi.listAdmins();
}

export async function setUserRole(id: string, role: Role): Promise<void> {
  if (USE_MOCK) {
    const u = mockAdminsState.find((x) => x.id === id);
    if (u) u.role = role;
    return;
  }
  await systemApi.setUserRole(id, role);
}

// ─────── Feature flags ───────

export async function listFeatureFlags(): Promise<FeatureFlagDto[]> {
  if (USE_MOCK) return mockFlagsState;
  return systemApi.listFlags();
}

export async function updateFeatureFlag(
  key: string,
  body: { enabled: boolean; description?: string },
): Promise<void> {
  if (USE_MOCK) {
    const f = mockFlagsState.find((x) => x.key === key);
    if (f) {
      f.enabled = body.enabled;
      if (body.description !== undefined) f.description = body.description;
      f.updatedAt = new Date().toISOString();
    }
    return;
  }
  await systemApi.updateFlag(key, body);
}

// ─────── Permissions ───────

const MOCK_MATRIX: PermissionMatrixDto = {
  roles: ['CUSTOMER', 'OWNER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'],
  permissions: [
    { id: 'p1', key: 'venue.approve', category: 'Venue', description: 'Duyệt venue do owner nộp' },
    { id: 'p2', key: 'venue.reject', category: 'Venue', description: 'Từ chối venue' },
    { id: 'p3', key: 'venue.suspend', category: 'Venue', description: 'Đình chỉ venue' },
    { id: 'p4', key: 'user.suspend', category: 'User', description: 'Khóa tài khoản user' },
    { id: 'p5', key: 'voucher.create', category: 'Voucher', description: 'Tạo voucher mới' },
    { id: 'p6', key: 'report.view', category: 'Report', description: 'Xem báo cáo doanh thu, GMV' },
    { id: 'p7', key: 'audit.view', category: 'Audit', description: 'Xem audit log' },
  ],
  grants: {
    CUSTOMER: [],
    OWNER: [],
    STAFF: [],
    ADMIN: ['venue.approve', 'venue.reject', 'venue.suspend', 'user.suspend', 'voucher.create', 'report.view', 'audit.view'],
    SUPER_ADMIN: ['venue.approve', 'venue.reject', 'venue.suspend', 'user.suspend', 'voucher.create', 'report.view', 'audit.view'],
  },
};
let mockMatrixState: PermissionMatrixDto = JSON.parse(JSON.stringify(MOCK_MATRIX));

export async function getPermissionMatrix(): Promise<PermissionMatrixDto> {
  if (USE_MOCK) return mockMatrixState;
  return systemApi.getPermissionMatrix();
}

export async function updateRolePermissions(role: Role, keys: string[]): Promise<PermissionMatrixDto> {
  if (USE_MOCK) {
    if (role === 'SUPER_ADMIN') throw new Error('Cannot modify SUPER_ADMIN permissions');
    mockMatrixState = {
      ...mockMatrixState,
      grants: { ...mockMatrixState.grants, [role]: [...keys] },
    };
    return mockMatrixState;
  }
  return systemApi.updateRolePermissions(role, keys);
}
