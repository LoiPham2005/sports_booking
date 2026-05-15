import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell, Tag, Calendar, Star, CreditCard } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'payment_success',
    title: 'Thanh toán thành công',
    body: 'Booking #20260547 đã được xác nhận. Hẹn gặp bạn tại sân!',
    ago: '2 giờ trước',
    read: false,
  },
  {
    id: 'n2',
    type: 'promo',
    title: 'Khuyến mãi cuối tuần',
    body: 'Giảm 20% sân cầu lông T7–CN. Dùng mã SPORT20.',
    ago: '6 giờ trước',
    read: false,
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Nhắc lịch chơi',
    body: 'Bạn có booking lúc 18:00 hôm nay tại Pickleball Saigon SC.',
    ago: '1 ngày trước',
    read: true,
  },
  {
    id: 'n4',
    type: 'review',
    title: 'Đánh giá trận đấu',
    body: 'Hãy cho chúng tôi biết trải nghiệm tại Sân tennis Lan Anh',
    ago: '3 ngày trước',
    read: true,
  },
  {
    id: 'n5',
    type: 'payment_success',
    title: 'Hoàn tiền thành công',
    body: 'Đã hoàn 240.000₫ cho booking #20260453 về ví VNPay.',
    ago: '5 ngày trước',
    read: true,
  },
];

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  payment_success: { icon: CreditCard, color: 'text-success bg-success/10' },
  promo: { icon: Tag, color: 'text-accent bg-accent/10' },
  reminder: { icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
  review: { icon: Star, color: 'text-amber-500 bg-amber-500/10' },
};

export default function NotificationsPage() {
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thông báo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4" /> Đánh dấu đọc hết
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {NOTIFICATIONS.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-semibold">Chưa có thông báo</p>
            <p className="text-sm text-muted-foreground">Bạn sẽ thấy thông báo ở đây khi có hoạt động mới</p>
          </div>
        ) : (
          <ul>
            {NOTIFICATIONS.map((n) => {
              const meta = ICONS[n.type] ?? { icon: Bell, color: 'text-muted-foreground bg-muted' };
              const Icon = meta.icon;
              return (
                <li
                  key={n.id}
                  className={`flex gap-4 border-b p-4 last:border-0 hover:bg-muted/30 ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm ${n.read ? 'font-semibold' : 'font-bold'}`}>
                        {n.title}
                      </p>
                      <span className="text-xs text-muted-foreground">· {n.ago}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
