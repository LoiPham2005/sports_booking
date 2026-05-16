'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import {
  listStaff,
  inviteStaff,
  removeStaff,
  updateStaff,
  listOwnerVenues,
} from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import type { StaffMemberDto, StaffRole } from '@/lib/api/endpoints/owner';
import type { UiVenue } from '@/lib/api/adapters/venue';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'destructive',
  REMOVED: 'muted',
};

export default function OwnerStaffPage() {
  const [staff, setStaff] = useState<StaffMemberDto[]>([]);
  const [venues, setVenues] = useState<UiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [query]);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteVenueId, setInviteVenueId] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('STAFF');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    Promise.all([listStaff(), listOwnerVenues()])
      .then(([s, v]) => {
        setStaff(s);
        setVenues(v);
        if (v[0]) setInviteVenueId(v[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite() {
    if (!inviteEmail.trim()) return toast.error('Nhập email');
    if (!inviteVenueId) return toast.error('Chọn venue');
    setInviting(true);
    try {
      const created = await inviteStaff({
        email: inviteEmail,
        venueId: inviteVenueId,
        role: inviteRole,
      });
      toast.success(`Đã gửi mời tới ${inviteEmail}`);
      setStaff((prev) => [created, ...prev]);
      setInviteEmail('');
      setShowInvite(false);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Mời thất bại');
    } finally {
      setInviting(false);
    }
  }

  async function handleSuspend(s: StaffMemberDto) {
    const nextStatus = s.inviteStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setStaff((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, inviteStatus: nextStatus } : x)),
    );
    try {
      await updateStaff(s.id, { inviteStatus: nextStatus });
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Cập nhật thất bại');
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Xoá nhân viên khỏi venue?')) return;
    setStaff((prev) => prev.filter((s) => s.id !== id));
    try {
      await removeStaff(id);
      toast.success('Đã xoá');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  const filtered = useMemo(
    () =>
      staff.filter((s) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          s.user?.fullName?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.user?.phone?.toLowerCase().includes(q) ||
          s.venue.name.toLowerCase().includes(q)
        );
      }),
    [staff, query],
  );
  const pagedStaff = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhân viên</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${staff.length} người tại các venue của bạn`}
          </p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <Plus className="h-4 w-4" /> Mời nhân viên
        </Button>
      </div>

      {showInvite && (
        <Card className="border-primary/40 bg-primary/5 p-6">
          <h3 className="font-bold">Mời nhân viên mới</h3>
          <p className="text-sm text-muted-foreground">
            Họ sẽ nhận email kèm link xác nhận. Link hết hạn sau 7 ngày.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <Input
              placeholder="Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as StaffRole)}
            >
              <option value="STAFF">Vai trò: STAFF</option>
              <option value="MANAGER">Vai trò: MANAGER</option>
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={inviteVenueId}
              onChange={(e) => setInviteVenueId(e.target.value)}
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? 'Đang gửi...' : 'Gửi mời'}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email, venue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 max-w-md border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            {query ? 'Không tìm thấy' : 'Chưa có nhân viên nào'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nhân viên</th>
                <th className="px-4 py-3 text-left font-medium">Venue</th>
                <th className="px-4 py-3 text-center font-medium">Vai trò</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedStaff.map((s) => {
                const name = s.user?.fullName ?? '(chưa accept)';
                const initials = (s.user?.fullName ?? s.email ?? '?')[0].toUpperCase();
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.user?.email ?? s.email}
                            {s.user?.phone ? ` · ${s.user.phone}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.venue.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={s.role === 'MANAGER' ? 'default' : 'outline'}>
                        {s.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={STATUS_TONE[s.inviteStatus] as never}>
                        {s.inviteStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.inviteStatus !== 'REMOVED' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleSuspend(s)}>
                            {s.inviteStatus === 'SUSPENDED' ? 'Mở khoá' : 'Tạm khoá'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleRemove(s.id)}
                          >
                            Xoá
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>
    </div>
  );
}
