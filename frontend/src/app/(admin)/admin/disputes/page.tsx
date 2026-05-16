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
import type { AdminDisputeDto } from '@/lib/api/endpoints/admin';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDisputeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedDisputes = useMemo(
    () => disputes.slice((page - 1) * pageSize, page * pageSize),
    [disputes, page, pageSize],
  );

  useEffect(() => {
    let cancelled = false;
    listDisputes()
      .then((d) => !cancelled && setDisputes(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResolve(id: string, approve: boolean) {
    const note = prompt(approve ? 'Ghi chú duyệt refund (tuỳ chọn):' : 'Lý do từ chối:');
    if (approve && note === null) return; // user cancel prompt
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khiếu nại & hoàn tiền</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? '...' : `${disputes.length} yêu cầu refund đang chờ xử lý`}
        </p>
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
          <p className="mt-4 text-base font-semibold">Không có khiếu nại nào</p>
          <p className="mt-1 text-sm text-muted-foreground">Tuyệt vời! Không có refund nào chờ xử lý</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagedDisputes.map((d) => (
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
                    <Badge variant="warning">PENDING</Badge>
                  </div>
                  <p className="mt-1 font-semibold">{d.payment.user.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.payment.user.email ?? '—'} · Tạo{' '}
                    {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="mt-3 text-sm">{d.reason ?? '(không có lý do)'}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Số tiền refund</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatVND(d.amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    qua {d.payment.provider}
                  </p>
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
                </div>
              </div>
            </Card>
          ))}

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
