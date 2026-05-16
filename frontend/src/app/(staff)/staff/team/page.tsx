'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { Crown, Phone, Shield } from 'lucide-react';
import { useStaffRole } from '@/lib/use-staff-role';
import { getTeam } from '@/lib/data/staff';
import type { StaffMemberDto } from '@/lib/api/endpoints/staff';

export default function StaffTeamPage() {
  const role = useStaffRole();
  const [team, setTeam] = useState<StaffMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedTeam = useMemo(
    () => team.slice((page - 1) * pageSize, page * pageSize),
    [team, page, pageSize],
  );

  useEffect(() => {
    if (role !== 'manager') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getTeam()
      .then((t) => !cancelled && setTeam(t))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role !== 'manager') return <AccessDenied />;

  return (
    <div className="space-y-6">
      <div>
        <Badge className="border-transparent bg-violet-500/15 text-violet-700">
          <Crown className="mr-1 h-3 w-3" /> MANAGER
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Đội ngũ tại venue</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? '...' : `${team.length} nhân viên`}
        </p>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : team.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có nhân viên nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nhân viên</th>
                <th className="px-4 py-3 text-left font-medium">Liên hệ</th>
                <th className="px-4 py-3 text-center font-medium">Vai trò</th>
                <th className="px-4 py-3 text-center font-medium">Vào ngày</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pagedTeam.map((s) => {
                const name = s.user?.fullName ?? '(chưa accept)';
                const initials = (s.user?.fullName ?? s.email ?? '?')[0].toUpperCase();
                const isManager = s.role === 'MANAGER';
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={isManager ? 'bg-violet-500 text-white' : ''}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.user?.email ?? s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.user?.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {isManager ? (
                        <Badge className="border-transparent bg-violet-500/15 text-violet-700">
                          <Crown className="mr-1 h-3 w-3" /> MANAGER
                        </Badge>
                      ) : (
                        <Badge variant="accent">
                          <Shield className="mr-1 h-3 w-3" /> STAFF
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.user?.phone && (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a href={`tel:${s.user.phone.replace(/\s/g, '')}`}>
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && team.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={team.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      <Card className="border-amber-200 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
        <p className="text-amber-900 dark:text-amber-200">
          ℹ️ Manager chỉ <strong>xem</strong> đội ngũ. Mời/xoá nhân viên do <strong>Owner</strong>{' '}
          thực hiện tại <code>/owner/staff</code>.
        </p>
      </Card>
    </div>
  );
}

function AccessDenied() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-bold">Chỉ MANAGER được truy cập</h2>
      <Button asChild className="mt-4">
        <Link href="/staff">Về lịch hôm nay</Link>
      </Button>
    </Card>
  );
}
