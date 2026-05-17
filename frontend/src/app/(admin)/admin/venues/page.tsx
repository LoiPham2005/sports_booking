'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { listAdminVenues, approveVenue, rejectVenue, suspendVenue } from '@/lib/data/admin';
import { useConfirm } from '@/components/ui/confirm';
import { usePrompt } from '@/components/ui/prompt';
import { isApiError } from '@/lib/api/errors';
import type { AdminVenueDto } from '@/lib/api/endpoints/admin';
import type { VenueStatus } from '@/lib/api/types';

const STATUS_TABS: { value: VenueStatus | 'ALL'; label: string }[] = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'SUSPENDED', label: 'Đình chỉ' },
  { value: 'ALL', label: 'Tất cả' },
];

const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  PENDING: { text: 'Chờ duyệt', tone: 'warning' },
  APPROVED: { text: 'Hoạt động', tone: 'success' },
  SUSPENDED: { text: 'Đình chỉ', tone: 'destructive' },
  DRAFT: { text: 'Nháp', tone: 'muted' },
};

function AdminVenuesInner() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as VenueStatus) ?? 'PENDING';

  const confirm = useConfirm();
  const prompt = usePrompt();
  const [status, setStatus] = useState<VenueStatus | 'ALL'>(initialStatus);
  const [q, setQ] = useState('');
  const [venues, setVenues] = useState<AdminVenueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [status, q]);

  const pagedVenues = useMemo(
    () => venues.slice((page - 1) * pageSize, page * pageSize),
    [venues, page, pageSize],
  );

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const params = {
      status: status === 'ALL' ? undefined : status,
      q: q || undefined,
    };
    listAdminVenues(params)
      .then((list) => !cancelled && setVenues(list))
      .catch(() => !cancelled && setVenues([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, q]);

  async function handleApprove(id: string) {
    setActingId(id);
    try {
      await approveVenue(id);
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success('Đã duyệt venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Duyệt thất bại');
    } finally {
      setActingId(null);
    }
  }

  async function handleSuspend(id: string, name: string) {
    const ok = await confirm({
      title: 'Đình chỉ venue?',
      description: `Đình chỉ "${name}" — venue sẽ không nhận booking mới cho đến khi khôi phục.`,
      tone: 'warning',
      confirmText: 'Đình chỉ',
    });
    if (!ok) return;
    setActingId(id);
    try {
      const updated = await suspendVenue(id);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v)));
      toast.success('Đã đình chỉ venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đình chỉ thất bại');
    } finally {
      setActingId(null);
    }
  }

  async function handleRestore(id: string, name: string) {
    const ok = await confirm({
      title: 'Khôi phục venue?',
      description: `Khôi phục "${name}" về trạng thái hoạt động.`,
      confirmText: 'Khôi phục',
    });
    if (!ok) return;
    setActingId(id);
    try {
      const updated = await approveVenue(id);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v)));
      toast.success('Đã khôi phục venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Khôi phục thất bại');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = await prompt({
      title: 'Từ chối venue',
      description: 'Nhập lý do từ chối để owner biết (tuỳ chọn).',
      placeholder: 'VD: Hình ảnh thiếu rõ ràng, địa chỉ chưa xác minh...',
      multiline: true,
      maxLength: 500,
      confirmText: 'Từ chối',
    });
    if (reason === null) return; // user cancel
    setActingId(id);
    try {
      await rejectVenue(id, reason || undefined);
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success('Đã từ chối venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Từ chối thất bại');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý venue</h1>
        <p className="text-sm text-muted-foreground">
          Duyệt venue mới, đình chỉ venue vi phạm, xem trạng thái toàn nền tảng
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border bg-card p-1">
          {STATUS_TABS.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={status === t.value ? 'secondary' : 'ghost'}
              onClick={() => setStatus(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-base font-semibold">Không có venue nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === 'PENDING' ? 'Không còn venue chờ duyệt' : 'Đổi filter để xem khác'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagedVenues.map((v) => {
            const tone = STATUS_LABEL[v.status]?.tone ?? 'default';
            const text = STATUS_LABEL[v.status]?.text ?? v.status;
            return (
              <Card key={v.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-5 md:flex-row">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{v.name}</h3>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {v.addressLine}
                          {v.district ? `, ${v.district}` : ''}, {v.city}
                        </p>
                      </div>
                      <Badge variant={tone as never}>{text}</Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{v.owner.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-medium">{v.owner.fullName}</p>
                        <p className="text-muted-foreground">{v.owner.email ?? '—'}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>{v._count.courts} sân</span>
                      <span>·</span>
                      <span>{v._count.bookings} booking</span>
                      <span>·</span>
                      <span>{new Date(v.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {v.status === 'PENDING' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(v.id)}
                          disabled={actingId === v.id}
                        >
                          Từ chối
                        </Button>
                        <Button onClick={() => handleApprove(v.id)} disabled={actingId === v.id}>
                          {actingId === v.id ? 'Đang xử lý...' : 'Duyệt'}
                        </Button>
                      </div>
                    )}
                    {v.status === 'APPROVED' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleSuspend(v.id, v.name)}
                          disabled={actingId === v.id}
                        >
                          {actingId === v.id ? 'Đang xử lý...' : 'Đình chỉ'}
                        </Button>
                      </div>
                    )}
                    {v.status === 'SUSPENDED' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => handleRestore(v.id, v.name)}
                          disabled={actingId === v.id}
                        >
                          {actingId === v.id ? 'Đang xử lý...' : 'Khôi phục hoạt động'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {venues.length > 0 && (
            <Card className="overflow-hidden p-0">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={venues.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                className="border-t-0"
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminVenuesPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted/30" />}>
      <AdminVenuesInner />
    </Suspense>
  );
}
