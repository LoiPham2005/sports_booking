import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập email hoặc số điện thoại đăng ký, chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.
        </p>
      </div>
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email hoặc số điện thoại</Label>
          <Input placeholder="ban@example.com" />
        </div>
        <Button size="lg" className="w-full">
          Gửi mã OTP
        </Button>
      </form>
    </div>
  );
}
