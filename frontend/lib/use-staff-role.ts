'use client';

import { useSearchParams } from 'next/navigation';

export type StaffRole = 'manager' | 'staff';

/**
 * Đọc role từ URL `?role=manager` (mặc định: 'staff').
 * Đây là demo cơ chế — khi nối backend, role lấy từ JWT.
 */
export function useStaffRole(): StaffRole {
  const params = useSearchParams();
  return params.get('role') === 'manager' ? 'manager' : 'staff';
}

/** Helper preserve role across navigation. */
export function withRole(path: string, role: StaffRole): string {
  if (role === 'manager') {
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}role=manager`;
  }
  return path;
}
