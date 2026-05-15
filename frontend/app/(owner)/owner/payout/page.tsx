import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit2, Download } from 'lucide-react';
import { formatVND } from '@/lib/format';

const HISTORY = [
  { date: '2026-05-13', amount: 18_450_000, status: 'PAID', ref: 'PO-2026-0019' },
  { date: '2026-05-06', amount: 22_300_000, status: 'PAID', ref: 'PO-2026-0018' },
  { date: '2026-04-29', amount: 19_800_000, status: 'PAID', ref: 'PO-2026-0017' },
  { date: '2026-04-22', amount: 21_100_000, status: 'PAID', ref: 'PO-2026-0016' },
  { date: '2026-04-15', amount: 17_600_000, status: 'PAID', ref: 'PO-2026-0015' },
];

export default function OwnerPayoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhận tiền</h1>
        <p className="text-sm text-muted-foreground">Số dư chờ + tài khoản ngân hàng + lịch sử chuyển</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending balance */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 p-6 text-primary-foreground">
            <p className="text-xs uppercase tracking-wide opacity-80">Số dư chờ thanh toán</p>
            <p className="mt-1 text-4xl font-bold">{formatVND(18_450_000)}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">Tự động chuyển thứ 2 hàng tuần</span>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-t">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Booking</p>
              <p className="mt-1 text-xl font-bold">62</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Hoa hồng (10%)</p>
              <p className="mt-1 text-xl font-bold text-destructive">−{formatVND(2_050_000)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Net</p>
              <p className="mt-1 text-xl font-bold text-success">{formatVND(18_450_000)}</p>
            </div>
          </div>
        </Card>

        {/* Bank account */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-500/10">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tài khoản nhận</p>
              <p className="font-bold">Vietcombank</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Số TK" value="0123 4567 8901 2345" mono />
            <Row label="Chủ TK" value="NGUYEN VAN A" />
            <Row label="Chi nhánh" value="HCM - Phú Mỹ Hưng" />
          </div>
          <Button variant="outline" className="mt-4 w-full" size="sm">
            <Edit2 className="h-3 w-3" /> Cập nhật
          </Button>
        </Card>
      </div>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-bold">Lịch sử chuyển khoản</h3>
            <p className="text-xs text-muted-foreground">5 đợt gần nhất</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3" /> Tải báo cáo
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-y bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Reference</th>
              <th className="px-6 py-3 text-left font-medium">Ngày</th>
              <th className="px-6 py-3 text-left font-medium">Tài khoản</th>
              <th className="px-6 py-3 text-right font-medium">Số tiền</th>
              <th className="px-6 py-3 text-center font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h) => (
              <tr key={h.ref} className="border-b last:border-0">
                <td className="px-6 py-4 font-mono text-xs">{h.ref}</td>
                <td className="px-6 py-4">{h.date}</td>
                <td className="px-6 py-4 text-muted-foreground">Vietcombank · ...2345</td>
                <td className="px-6 py-4 text-right font-semibold">{formatVND(h.amount)}</td>
                <td className="px-6 py-4 text-center">
                  <Badge variant="success">Đã chuyển</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
