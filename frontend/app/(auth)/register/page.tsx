import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đăng ký tài khoản</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ 30 giây để bắt đầu đặt sân và nhận ưu đãi mới nhất.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ban@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" placeholder="09xxxxxxxx" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pwd">Mật khẩu</Label>
          <Input id="pwd" type="password" placeholder="Ít nhất 8 ký tự" />
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input accent-primary" />
          <span>
            Tôi đồng ý với{' '}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>
            .
          </span>
        </label>
        <Button size="lg" className="w-full">
          Tạo tài khoản
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
