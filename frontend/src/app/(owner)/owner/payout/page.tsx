'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Building2, Download, Trash2, Plus, Check, Star } from 'lucide-react';
import { formatVND } from '@/lib/format';
import {
  getPayoutSummary,
  requestPayout,
  listBankAccounts,
  createBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
} from '@/lib/data/owner';
import { isApiError } from '@/lib/api/errors';
import type { PayoutSummary, BankAccountDto } from '@/lib/api/endpoints/owner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { useConfirm } from '@/components/ui/confirm';

export default function OwnerPayoutPage() {
  const [data, setData] = useState<PayoutSummary | null>(null);
  const [banks, setBanks] = useState<BankAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const confirm = useConfirm();

  async function reload() {
    const [summary, bankList] = await Promise.all([getPayoutSummary(), listBankAccounts()]);
    setData(summary);
    setBanks(bankList);
  }

  const pagedHistory = useMemo(() => {
    if (!data) return [];
    return data.history.slice((page - 1) * pageSize, page * pageSize);
  }, [data, page, pageSize]);

  useEffect(() => {
    let cancelled = false;
    reload()
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openBankDialog() {
    setBankCode('');
    setAccountNumber('');
    setAccountHolder('');
    setBankOpen(true);
  }

  async function handleSaveBank() {
    if (!bankCode.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      toast.error('Vui lòng nhập đủ thông tin');
      return;
    }
    if (!/^[0-9]{6,20}$/.test(accountNumber.trim())) {
      toast.error('Số tài khoản gồm 6-20 chữ số');
      return;
    }
    setSavingBank(true);
    try {
      // TK đầu tiên auto-default; sau đó user tự bấm "Đặt mặc định" nếu cần
      await createBankAccount({
        bankCode: bankCode.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        isDefault: banks.length === 0,
      });
      toast.success('Đã thêm tài khoản');
      setBankOpen(false);
      await reload();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu tài khoản thất bại');
    } finally {
      setSavingBank(false);
    }
  }

  async function handleSetDefault(b: BankAccountDto) {
    if (b.isDefault) return;
    try {
      await setDefaultBankAccount(b.id);
      toast.success(`Đã đặt ${b.bankCode} làm mặc định`);
      await reload();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đặt mặc định thất bại');
    }
  }

  async function handleDeleteBank(b: BankAccountDto) {
    const ok = await confirm({
      title: 'Xoá tài khoản này?',
      description: `${b.bankCode} · ${b.accountNumber} (${b.accountHolder})`,
      tone: 'destructive',
      confirmText: 'Xoá',
    });
    if (!ok) return;
    try {
      await deleteBankAccount(b.id);
      toast.success('Đã xoá tài khoản');
      await reload();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  async function handleRequest() {
    setRequesting(true);
    try {
      await requestPayout();
      toast.success('Đã gửi yêu cầu payout. Tiền sẽ về sau 1-2 ngày làm việc.');
      await reload();
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

      {/* Pending balance — full width */}
      <Card className="overflow-hidden">
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

      {/* Bank accounts — section riêng, grid 1/2/3 cột theo màn */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold">Tài khoản nhận tiền</h3>
            <p className="text-xs text-muted-foreground">
              {banks.length > 0
                ? `${banks.length} tài khoản · TK mặc định nhận payout`
                : 'Chưa có tài khoản — cần ít nhất 1 TK để nhận payout'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={openBankDialog}>
            <Plus className="h-3.5 w-3.5" /> Thêm tài khoản
          </Button>
        </div>

        {banks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-destructive">Chưa có tài khoản nào</p>
            <Button size="sm" className="mt-3" onClick={openBankDialog}>
              <Plus className="h-3.5 w-3.5" /> Thêm tài khoản đầu tiên
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {banks.map((b) => (
              <div
                key={b.id}
                className={`rounded-lg border p-3 transition-colors ${
                  b.isDefault ? 'border-primary/50 bg-primary/5' : 'bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-bold">{b.bankCode}</p>
                  {b.isDefault && (
                    <Badge variant="success" className="ml-auto gap-1 text-[9px]">
                      <Star className="h-2.5 w-2.5" /> Mặc định
                    </Badge>
                  )}
                </div>
                <p className="mt-2 font-mono text-sm">{b.accountNumber}</p>
                <p className="truncate text-[11px] text-muted-foreground">{b.accountHolder}</p>
                <div className="mt-2 flex items-center justify-end gap-0.5 border-t pt-2">
                  {!b.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => handleSetDefault(b)}
                    >
                      <Check className="h-3 w-3" /> Đặt mặc định
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteBank(b)}
                    title="Xoá"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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

      <Dialog open={bankOpen} onOpenChange={setBankOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tài khoản nhận tiền</DialogTitle>
            <DialogDescription>
              Tiền payout sẽ được chuyển về tài khoản này. Cần chính xác — sai số TK có thể mất tiền.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bank">Ngân hàng</Label>
              <select
                id="bank"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Chọn ngân hàng —</option>
                {VN_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-number">Số tài khoản</Label>
              <Input
                id="acc-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="VD: 19038123456789"
                maxLength={20}
                inputMode="numeric"
              />
              <p className="text-[10px] text-muted-foreground">6 – 20 chữ số</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-holder">Chủ tài khoản</Label>
              <Input
                id="acc-holder"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                placeholder="VD: NGUYEN VAN A"
                maxLength={100}
              />
              <p className="text-[10px] text-muted-foreground">
                Viết IN HOA không dấu — đúng như trên thẻ
              </p>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBankOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleSaveBank} disabled={savingBank}>
              {savingBank ? 'Đang lưu...' : 'Lưu tài khoản'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Danh sách ngân hàng VN phổ biến — code VietQR / NAPAS
const VN_BANKS: { code: string; name: string }[] = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'VietinBank' },
  { code: 'MBB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'AGRIBANK', name: 'Agribank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'OCB', name: 'OCB' },
  { code: 'VIB', name: 'VIB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'MSB', name: 'MSB' },
];
