import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Server, AlertTriangle } from 'lucide-react';

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <Badge variant="destructive">
              <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-sm text-muted-foreground">Cấu hình áp dụng cho toàn nền tảng</p>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Mọi thay đổi ở đây ảnh hưởng tới <span className="font-bold">toàn bộ</span> user và owner.
            Mỗi thay đổi sẽ được ghi vào Audit log.
          </p>
        </div>
      </Card>

      {/* Commission */}
      <Card className="p-6">
        <h3 className="font-bold">Hoa hồng nền tảng</h3>
        <p className="text-sm text-muted-foreground">
          Phần trăm platform giữ lại từ mỗi booking thành công
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Mặc định (%)</Label>
            <Input type="number" defaultValue="10" />
          </div>
          <div className="space-y-1.5">
            <Label>Tối thiểu cho owner mới (%)</Label>
            <Input type="number" defaultValue="12" />
          </div>
          <div className="space-y-1.5">
            <Label>VAT (%)</Label>
            <Input type="number" defaultValue="10" />
          </div>
        </div>
      </Card>

      {/* Cancel policy */}
      <Card className="p-6">
        <h3 className="font-bold">Chính sách huỷ mặc định</h3>
        <p className="text-sm text-muted-foreground">Owner có thể override trong Settings của họ</p>
        <div className="mt-4 space-y-3">
          {[
            { label: '≥ 24h trước giờ chơi', defaultPct: 100 },
            { label: '12h – 24h trước giờ chơi', defaultPct: 50 },
            { label: '< 12h trước giờ chơi', defaultPct: 0 },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="flex-1 text-sm">{r.label}</span>
              <Input type="number" defaultValue={r.defaultPct} className="w-24" />
              <span className="text-sm text-muted-foreground">% hoàn</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Payout schedule */}
      <Card className="p-6">
        <h3 className="font-bold">Lịch chuyển khoản (payout)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Chu kỳ</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option>Hàng tuần (T2 02:00)</option>
              <option>Hàng tháng (ngày 1)</option>
              <option>2 tuần / lần</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Mức tối thiểu (₫)</Label>
            <Input type="number" defaultValue="100000" />
          </div>
        </div>
      </Card>

      {/* Booking */}
      <Card className="p-6">
        <h3 className="font-bold">Booking</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Hold slot (phút)</Label>
            <Input type="number" defaultValue="10" />
          </div>
          <div className="space-y-1.5">
            <Label>Timeout thanh toán (phút)</Label>
            <Input type="number" defaultValue="15" />
          </div>
        </div>
      </Card>

      {/* Payment providers */}
      <Card className="p-6">
        <h3 className="font-bold inline-flex items-center gap-2">
          <Server className="h-4 w-4" /> Trạng thái cổng thanh toán
        </h3>
        <div className="mt-4 space-y-2">
          {[
            { name: 'VNPay', enabled: true, healthy: true },
            { name: 'MoMo', enabled: true, healthy: true },
            { name: 'ZaloPay', enabled: true, healthy: false },
            { name: 'Stripe', enabled: false, healthy: true },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-md border p-3">
              <span className="flex-1 font-semibold">{p.name}</span>
              {p.healthy ? (
                <Badge variant="success">Healthy</Badge>
              ) : (
                <Badge variant="warning">Lỗi kết nối</Badge>
              )}
              <input type="checkbox" defaultChecked={p.enabled} className="h-5 w-9 accent-primary" />
            </div>
          ))}
        </div>
      </Card>

      {/* Notification templates */}
      <Card className="p-6">
        <h3 className="font-bold">Template email/SMS</h3>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Email subject — Booking confirmed</Label>
            <Input defaultValue="✅ Booking #{code} đã được xác nhận" />
          </div>
          <div className="space-y-1.5">
            <Label>SMS — Nhắc trước 2h</Label>
            <Textarea defaultValue="SportsBooking: Bạn có lịch chơi tại {venue} lúc {time}. Đừng quên nhé!" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Huỷ</Button>
        <Button>Lưu thay đổi</Button>
      </div>
    </div>
  );
}
