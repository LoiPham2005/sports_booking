'use client';

import * as React from 'react';
import { MessageSquareText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface PromptOptions {
  title: string;
  description?: React.ReactNode;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  /** Nếu true, input không được rỗng. Mặc định false (cho phép bỏ trống). */
  required?: boolean;
  /** Hiện textarea nhiều dòng thay vì input 1 dòng. */
  multiline?: boolean;
  maxLength?: number;
}

interface InternalState extends PromptOptions {
  open: boolean;
  resolve?: (value: string | null) => void;
}

type PromptFn = (opts: PromptOptions) => Promise<string | null>;

const PromptContext = React.createContext<PromptFn | null>(null);

/**
 * Custom prompt dialog dùng chung toàn app — thay thế `window.prompt()`.
 *
 * Trả về:
 * - `string` — user nhấn xác nhận (có thể là chuỗi rỗng nếu `required=false`)
 * - `null` — user huỷ / đóng dialog
 *
 * @example
 *   const prompt = usePrompt();
 *   const note = await prompt({ title: 'Ghi chú duyệt refund', multiline: true });
 *   if (note === null) return;
 */
export function usePrompt(): PromptFn {
  const ctx = React.useContext(PromptContext);
  if (!ctx) throw new Error('usePrompt must be used inside <PromptProvider>');
  return ctx;
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<InternalState>({ open: false, title: '' });
  const [value, setValue] = React.useState('');

  const prompt = React.useCallback<PromptFn>((opts) => {
    return new Promise<string | null>((resolve) => {
      setValue(opts.defaultValue ?? '');
      setState({ ...opts, open: true, resolve });
    });
  }, []);

  function close(result: string | null) {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  }

  const canConfirm = !state.required || value.trim().length > 0;

  return (
    <PromptContext.Provider value={prompt}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(o) => {
          if (!o) close(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 pt-0.5">
                <DialogTitle>{state.title}</DialogTitle>
                {state.description && (
                  <DialogDescription className="mt-1.5">{state.description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-1.5">
            {state.multiline ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={state.placeholder}
                maxLength={state.maxLength}
                autoFocus
                rows={4}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={state.placeholder}
                maxLength={state.maxLength}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canConfirm) close(value);
                }}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {state.maxLength && (
              <p className="text-right text-[10px] text-muted-foreground">
                {value.length}/{state.maxLength}
              </p>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => close(null)}>
              {state.cancelText ?? 'Huỷ'}
            </Button>
            <Button onClick={() => close(value)} disabled={!canConfirm}>
              {state.confirmText ?? 'Xác nhận'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PromptContext.Provider>
  );
}
