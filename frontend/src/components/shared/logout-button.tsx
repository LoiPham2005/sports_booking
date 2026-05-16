'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm';
import { logout } from '@/lib/data/auth';
import { notifyAuthChanged } from '@/lib/use-current-user';
import { isApiError } from '@/lib/api/errors';

interface Props {
  /** Variant của Button — mặc định 'outline' giống admin */
  variant?: 'outline' | 'ghost' | 'default';
  /** Size — mặc định 'sm' */
  size?: 'sm' | 'icon' | 'default';
  /** Class extra */
  className?: string;
  /** Ẩn label text trên mobile (chỉ icon) */
  iconOnlyOnMobile?: boolean;
}

/**
 * Nút Đăng xuất chuẩn cho mọi portal (Admin/Owner/Staff).
 * - Confirm trước khi logout
 * - Gọi `logout()` data layer (mock-aware: skip API call khi USE_MOCK)
 * - Redirect /login + toast
 */
export function LogoutButton({
  variant = 'outline',
  size = 'sm',
  className,
  iconOnlyOnMobile = false,
}: Props) {
  const router = useRouter();
  const confirm = useConfirm();

  async function handle() {
    const ok = await confirm({
      title: 'Đăng xuất khỏi tài khoản?',
      description: 'Bạn sẽ cần đăng nhập lại để truy cập trang.',
      confirmText: 'Đăng xuất',
      cancelText: 'Ở lại',
      tone: 'warning',
    });
    if (!ok) return;
    try {
      await logout();
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Đăng xuất thất bại');
      return;
    }
    notifyAuthChanged();
    toast.success('Đã đăng xuất');
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button variant={variant} size={size} onClick={handle} className={className}>
      <LogOut className="h-3.5 w-3.5" />
      <span className={iconOnlyOnMobile ? 'hidden sm:inline' : ''}>Đăng xuất</span>
    </Button>
  );
}
