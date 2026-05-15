import { apiGet, apiPatch } from '../client';
import type { Role, UserStatus } from '../types';

export interface SystemSettings {
  commissionPercent: number;
  bookingHoldMinutes: number;
  paymentTimeoutMinutes: number;
  defaultCancelPolicy: {
    hours24Refund?: number;
    hours12Refund?: number;
    under12Refund?: number;
  };
  payoutSchedule: string;
  vatPercent: number;
}

export interface UpdateSettingsInput extends Partial<SystemSettings> {}

export interface AdminUserListItem {
  id: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export const systemApi = {
  getSettings: () => apiGet<SystemSettings>('/system/settings'),
  updateSettings: (body: UpdateSettingsInput) =>
    apiPatch<SystemSettings>('/system/settings', body),

  listAdmins: () => apiGet<AdminUserListItem[]>('/system/admins'),
  setUserRole: (id: string, role: Role) =>
    apiPatch<AdminUserListItem>(`/system/users/${encodeURIComponent(id)}/role`, { role }),

  listFlags: () => apiGet<FeatureFlagDto[]>('/system/feature-flags'),
  updateFlag: (key: string, body: { enabled: boolean; description?: string }) =>
    apiPatch<FeatureFlagDto>(`/system/feature-flags/${encodeURIComponent(key)}`, body),
};
