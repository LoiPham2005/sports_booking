/**
 * Data layer cho auth — quyết định mock vs real API qua `USE_MOCK`.
 *
 * Mock mode: không gọi backend, chỉ log + thành công ngay (UI flow giống nhau).
 * Real mode: call API thật, backend revoke refresh token + clear httpOnly cookies.
 */
import { USE_MOCK } from '@/lib/api/config';
import { authApi } from '@/lib/api/endpoints/auth';
import { usersApi } from '@/lib/api/endpoints/users';
import { isApiError } from '@/lib/api/errors';
import type { UiUser } from '@/lib/api/adapters/user';

const MOCK_USER_KEY = 'sb_mock_user';

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    clearMockUser();
    return;
  }
  try {
    await authApi.logout();
  } catch (e) {
    if (isApiError(e) && e.status === 401) return;
    throw e;
  }
}

/**
 * Trả về user đang đăng nhập (null nếu chưa login).
 *
 * - Mock: đọc từ localStorage (set bởi quick-login chip ở /login)
 * - API: gọi GET /me, 401 → null
 */
export async function getCurrentUser(): Promise<UiUser | null> {
  if (USE_MOCK) {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(MOCK_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UiUser;
    } catch {
      return null;
    }
  }
  try {
    return await usersApi.me();
  } catch {
    return null;
  }
}

/** Lưu user mock vào localStorage (dùng khi quick-login ở mode mock). */
export function setMockUser(user: UiUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

export function clearMockUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MOCK_USER_KEY);
}
