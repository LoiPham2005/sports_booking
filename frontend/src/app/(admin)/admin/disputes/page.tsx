'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { AlertTriangle } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { listDisputes, resolveDispute } from '@/lib/data/admin';
import { isApiError } from '@/lib/api/errors';
import { usePrompt } from '@/components/ui/prompt';
import type { AdminDisputeDto } from '@/lib/api/endpoints/admin';

type TabValue = 'PENDING' | 'SUCCESS' | 'FAILED';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'SUCCESS', label: 'Đã duyệt' },
  { value: 'FAILED', label: 'Đã từ chối' },
];

const STATUS_BADGE: Record<TabValue, { text: string; variant: 'warning' | 'success' | 'destructive' }> = {
  PENDING: { text: 'PENDING', variant: 'warning' },
  SUCCESS: { text: 'ĐÃ DUYỆT', variant: 'success' },
  FAILED: { text: 'ĐÃ TỪ CHỐI', variant: 'destructive' },
};

export default function AdminDisputesPage() {
  const [tab, setTab] = useState<TabValue>('PENDING');
  const [disputes, setDisputes] = useState<AdminDisputeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const prompt = usePrompt();

  const pagedDisputes = useMemo(
    () => disputes.slice((page - 1) * pageSize, page * pageSize),
    [disputes, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    listDisputes({ status: tab })
      .then((d) => !cancelled && setDisputes(d))
      .catch(() => !cancelled && setDisputes([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function handleResolve(id: string, approve: boolean) {
    const note = await prompt({
      title: approve ? 'Duyệt refund' : 'Từ chối refund',
      description: approve
        ? 'Ghi chú nội bộ về quyết định duyệt (tuỳ chọn).'
        : 'Nhập lý do từ chối để gửi cho khách hàng.',
      placeholder: approve ? 'VD: Đã xác minh khiếu nại hợp lệ' : 'VD: Khiếu nại không đủ căn cứ',
      multiline: true,
      maxLength: 500,
      required: !approve,
      confirmText: approve ? 'Duyệt refund' : 'Từ chối',
    });
    if (note === null) return;
    setActingId(id);
    try {
      await resolveDispute(id, { approve, note: note || undefined });
      setDisputes((prev) => prev.filter((d) => d.id !== id));
      toast.success(approve ? 'Đã duyệt refund' : 'Đã từ chối');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xử lý thất bại');
    } finally {
      setActingId(null);
    }
  }

  const emptyText: Record<TabValue, { title: string; desc: string }> = {
    PENDING: { title: 'Không có khiếu nại nào', desc: 'Tuyệt vời! Không có refund nào chờ xử lý' },
    SUCCESS: { title: 'Chưa có refund nào được duyệt', desc: 'Lịch sử duyệt refund sẽ hiện ở đây' },
    FAILED: { title: 'Chưa có refund nào bị từ chối', desc: 'Lịch sử từ chối refund sẽ hiện ở đây' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khiếu nại & hoàn tiền</h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? '...'
            : tab === 'PENDING'
              ? `${disputes.length} yêu cầu refund đang chờ xử lý`
              : `${disputes.length} bản ghi lịch sử`}
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-md border bg-card p-1 w-fit">
        {TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={tab === t.value ? 'secondary' : 'ghost'}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold">{emptyText[tab].title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyText[tab].desc}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagedDisputes.map((d) => {
            const status = (d.status as TabValue) ?? 'PENDING';
            const badge = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
            const isPending = status === 'PENDING';
            return (
              <Card key={d.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{(d.payment.user.fullName ?? '?')[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        Refund #{d.id.slice(0, 8)}
                      </p>
                      {d.payment.booking && (
                        <Badge variant="outline" className="text-xs">
                          Booking #{d.payment.booking.code}
                        </Badge>
                      )}
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>
                    <p className="mt-1 font-semibold">{d.payment.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.payment.user.email ?? '—'} · Tạo{' '}
                      {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-3 text-sm">{d.reason ?? '(không có lý do / ghi chú)'}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Số tiền refund</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatVND(d.amount)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      qua {d.payment.provider}
                    </p>
                    {isPending && (
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(d.id, false)}
                          disabled={actingId === d.id}
                        >
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolve(d.id, true)}
                          disabled={actingId === d.id}
                        >
                          {actingId === d.id ? '...' : 'Duyệt refund'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {disputes.length > 0 && (
            <Card className="overflow-hidden p-0">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={disputes.length}
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
