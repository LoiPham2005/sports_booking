import type { UserDto, Role } from '../types';

export interface UiUser {
  id: string;
  email?: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
}

export function toUiUser(dto: UserDto): UiUser {
  return {
    id: dto.id,
    email: dto.email ?? undefined,
    phone: dto.phone ?? undefined,
    fullName: dto.fullName,
    avatarUrl: dto.avatarUrl ?? undefined,
    role: dto.role,
  };
}

/** Sau khi login, đẩy user về landing tương ứng. Dùng ở /login redirect. */
export function homePathByRole(role: Role): string {
  switch (role) {
    case 'OWNER':
      return '/owner';
    case 'STAFF':
      return '/staff';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin';
    default:
      return '/';
  }
}
