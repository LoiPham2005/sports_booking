'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { USE_MOCK } from '@/lib/api/config';
import { getMyMemberships } from '@/lib/data/staff';

export type StaffRole = 'manager' | 'staff';

/**
 * Cache module-level cho membership fetch — tránh mỗi page (layout + page con)
 * tự gọi `/staff/memberships` riêng → polling khi đổi route.
 */
let cachedRole: StaffRole | null = null;
let inFlight: Promise<StaffRole> | null = null;

/**
 * Lấy role staff hiện tại.
 *
 * - **USE_MOCK=true**: đọc từ URL `?role=manager` (demo flow).
 * - **USE_MOCK=false**: fetch `/staff/memberships` từ backend, là MANAGER nếu user là Manager
 *   ít nhất 1 venue. Cache module-level (1 fetch / tab lifetime).
 */
/**
 * Trả `undefined` khi chưa biết role (đang fetch), giúp UI phân biệt
 * "đang loading" với "đã confirmed là staff" — tránh nháy AccessDenied.
 */
export function useStaffRole(): StaffRole | undefined {
  const params = useSearchParams();
  const mockRole: StaffRole =
    USE_MOCK && params.get('role') === 'manager' ? 'manager' : 'staff';

  const [role, setRole] = useState<StaffRole | undefined>(
    USE_MOCK ? mockRole : cachedRole ?? undefined,
  );

  useEffect(() => {
    if (USE_MOCK) {
      setRole(mockRole);
      return;
    }
    if (cachedRole) {
      setRole(cachedRole);
      return;
    }
    let cancelled = false;
    if (!inFlight) {
      inFlight = getMyMemberships()
        .then((ms) => (ms.some((m) => m.role === 'MANAGER') ? 'manager' : 'staff'))
        .catch(() => 'staff' as StaffRole)
        .finally(() => {
          inFlight = null;
        });
    }
    inFlight.then((r) => {
      cachedRole = r;
      if (!cancelled) setRole(r);
    });
    return () => {
      cancelled = true;
    };
  }, [mockRole]);

  return role;
}

/** Helper preserve role across navigation. Vẫn cần cho USE_MOCK demo. */
export function withRole(path: string, role: StaffRole | undefined): string {
  if (!USE_MOCK) return path;
  if (role === 'manager') {
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}role=manager`;
  }
  return path;
}

/** Reset cache khi logout / user đổi. */
export function clearStaffRoleCache() {
  cachedRole = null;
  inFlight = null;
}
