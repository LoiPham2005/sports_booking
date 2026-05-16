'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi } from '@/lib/api/endpoints/auth';
import { homePathByRole } from '@/lib/api/adapters/user';
import { isApiError } from '@/lib/api/errors';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('Vui lòng nhập họ tên');
    if (!email && !phone) return toast.error('Cần email hoặc số điện thoại');
    if (password.length < 8) return toast.error('Mật khẩu cần ít nhất 8 ký tự');
    if (!agreed) return toast.error('Vui lòng đồng ý điều khoản sử dụng');

    setSubmitting(true);
    try {
      const result = await authApi.register({
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        password,
      });
      toast.success(`Tạo tài khoản thành công! Chào mừng ${result.user.fullName}`);
      router.replace(homePathByRole(result.user.role));
      router.refresh();
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Đăng ký thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đăng ký tài khoản</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ 30 giây để bắt đầu đặt sân và nhận ưu đãi mới nhất.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pwd">Mật khẩu</Label>
          <Input
            id="pwd"
            type="password"
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
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
        <Button size="lg" className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
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
