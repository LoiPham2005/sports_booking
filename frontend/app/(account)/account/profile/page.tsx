import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cập nhật thông tin và ảnh đại diện</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">NM</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Button size="sm" variant="outline">
              Đổi ảnh
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG hoặc WEBP. Tối đa 5MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" defaultValue="Nguyễn Minh" />
          <Field label="Số điện thoại" defaultValue="+84 901 234 567" />
          <Field label="Email" type="email" defaultValue="minh@example.com" />
          <Field label="Ngày sinh" type="date" defaultValue="1995-08-15" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-semibold">Mật khẩu</p>
              <p className="text-xs text-muted-foreground">Cập nhật lần cuối 2 tuần trước</p>
            </div>
            <Button size="sm" variant="outline">
              Đổi mật khẩu
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-semibold">Xác thực 2 lớp</p>
              <p className="text-xs text-muted-foreground">Bảo vệ tài khoản qua OTP SMS</p>
            </div>
            <Button size="sm" variant="outline">
              Bật
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Huỷ</Button>
        <Button>Lưu thay đổi</Button>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}
