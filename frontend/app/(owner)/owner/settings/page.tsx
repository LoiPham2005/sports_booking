import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield } from 'lucide-react';

export default function OwnerSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">Cấu hình venue, chính sách huỷ, thông báo</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Chính sách huỷ</h3>
            <p className="text-sm text-muted-foreground">Override mặc định của nền tảng</p>
          </div>
        </div>
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

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold">Thông báo</h3>
            <p className="text-sm text-muted-foreground">Khi nào bạn muốn nhận thông báo</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Booking mới', desc: 'Push + email khi có booking mới', enabled: true },
            { label: 'Booking bị huỷ', desc: 'Push khi khách huỷ trước 24h', enabled: true },
            { label: 'Khách check-in', desc: 'Push khi staff check-in khách', enabled: false },
            { label: 'Đánh giá mới', desc: 'Push + email khi có đánh giá mới', enabled: true },
            { label: 'Báo cáo hàng ngày', desc: 'Email 06:00 mỗi sáng', enabled: true },
          ].map((n) => (
            <label
              key={n.label}
              className="flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3 hover:bg-muted/30"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={n.enabled} className="mt-1 h-5 w-9 accent-primary" />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold">Thông tin doanh nghiệp (cho hoá đơn)</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tên công ty / chủ sở hữu</Label>
            <Input defaultValue="Công ty TNHH Sân Phú Mỹ Hưng" />
          </div>
          <div className="space-y-1.5">
            <Label>Mã số thuế</Label>
            <Input defaultValue="0123456789" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Địa chỉ hoá đơn</Label>
            <Textarea defaultValue="123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. HCM" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Hoa hồng platform</h3>
            <p className="text-sm text-muted-foreground">Áp dụng cho mọi booking thành công</p>
          </div>
          <Badge variant="muted">Hệ thống quản lý</Badge>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="rounded-md bg-muted px-4 py-2">
            <p className="text-xs text-muted-foreground">Hiện tại</p>
            <p className="text-xl font-bold">10%</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Tỉ lệ này cố định bởi admin nền tảng. Liên hệ tổng đài nếu cần thương lượng.
          </p>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Huỷ</Button>
        <Button>Lưu thay đổi</Button>
      </div>
    </div>
  );
}
