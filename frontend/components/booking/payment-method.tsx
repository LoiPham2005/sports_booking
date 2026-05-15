'use client';

import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';

export type PaymentMethodKey = 'vnpay' | 'momo' | 'zalopay';

const METHODS: {
  key: PaymentMethodKey;
  name: string;
  desc: string;
  badge?: string;
  brandClass: string;
  letter: string;
}[] = [
  {
    key: 'vnpay',
    name: 'VNPay',
    desc: 'Thẻ ATM nội địa / Internet Banking / QR Pay',
    badge: 'Phổ biến',
    brandClass: 'from-blue-500 to-blue-700',
    letter: 'V',
  },
  {
    key: 'momo',
    name: 'Ví MoMo',
    desc: 'Quét QR hoặc đăng nhập ví MoMo. Có hoàn tiền lên tới 5%.',
    badge: 'Khuyến mãi',
    brandClass: 'from-pink-500 to-pink-700',
    letter: 'M',
  },
  {
    key: 'zalopay',
    name: 'ZaloPay',
    desc: 'Thanh toán nhanh qua Zalo. Liên kết thẻ một lần.',
    brandClass: 'from-sky-500 to-sky-700',
    letter: 'Z',
  },
];

interface Props {
  value: PaymentMethodKey;
  onChange: (k: PaymentMethodKey) => void;
}

export function PaymentMethodPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {METHODS.map((m) => {
        const active = value === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            className={cn(
              'group flex w-full items-center gap-4 rounded-xl border-2 bg-card p-4 text-left transition-all',
              active
                ? 'border-primary shadow-sm ring-1 ring-primary'
                : 'border-border hover:border-primary/40',
            )}
          >
            <div
              className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-lg font-bold text-white shadow',
                m.brandClass,
              )}
            >
              {m.letter}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{m.name}</span>
                {m.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    <Sparkles className="h-3 w-3" />
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
            <div
              className={cn(
                'grid h-6 w-6 place-items-center rounded-full border-2',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
              )}
            >
              {active && <Check className="h-3.5 w-3.5" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
