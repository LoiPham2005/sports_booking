'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { Search, Download } from 'lucide-react';
import { listAdminUsers, updateAdminUser } from '@/lib/data/admin';
import { isApiError } from '@/lib/api/errors';
import type { AdminUserDto } from '@/lib/api/endpoints/admin';
import type { Role, UserStatus } from '@/lib/api/types';

const ROLE_TONE: Record<Role, 'default' | 'accent' | 'warning' | 'destructive'> = {
  CUSTOMER: 'default',
  OWNER: 'accent',
  STAFF: 'warning',
  ADMIN: 'destructive',
  SUPER_ADMIN: 'destructive',
};

const ROLES: Role[] = ['CUSTOMER', 'OWNER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset về trang 1 khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [q, roleFilter]);

  // Slice client-side (server-side pagination sẽ chuyển sang dùng params page/pageSize)
  const pagedUsers = useMemo(
    () => users.slice((page - 1) * pageSize, page * pageSize),
    [users, page, pageSize],
  );

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(() => {
      listAdminUsers({
        q: q || undefined,
        role: roleFilter || undefined,
      })
        .then(({ data, total }) => {
          if (!cancelled) {
            setUsers(data);
            setTotal(total);
          }
        })
        .catch(() => !cancelled && setUsers([]))
        .finally(() => !cancelled && setLoading(false));
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, roleFilter]);

  async function toggleStatus(u: AdminUserDto) {
    const next: UserStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
    try {
      await updateAdminUser(u.id, { status: next });
      toast.success(next === 'SUSPENDED' ? 'Đã suspend' : 'Đã active lại');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Cập nhật thất bại');
      // Revert
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: u.status } : x)));
    }
  }

  async function changeRole(u: AdminUserDto, role: Role) {
    if (!confirm(`Đổi role ${u.fullName} sang ${role}?`)) return;
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
    try {
      await updateAdminUser(u.id, { role });
      toast.success(`Đã đổi role sang ${role}`);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đổi role thất bại');
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: u.role } : x)));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${total} tài khoản`}
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email, SĐT, tên..."
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          >
            <option value="">Tất cả role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Không có user nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-right font-medium">Bookings</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium">Vào ngày</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{u.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email ?? '—'}
                          {u.phone ? ` · ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      className="h-7 rounded border bg-background px-2 text-xs"
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">{u._count.bookings}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        u.status === 'ACTIVE'
                          ? 'success'
                          : u.status === 'SUSPENDED'
                            ? 'destructive'
                            : ('muted' as never)
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(u)}>
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && users.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>
    </div>
  );
}
