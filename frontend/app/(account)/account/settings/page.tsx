import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Moon,
  Bell,
  Lock,
  ShieldCheck,
  Smartphone,
  Mail,
  Trash2,
} from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ngôn ngữ, giao diện, thông báo, bảo mật
        </p>
      </div>

      {/* Giao diện */}
      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row
            icon={<Globe className="h-4 w-4" />}
            iconColor="bg-blue-500/10 text-blue-500"
            title="Ngôn ngữ"
            description="Hiển thị giao diện theo ngôn ngữ này"
          >
            <select className="h-9 rounded-md border bg-background px-3 text-sm">
              <option>🇻🇳 Tiếng Việt</option>
              <option>🇺🇸 English</option>
            </select>
          </Row>
          <Row
            icon={<Moon className="h-4 w-4" />}
            iconColor="bg-violet-500/10 text-violet-500"
            title="Chế độ tối"
            description="Theo hệ thống / Sáng / Tối"
          >
            <select className="h-9 rounded-md border bg-background px-3 text-sm">
              <option>Theo hệ thống</option>
              <option>Sáng</option>
              <option>Tối</option>
            </select>
          </Row>
        </CardContent>
      </Card>

      {/* Thông báo */}
      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <ToggleRow
            icon={<Bell className="h-4 w-4" />}
            iconColor="bg-success/10 text-success"
            title="Nhắc lịch chơi"
            description="Push thông báo trước 2 giờ"
            defaultOn
          />
          <ToggleRow
            icon={<Bell className="h-4 w-4" />}
            iconColor="bg-accent/10 text-accent"
            title="Khuyến mãi & ưu đãi"
            description="Voucher, sự kiện mới"
          />
          <ToggleRow
            icon={<Mail className="h-4 w-4" />}
            iconColor="bg-blue-500/10 text-blue-500"
            title="Email hoá đơn"
            description="Gửi PDF sau mỗi giao dịch"
            defaultOn
          />
          <ToggleRow
            icon={<Smartphone className="h-4 w-4" />}
            iconColor="bg-pink-500/10 text-pink-500"
            title="SMS xác nhận booking"
            description="SMS khi booking được confirm"
          />
        </CardContent>
      </Card>

      {/* Bảo mật */}
      <Card>
        <CardHeader>
          <CardTitle>Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row
            icon={<Lock className="h-4 w-4" />}
            iconColor="bg-amber-500/10 text-amber-500"
            title="Mật khẩu"
            description="Cập nhật 2 tuần trước"
          >
            <Button size="sm" variant="outline">
              Đổi mật khẩu
            </Button>
          </Row>
          <Row
            icon={<ShieldCheck className="h-4 w-4" />}
            iconColor="bg-success/10 text-success"
            title="Xác thực 2 lớp"
            description="Bảo vệ tài khoản qua OTP SMS"
          >
            <Button size="sm" variant="outline">
              Bật
            </Button>
          </Row>
          <Row
            icon={<Smartphone className="h-4 w-4" />}
            iconColor="bg-muted-foreground/10 text-muted-foreground"
            title="Thiết bị đăng nhập"
            description="3 thiết bị đang hoạt động"
          >
            <Button size="sm" variant="outline">
              Xem
            </Button>
          </Row>
        </CardContent>
      </Card>

      {/* Khác */}
      <Card>
        <CardHeader>
          <CardTitle>Khác</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <Row
            icon={<span className="text-base">📄</span>}
            iconColor="bg-muted text-muted-foreground"
            title="Chính sách bảo mật"
            description="Cập nhật lần cuối 12/03/2025"
          >
            <Button size="sm" variant="ghost">
              Xem
            </Button>
          </Row>
          <Row
            icon={<span className="text-base">📋</span>}
            iconColor="bg-muted text-muted-foreground"
            title="Điều khoản sử dụng"
            description="Cập nhật lần cuối 12/03/2025"
          >
            <Button size="sm" variant="ghost">
              Xem
            </Button>
          </Row>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Khu vực nguy hiểm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Xoá tài khoản</p>
                <p className="text-xs text-muted-foreground">
                  Toàn bộ dữ liệu sẽ bị xoá vĩnh viễn sau 30 ngày. Booking đang
                  hoạt động sẽ được hoàn tiền theo chính sách.
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Xoá
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  icon,
  iconColor,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  iconColor,
  title,
  description,
  defaultOn,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  defaultOn?: boolean;
}) {
  return (
    <Row icon={icon} iconColor={iconColor} title={title} description={description}>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          defaultChecked={defaultOn}
          className="peer h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition-colors checked:bg-primary"
        />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </label>
    </Row>
  );
}
