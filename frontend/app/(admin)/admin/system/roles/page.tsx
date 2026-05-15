'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Search } from 'lucide-react';
import { listAdmins, setUserRole } from '@/lib/data/system';
import { listAdminUsers } from '@/lib/data/admin';
import { isApiError } from '@/lib/api/errors';
import type { AdminUserListItem } from '@/lib/api/endpoints/system';
import type { AdminUserDto } from '@/lib/api/endpoints/admin';
import type { Role } from '@/lib/api/types';

const ROLE_TONE: Record<Role, 'destructive' | 'accent' | 'warning' | 'default'> = {
  CUSTOMER: 'default',
  OWNER: 'accent',
  STAFF: 'warning',
  ADMIN: 'destructive',
  SUPER_ADMIN: 'destructive',
};

export default function SystemRolesPage() {
  const [admins, setAdmins] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPromote, setShowPromote] = useState(false);
  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUserDto[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    listAdmins()
      .then(setAdmins)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showPromote) return;
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      listAdminUsers({ q })
        .then(({ data }) =>
          setSearchResults(data.filter((u) => u.role === 'CUSTOMER' || u.role === 'OWNER')),
        )
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, showPromote]);

  async function handleSetRole(id: string, role: Role, name: string) {
    if (!confirm(`Đổi role của ${name} sang ${role}?`)) return;
    try {
      await setUserRole(id, role);
      toast.success(`Đã đổi role sang ${role}`);
      const list = await listAdmins();
      setAdmins(list);
      setShowPromote(false);
      setQ('');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đổi role thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="destructive">
            <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Quản lý role</h1>
          <p className="text-sm text-muted-foreground">Cấp/thu hồi quyền ADMIN, SUPER_ADMIN</p>
        </div>
        <Button onClick={() => setShowPromote(!showPromote)}>Cấp quyền admin</Button>
      </div>

      {showPromote && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <h3 className="font-bold">Cấp quyền ADMIN cho user</h3>
          <p className="text-sm text-muted-foreground">Tìm user (CUSTOMER/OWNER) theo email/tên</p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email, tên..."
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {searching ? (
            <p className="mt-4 text-sm text-muted-foreground">Đang tìm...</p>
          ) : searchResults.length > 0 ? (
            <div className="mt-4 space-y-2">
              {searchResults.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{u.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email ?? '—'} · {u.role}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSetRole(u.id, 'ADMIN', u.fullName)}>
                    Cấp ADMIN
                  </Button>
                </div>
              ))}
            </div>
          ) : q ? (
            <p className="mt-4 text-sm text-muted-foreground">Không tìm thấy user phù hợp</p>
          ) : null}
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có admin nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Admin</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-center font-medium">Vào ngày</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{u.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.email ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={ROLE_TONE[u.role] as never}>
                      {u.role === 'SUPER_ADMIN' && <Crown className="mr-1 h-3 w-3" />}
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role === 'ADMIN' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetRole(u.id, 'SUPER_ADMIN', u.fullName)}
                        >
                          Promote SUPER_ADMIN
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleSetRole(u.id, 'CUSTOMER', u.fullName)}
                        >
                          Thu hồi
                        </Button>
                      </>
                    )}
                    {u.role === 'SUPER_ADMIN' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleSetRole(u.id, 'ADMIN', u.fullName)}
                      >
                        Demote ADMIN
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
