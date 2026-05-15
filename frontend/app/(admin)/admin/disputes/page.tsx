import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { formatVND } from '@/lib/format';

const DISPUTES = [
  {
    id: 'd1',
    code: '20260512',
    customer: 'Trần Minh',
    venue: 'Sân bóng đá Phú Mỹ Hưng',
    amount: 700_000,
    reason: 'Sân không sạch như mô tả, có nhiều vết nứt',
    raisedBy: 'CUSTOMER',
    daysOld: 1,
    status: 'OPEN' as const,
  },
  {
    id: 'd2',
    code: '20260498',
    customer: 'Lê Hà',
    venue: 'CLB cầu lông Vinhomes',
    amount: 240_000,
    reason: 'Yêu cầu hoàn 100% vì khách thông báo huỷ trước 36h nhưng owner không xử lý',
    raisedBy: 'CUSTOMER',
    daysOld: 3,
    status: 'AWAITING_OWNER' as const,
  },
  {
    id: 'd3',
    code: '20260450',
    customer: 'Đức Phạm',
    venue: 'Pickleball Saigon SC',
    amount: 360_000,
    reason: 'Customer đặt 2 sân nhầm, yêu cầu refund 1 booking',
    raisedBy: 'OWNER',
    daysOld: 5,
    status: 'RESOLVED' as const,
  },
];

export default function AdminDisputesPage() {
  const open = DISPUTES.filter((d) => d.status !== 'RESOLVED');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khiếu nại & hoàn tiền</h1>
        <p className="text-sm text-muted-foreground">
          {open.length} đang chờ xử lý · cần phản hồi trong 48h
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Đang mở', value: open.length, tone: 'destructive' as const },
          { label: 'Chờ owner', value: 1, tone: 'warning' as const },
          { label: 'Đã giải quyết tháng này', value: 12, tone: 'success' as const },
          { label: 'TB thời gian xử lý', value: '2.4 ngày', tone: 'muted' as const },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {DISPUTES.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                d.status === 'OPEN' ? 'bg-destructive/10 text-destructive'
                  : d.status === 'AWAITING_OWNER' ? 'bg-warning/15 text-amber-600'
                  : 'bg-success/10 text-success'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">Booking #{d.code}</p>
                  <Badge variant={d.raisedBy === 'CUSTOMER' ? 'default' : 'accent'}>
                    {d.raisedBy === 'CUSTOMER' ? 'Khách báo cáo' : 'Owner báo cáo'}
                  </Badge>
                  {d.status === 'OPEN' && <Badge variant="destructive">Đang mở</Badge>}
                  {d.status === 'AWAITING_OWNER' && <Badge variant="warning">Chờ owner</Badge>}
                  {d.status === 'RESOLVED' && <Badge variant="success">Đã giải quyết</Badge>}
                  <span className="text-xs text-muted-foreground">· {d.daysOld} ngày trước</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{d.customer[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="font-semibold">{d.customer}</span>
                    <span className="text-muted-foreground"> · {d.venue}</span>
                  </div>
                  <span className="ml-auto font-bold text-primary">{formatVND(d.amount)}</span>
                </div>

                <p className="mt-3 rounded-md bg-muted/50 p-3 text-sm">{d.reason}</p>

                {d.status !== 'RESOLVED' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-3 w-3" /> Liên hệ 2 bên
                    </Button>
                    <Button size="sm" variant="outline">
                      Yêu cầu thêm thông tin
                    </Button>
                    <Button size="sm" variant="destructive">
                      Hoàn tiền 100%
                    </Button>
                    <Button size="sm">Hoàn 50% & đóng</Button>
                    <Button size="sm" variant="ghost">
                      Bác bỏ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
