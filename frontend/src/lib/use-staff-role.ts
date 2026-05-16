'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { USE_MOCK } from '@/lib/api/config';
import { getMyMemberships } from '@/lib/data/staff';

export type StaffRole = 'manager' | 'staff';

/**
 * Lấy role staff hiện tại.
 *
 * - **USE_MOCK=true**: đọc từ URL `?role=manager` (demo flow).
 * - **USE_MOCK=false**: fetch `/staff/memberships` từ backend, là MANAGER nếu user là Manager
 *   ít nhất 1 venue. Cache trong state (hook chỉ chạy 1 lần per mount).
 */
export function useStaffRole(): StaffRole {
  const params = useSearchParams();
  const [role, setRole] = useState<StaffRole>(
    USE_MOCK && params.get('role') === 'manager' ? 'manager' : 'staff',
  );

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;
    getMyMemberships()
      .then((ms) => {
        if (cancelled) return;
        setRole(ms.some((m) => m.role === 'MANAGER') ? 'manager' : 'staff');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return role;
}

/** Helper preserve role across navigation. Vẫn cần cho USE_MOCK demo. */
export function withRole(path: string, role: StaffRole): string {
  if (!USE_MOCK) return path; // Production: role lấy từ JWT, không cần URL param
  if (role === 'manager') {
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}role=manager`;
  }
  return path;
}
