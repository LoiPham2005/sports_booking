'use client';

import { useEffect, useState } from 'react';
import { USE_MOCK } from '@/lib/api/config';
import { usersApi } from '@/lib/api/endpoints/users';
import { useCurrentUser } from '@/lib/use-current-user';
import type { Role } from '@/lib/api/types';

/**
 * Permission mặc định cho mock mode khi USE_MOCK=true.
 * Khớp với DEFAULT_ROLE_GRANTS trong backend/src/modules/system/permissions.seed.ts.
 */
const MOCK_PERMISSIONS: Record<Role, string[]> = {
  CUSTOMER: [],
  OWNER: [],
  STAFF: [],
  ADMIN: [
    'venue.list', 'venue.approve', 'venue.reject', 'venue.suspend',
    'booking.list_all', 'booking.cancel_any', 'booking.refund',
    'user.list', 'user.suspend',
    'review.hide',
    'voucher.create', 'voucher.update', 'voucher.delete',
    'payout.approve', 'payout.reject',
    'dispute.resolve',
    'report.view', 'audit.view',
  ],
  // SUPER_ADMIN: tự động có toàn bộ — không cần list (handled bằng special-case)
  SUPER_ADMIN: ['*'],
};

let cachedKeys: Set<string> | null = null;
let cachedUserId: string | null = null;
let inFlight: Promise<Set<string>> | null = null;

/**
 * Hook lấy permission keys của user hiện tại.
 *
 * Return:
 * - `undefined` — đang loading
 * - `Set<string>` — danh sách keys (SUPER_ADMIN trả về `Set(['*'])`)
 */
export function useMyPermissions(): Set<string> | undefined {
  const user = useCurrentUser();
  const initial = user && cachedUserId === user.id ? cachedKeys ?? undefined : undefined;
  const [keys, setKeys] = useState<Set<string> | undefined>(initial);

  useEffect(() => {
    if (user === undefined) {
      // Still loading user — keep keys as undefined (loading state)
      setKeys(undefined);
      return;
    }
    if (user === null) {
      cachedKeys = null;
      cachedUserId = null;
      setKeys(new Set());
      return;
    }
    if (cachedKeys && cachedUserId === user.id) {
      setKeys(cachedKeys);
      return;
    }

    // User changed — invalidate stale cache
    cachedKeys = null;
    inFlight = null;
    setKeys(undefined);

    let cancelled = false;
    const loadUserId = user.id;
    async function load(): Promise<Set<string>> {
      if (USE_MOCK) {
        if (user!.role === 'SUPER_ADMIN') return new Set(['*']);
        return new Set(MOCK_PERMISSIONS[user!.role] ?? []);
      }
      const res = await usersApi.myPermissions();
      return new Set(res.keys);
    }

    if (!inFlight) inFlight = load();
    inFlight
      .then((s) => {
        cachedKeys = s;
        cachedUserId = loadUserId;
        if (!cancelled) setKeys(s);
      })
      .catch(() => {
        if (!cancelled) setKeys(new Set());
      })
      .finally(() => {
        inFlight = null;
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return keys;
}

/**
 * Helper: check user hiện tại có quyền `key` không.
 *
 * @returns `undefined` khi đang loading, `boolean` khi sẵn sàng.
 */
export function useHasPermission(key: string): boolean | undefined {
  const keys = useMyPermissions();
  if (keys === undefined) return undefined;
  return keys.has('*') || keys.has(key);
}

/** Clear cache (gọi sau logout / khi role đổi). */
export function clearPermissionsCache() {
  cachedKeys = null;
  cachedUserId = null;
  inFlight = null;
}
