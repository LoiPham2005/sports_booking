'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell, Tag, Calendar, Star, CreditCard } from 'lucide-react';
import { listNotifications, markNotificationRead } from '@/lib/data/users';
import type { UiNotification } from '@/lib/api/endpoints/notifications';

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  payment_success: { icon: CreditCard, color: 'text-success bg-success/10' },
  payment_failed: { icon: CreditCard, color: 'text-destructive bg-destructive/10' },
  promo: { icon: Tag, color: 'text-accent bg-accent/10' },
  reminder: { icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
  review: { icon: Star, color: 'text-amber-500 bg-amber-500/10' },
};

function formatAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function NotificationsPage() {
  const [items, setItems] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listNotifications()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkOne(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      // optimistic — silently keep
    }
  }

  async function handleMarkAll() {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    setMarking(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    } finally {
      setMarking(false);
    }
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thông báo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? 'Đang tải...'
              : unread > 0
                ? `${unread} thông báo chưa đọc`
                : 'Tất cả đã đọc'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={marking}>
            <CheckCheck className="h-4 w-4" /> {marking ? 'Đang đánh dấu...' : 'Đánh dấu đọc hết'}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-3 h-16 animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-semibold">Chưa có thông báo</p>
            <p className="text-sm text-muted-foreground">
              Bạn sẽ thấy thông báo ở đây khi có hoạt động mới
            </p>
          </div>
        ) : (
          <ul>
            {items.map((n) => {
              const meta = ICONS[n.type] ?? { icon: Bell, color: 'text-muted-foreground bg-muted' };
              const Icon = meta.icon;
              return (
                <li
                  key={n.id}
                  className={`flex cursor-pointer gap-4 border-b p-4 transition-colors last:border-0 hover:bg-muted/30 ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !n.read && handleMarkOne(n.id)}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${meta.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm ${n.read ? 'font-semibold' : 'font-bold'}`}>
                        {n.title}
                      </p>
                      <span className="text-xs text-muted-foreground">· {formatAgo(n.time)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
