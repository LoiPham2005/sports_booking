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

/**
 * In-memory cache cho user hiện tại — set ngay sau login để useCurrentUser
 * không bị flash "logged-out" trong lúc chờ /me.
 *
 * - `undefined`: chưa từng fetch (sẽ gọi /me)
 * - `null`: confirmed logged-out
 * - `UiUser`: confirmed logged-in
 */
let cachedCurrentUser: UiUser | null | undefined = undefined;

export function setCurrentUserCache(user: UiUser | null): void {
  cachedCurrentUser = user;
}

export function getCurrentUserCache(): UiUser | null | undefined {
  return cachedCurrentUser;
}

export async function logout(): Promise<void> {
  // Clear cache permissions (lazy import để tránh circular)
  try {
    const mod = await import('@/lib/use-permissions');
    mod.clearPermissionsCache();
  } catch {
    // ignore
  }
  cachedCurrentUser = null;
  try {
    const mod = await import('@/lib/use-staff-role');
    mod.clearStaffRoleCache();
  } catch {
    // ignore
  }
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
    if (!raw) {
      cachedCurrentUser = null;
      return null;
    }
    try {
      const u = JSON.parse(raw) as UiUser;
      cachedCurrentUser = u;
      return u;
    } catch {
      cachedCurrentUser = null;
      return null;
    }
  }
  try {
    const u = await usersApi.me();
    cachedCurrentUser = u;
    return u;
  } catch (e) {
    // Chỉ coi là logged-out khi server trả 401 sau khi đã thử refresh.
    // Lỗi network/timeout → giữ cached user (nếu có) để tránh flash logged-out.
    if (isApiError(e) && e.status === 401) {
      cachedCurrentUser = null;
      return null;
    }
    return cachedCurrentUser ?? null;
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
