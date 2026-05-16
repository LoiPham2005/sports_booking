'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Download } from 'lucide-react';
import { listAuditLog } from '@/lib/data/admin';
import type { AuditLogDto } from '@/lib/api/endpoints/admin';

const ACTION_TONE: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
  VENUE_APPROVE: 'success',
  VENUE_REJECT: 'destructive',
  VENUE_SUSPEND: 'destructive',
  USER_UPDATE: 'warning',
  REFUND_RESOLVE: 'warning',
};

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(() => {
      listAuditLog({ action: actionFilter || undefined })
        .then((list) => !cancelled && setEvents(list))
        .catch(() => !cancelled && setEvents([]))
        .finally(() => !cancelled && setLoading(false));
    }, actionFilter ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? '...' : `${events.length} action gần đây`}
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Lọc theo action (VD: VENUE_APPROVE, USER_UPDATE)..."
              className="pl-9 font-mono text-xs"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Chưa có log nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Thời gian</th>
                <th className="px-4 py-3 text-left font-medium">Actor</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Resource</th>
                <th className="px-4 py-3 text-left font-medium">Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {e.actor?.fullName?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {e.actor?.fullName ?? 'System'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {e.actorRole ?? ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={(ACTION_TONE[e.action] ?? 'default') as never} className="font-mono text-xs">
                      {e.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {e.resourceType}/{e.resourceId?.slice(0, 8) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {e.beforeJson && e.afterJson ? (
                      <details>
                        <summary className="cursor-pointer text-primary">Xem diff</summary>
                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">
                          {JSON.stringify({ before: e.beforeJson, after: e.afterJson }, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
