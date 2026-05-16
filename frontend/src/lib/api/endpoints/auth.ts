import { apiGet, apiPost } from '../client';
import type { AuthResultDto, UserDto } from '../types';

export interface LoginInput {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterInput {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  locale?: string;
}

export const authApi = {
  login: (body: LoginInput) => apiPost<AuthResultDto>('/auth/login', body),

  register: (body: RegisterInput) => apiPost<AuthResultDto>('/auth/register', body),

  /** Cookie sb_refresh được gửi tự động. Trả về token mới + set cookie mới. */
  refresh: () => apiPost<AuthResultDto>('/auth/refresh', {}),

  logout: () => apiPost<void>('/auth/logout', {}),

  me: () => apiGet<UserDto>('/me'),

  forgotPassword: (identifier: string) =>
    apiPost<{ ok: boolean }>('/auth/forgot-password', { identifier }),

  resetPassword: (body: { identifier: string; code: string; newPassword: string }) =>
    apiPost<{ ok: boolean }>('/auth/reset-password', body),
};
