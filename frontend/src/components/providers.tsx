'use client';

import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/components/ui/confirm';

/**
 * Tập hợp các provider client-side: Confirm dialog, Toaster, v.v.
 * Mount 1 lần ở root layout để dùng trong toàn app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ConfirmProvider>
  );
}
