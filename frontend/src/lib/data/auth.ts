/**
 * Data layer cho auth — quyết định mock vs real API qua `USE_MOCK`.
 *
 * Mock mode: không gọi backend, chỉ log + thành công ngay (UI flow giống nhau).
 * Real mode: call API thật, backend revoke refresh token + clear httpOnly cookies.
 */
import { USE_MOCK } from '@/lib/api/config';
import { authApi } from '@/lib/api/endpoints/auth';
import { isApiError } from '@/lib/api/errors';

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    // Mock không có state để clear — chỉ giả lập delay nhỏ cho UX giống thật.
    await new Promise((r) => setTimeout(r, 150));
    return;
  }
  try {
    await authApi.logout();
  } catch (e) {
    // 401 (cookie đã hết hạn) → coi như logout thành công.
    if (isApiError(e) && e.status === 401) return;
    throw e;
  }
}
