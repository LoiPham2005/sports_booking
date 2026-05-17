'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, getCurrentUserCache } from '@/lib/data/auth';
import type { UiUser } from '@/lib/api/adapters/user';

/**
 * Hook lấy user hiện tại (client-side).
 *
 * Return value:
 * - `undefined`: đang loading (lần đầu fetch)
 * - `null`: chưa đăng nhập
 * - `UiUser`: đã đăng nhập
 *
 * Tự re-fetch khi `storage` event đổi (cross-tab) hoặc khi `auth-changed`
 * custom event được dispatch (do login/logout trong cùng tab).
 */
export function useCurrentUser(): UiUser | null | undefined {
  const [user, setUser] = useState<UiUser | null | undefined>(() => getCurrentUserCache());

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const next = await getCurrentUser();
        if (!cancelled) setUser(next);
      } catch {
        if (!cancelled) setUser(null);
      }
    }
    refresh();

    function onStorage(e: StorageEvent) {
      if (e.key === 'sb_mock_user') refresh();
    }
    function onAuthChange() {
      refresh();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed', onAuthChange);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed', onAuthChange);
    };
  }, []);

  return user;
}

/** Trigger re-fetch user ở tất cả components đang dùng `useCurrentUser`. */
export function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}
