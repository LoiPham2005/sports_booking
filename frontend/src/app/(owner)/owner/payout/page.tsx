'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Building2, Edit2, Download } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { getPayoutSummary, requestPayout } from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import type { PayoutSummary } from '@/lib/api/endpoints/owner';

export default function OwnerPayoutPage() {
  const [data, setData] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedHistory = useMemo(() => {
    if (!data) return [];
    return data.history.slice((page - 1) * pageSize, page * pageSize);
  }, [data, page, pageSize]);

  useEffect(() => {
    let cancelled = false;
    getPayoutSummary()
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRequest() {
    setRequesting(true);
    try {
      await requestPayout();
      toast.success('Đã gửi yêu cầu payout. Tiền sẽ về sau 1-2 ngày làm việc.');
      // Refetch
      const next = await getPayoutSummary();
      setData(next);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Yêu cầu payout thất bại');
    } finally {
      setRequesting(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-muted/30" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-xl border bg-muted/30 lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhận tiền</h1>
        <p className="text-sm text-muted-foreground">
          Số dư chờ + tài khoản ngân hàng + lịch sử chuyển
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending balance */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 p-6 text-primary-foreground">
            <p className="text-xs uppercase tracking-wide opacity-80">Số dư chờ thanh toán</p>
            <p className="mt-1 text-4xl font-bold">{formatVND(data.pendingAmount)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">
                {data.pendingCount} earning entry
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRequest}
                disabled={requesting || data.pendingAmount === 0 || !data.bankAccount}
              >
                {requesting ? 'Đang gửi...' : 'Yêu cầu chuyển ngay'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-t">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Đã trả tổng</p>
              <p className="mt-1 text-xl font-bold">{formatVND(data.paidTotal)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Lần payout</p>
              <p className="mt-1 text-xl font-bold">{data.history.length}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Chu kỳ</p>
              <p className="mt-1 text-sm font-semibold">Tuần</p>
            </div>
          </div>
        </Card>

        {/* Bank account */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">Tài khoản nhận tiền</h3>
              <p className="text-xs text-muted-foreground">Mặc định</p>
            </div>
            <Button size="sm" variant="ghost">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          {data.bankAccount ? (
            <div className="mt-4 space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{data.bankAccount.bankCode}</p>
                  <p className="text-xs text-muted-foreground">{data.bankAccount.accountHolder}</p>
                </div>
              </div>
              <p className="font-mono text-lg">{data.bankAccount.accountNumber}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4 text-center">
              <p className="text-sm font-semibold text-destructive">Chưa có tài khoản</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cần thêm tài khoản ngân hàng để nhận payout
              </p>
              <Button size="sm" className="mt-2" disabled>
                Thêm tài khoản
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-bold">Lịch sử chuyển khoản</h3>
          <Button size="sm" variant="outline" disabled>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
        {data.history.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Chưa có lần payout nào
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Ngày tạo</th>
                <th className="px-6 py-3 text-left font-medium">Kỳ</th>
                <th className="px-6 py-3 text-right font-medium">Số tiền</th>
                <th className="px-6 py-3 text-center font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map((h) => (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="px-6 py-3">
                    {new Date(h.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(h.periodFrom).toLocaleDateString('vi-VN')} –{' '}
                    {new Date(h.periodTo).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold">{formatVND(h.amount)}</td>
                  <td className="px-6 py-3 text-center">
                    <Badge variant={h.status === 'PAID' ? 'success' : 'warning'}>{h.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data.history.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.history.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>
    </div>
  );
}
