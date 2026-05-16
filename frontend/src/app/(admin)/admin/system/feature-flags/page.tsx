'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Flag } from 'lucide-react';
import { listFeatureFlags, updateFeatureFlag } from '@/lib/data/system';
import { isApiError } from '@/lib/api/errors';
import type { FeatureFlagDto } from '@/lib/api/endpoints/system';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    listFeatureFlags()
      .then(setFlags)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(flag: FeatureFlagDto) {
    const next = !flag.enabled;
    setTogglingKey(flag.key);
    // Optimistic
    setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: next } : f)));
    try {
      await updateFeatureFlag(flag.key, { enabled: next });
      toast.success(`Flag ${flag.key} → ${next ? 'ON' : 'OFF'}`);
    } catch (e) {
      // Revert
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: flag.enabled } : f)));
      toast.error(isApiError(e) ? e.message : 'Lỗi khi đổi flag');
    } finally {
      setTogglingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="destructive">
          <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Feature flags</h1>
        <p className="text-sm text-muted-foreground">
          Toggle tính năng on/off. Thay đổi áp dụng ngay sau khi reload, ghi vào audit log.
        </p>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : flags.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có flag nào</p>
        ) : (
          <ul className="divide-y">
            {flags.map((f) => (
              <li key={f.key} className="flex items-center gap-4 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Flag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">{f.key}</p>
                  {f.description && (
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Update: {new Date(f.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={f.enabled}
                    disabled={togglingKey === f.key}
                    onChange={() => handleToggle(f)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5 peer-disabled:opacity-50" />
                </label>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
