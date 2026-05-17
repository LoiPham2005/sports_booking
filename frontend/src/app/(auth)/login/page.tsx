'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi } from '@/lib/api/endpoints/auth';
import { homePathByRole } from '@/lib/api/adapters/user';
import { USE_MOCK } from '@/lib/api/config';
import { isApiError } from '@/lib/api/errors';
import { setMockUser } from '@/lib/data/auth';
import { notifyAuthChanged } from '@/lib/use-current-user';
import type { Role } from '@/lib/api/types';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function login(id: string, pwd: string) {
    setSubmitting(true);
    try {
      const result = await authApi.login({ identifier: id, password: pwd });
      // Cập nhật cache user (API mode — useCurrentUser sẽ refetch /me)
      notifyAuthChanged();
      toast.success(`Xin chào, ${result.user.fullName}`);
      router.replace(nextPath || homePathByRole(result.user.role));
      router.refresh();
    } catch (e) {
      const msg = isApiError(e) ? e.message : 'Đăng nhập thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Vui lòng nhập đủ thông tin');
      return;
    }
    if (USE_MOCK) {
      // Mock mode: chấp nhận mọi credential, tạo user generic CUSTOMER
      setMockUser({
        id: 'mock-customer',
        fullName: identifier.split('@')[0] || 'Customer',
        email: identifier.includes('@') ? identifier : undefined,
        phone: identifier.includes('@') ? undefined : identifier,
        role: 'CUSTOMER' as Role,
      });
      notifyAuthChanged();
      toast.success('Đã đăng nhập (mock)');
      router.replace(nextPath || '/');
      router.refresh();
      return;
    }
    await login(identifier, password);
  }

  function quickLogin(account: SeedAccount) {
    setIdentifier(account.email);
    setPassword(account.password);
    if (USE_MOCK) {
      // Mock mode — set user theo role chip + redirect
      setMockUser({
        id: `mock-${account.label.toLowerCase()}`,
        fullName: `Demo ${account.label}`,
        email: account.email,
        role: account.role,
      });
      notifyAuthChanged();
      toast.success(`Đã đăng nhập với role ${account.label}`);
      router.replace(account.path);
      return;
    }
    void login(account.email, account.password);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chào mừng trở lại! Đăng nhập để đặt sân và quản lý booking.
        </p>
      </div>

      <Button variant="outline" className="w-full" size="lg" disabled>
        <GoogleIcon /> Đăng nhập với Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">hoặc</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="id">Email hoặc số điện thoại</Label>
          <Input
            id="id"
            type="text"
            placeholder="ban@example.com hoặc 09xxxxxxxx"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pwd">Mật khẩu</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            id="pwd"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" defaultChecked />
          Ghi nhớ đăng nhập trên thiết bị này
        </label>
        <Button size="lg" className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>

      <DemoChips onPick={quickLogin} disabled={submitting} />
    </div>
  );
}

interface SeedAccount {
  email: string;
  password: string;
  label: string;
  icon: string;
  color: string;
  path: string;
  role: Role;
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    email: 'customer@gmail.com',
    password: '12345678',
    label: 'Customer',
    icon: '👤',
    color: 'text-primary hover:border-primary hover:bg-primary/5',
    path: '/',
    role: 'CUSTOMER',
  },
  {
    email: 'owner@gmail.com',
    password: '12345678',
    label: 'Owner',
    icon: '🏟️',
    color: 'text-accent hover:border-accent hover:bg-accent/5',
    path: '/owner',
    role: 'OWNER',
  },
  {
    email: 'staff@gmail.com',
    password: '12345678',
    label: 'Staff',
    icon: '🔧',
    color: 'text-orange-500 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20',
    path: '/staff',
    role: 'STAFF',
  },
  {
    email: 'manager@gmail.com',
    password: '12345678',
    label: 'Manager',
    icon: '👑',
    color: 'text-violet-500 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20',
    path: '/staff?role=manager',
    role: 'STAFF',
  },
  {
    email: 'admin@gmail.com',
    password: '12345678',
    label: 'Admin',
    icon: '⚡',
    color: 'text-purple-500 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20',
    path: '/admin',
    role: 'ADMIN',
  },

  {
    email: 'super@gmail.com',
    password: '12345678',
    label: 'Super Admin',
    icon: '⚡',
    color: 'text-purple-500 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20',
    path: '/admin',
    role: 'SUPER_ADMIN',
  },
];

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <LoginInner />
    </Suspense>
  );
}

/**
 * Demo chip switcher — click 1 phát login luôn bằng seed account.
 * - Mock mode: chỉ redirect (mock auth không cần credential)
 * - API mode: call POST /auth/login với credential thật từ `prisma/seed.ts`
 */
function DemoChips({ onPick, disabled }: { onPick: (a: SeedAccount) => void; disabled: boolean }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Demo
        </span>
        <span className="text-sm font-semibold">Đăng nhập nhanh theo role</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {USE_MOCK ? 'mock — chuyển trang' : 'gọi API thật'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {SEED_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => onPick(a)}
            disabled={disabled}
            className={`rounded-md border bg-background p-3 text-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${a.color}`}
          >
            <div className="text-xl">{a.icon}</div>
            <div className={`mt-1 text-xs font-bold ${a.color.split(' ')[0]}`}>{a.label}</div>
          </button>
        ))}
      </div>
      {!USE_MOCK && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Cần seed DB trước: <code className="rounded bg-muted px-1">npm run db:seed</code>
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
