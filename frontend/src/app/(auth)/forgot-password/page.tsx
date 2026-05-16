'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi } from '@/lib/api/endpoints/auth';
import { isApiError } from '@/lib/api/errors';

type Step = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return toast.error('Vui lòng nhập email hoặc số điện thoại');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(identifier.trim());
      toast.success('Đã gửi mã OTP. Kiểm tra email/SMS của bạn');
      setStep('reset');
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Gửi OTP thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return toast.error('Nhập mã OTP');
    if (newPassword.length < 8) return toast.error('Mật khẩu mới cần ít nhất 8 ký tự');
    setSubmitting(true);
    try {
      await authApi.resetPassword({ identifier, code, newPassword });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại');
      router.replace('/login');
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Đặt lại mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

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
          {step === 'request'
            ? 'Nhập email hoặc số điện thoại đăng ký, chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.'
            : `Mã OTP đã được gửi tới ${identifier}. Hết hạn sau 30 phút.`}
        </p>
      </div>

      {step === 'request' ? (
        <form className="space-y-4" onSubmit={handleRequest}>
          <div className="space-y-1.5">
            <Label htmlFor="id">Email hoặc số điện thoại</Label>
            <Input
              id="id"
              placeholder="ban@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </div>
          <Button size="lg" className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi mã OTP'}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleReset}>
          <div className="space-y-1.5">
            <Label htmlFor="code">Mã OTP</Label>
            <Input
              id="code"
              inputMode="numeric"
              placeholder="6 chữ số"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newpwd">Mật khẩu mới</Label>
            <Input
              id="newpwd"
              type="password"
              placeholder="Ít nhất 8 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep('request')}
              disabled={submitting}
            >
              Gửi lại OTP
            </Button>
            <Button className="flex-[2]" type="submit" disabled={submitting}>
              {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
