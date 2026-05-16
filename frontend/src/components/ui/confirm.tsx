'use client';

import * as React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmTone = 'default' | 'destructive' | 'warning' | 'info';

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  /** Hiện input yêu cầu user gõ đúng chữ để xác nhận (cho action nguy hiểm). */
  requireText?: string;
}

interface InternalState extends ConfirmOptions {
  open: boolean;
  resolve?: (ok: boolean) => void;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * Dùng để gọi confirm từ bất kỳ component nào.
 *
 * @example
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: 'Xoá user?', tone: 'destructive' });
 *   if (!ok) return;
 */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

const TONE_CONFIG: Record<ConfirmTone, { icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; btnVariant: 'default' | 'destructive' | 'accent' }> = {
  default: { icon: Info, iconBg: 'bg-primary/10', iconColor: 'text-primary', btnVariant: 'default' },
  destructive: { icon: AlertTriangle, iconBg: 'bg-destructive/10', iconColor: 'text-destructive', btnVariant: 'destructive' },
  warning: { icon: ShieldAlert, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600', btnVariant: 'accent' },
  info: { icon: Info, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600', btnVariant: 'default' },
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<InternalState>({
    open: false,
    title: '',
  });
  const [typed, setTyped] = React.useState('');

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      setTyped('');
      setState({ ...opts, open: true, resolve });
    });
  }, []);

  function close(result: boolean) {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  }

  const tone = state.tone ?? 'default';
  const cfg = TONE_CONFIG[tone];
  const Icon = cfg.icon;

  const requireText = state.requireText?.trim();
  const requireOK = !requireText || typed.trim() === requireText;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(o) => {
          if (!o) close(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', cfg.iconBg)}>
                <Icon className={cn('h-5 w-5', cfg.iconColor)} />
              </div>
              <div className="flex-1 pt-0.5">
                <DialogTitle>{state.title}</DialogTitle>
                {state.description && (
                  <DialogDescription className="mt-1.5">{state.description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          {requireText && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Để xác nhận, gõ <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">{requireText}</code> bên dưới:
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => close(false)}>
              {state.cancelText ?? 'Huỷ'}
            </Button>
            <Button variant={cfg.btnVariant} onClick={() => close(true)} disabled={!requireOK}>
              {state.confirmText ?? 'Xác nhận'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
