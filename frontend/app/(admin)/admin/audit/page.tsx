import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Download } from 'lucide-react';

const EVENTS = [
  {
    id: 'a1',
    time: '2026-05-15 14:32:18',
    actor: 'Admin System',
    actorRole: 'SUPER_ADMIN',
    action: 'venue.approve',
    resource: 'venue/v18',
    details: 'Approved venue "Sân pickleball Saigon Centre"',
    severity: 'info',
  },
  {
    id: 'a2',
    time: '2026-05-15 14:18:42',
    actor: 'Owner Demo',
    actorRole: 'OWNER',
    action: 'booking.cancel',
    resource: 'booking/b78',
    details: 'Cancelled booking, refund 100% (480.000₫)',
    severity: 'warning',
  },
  {
    id: 'a3',
    time: '2026-05-15 13:45:11',
    actor: 'Admin System',
    actorRole: 'SUPER_ADMIN',
    action: 'user.role_change',
    resource: 'user/u24',
    details: 'Role changed CUSTOMER → OWNER (approved owner application)',
    severity: 'critical',
  },
  {
    id: 'a4',
    time: '2026-05-15 12:02:55',
    actor: 'Admin System',
    actorRole: 'ADMIN',
    action: 'refund.manual',
    resource: 'payment/p55',
    details: 'Manual refund 350.000₫ (dispute #d2 resolved)',
    severity: 'critical',
  },
  {
    id: 'a5',
    time: '2026-05-15 10:15:03',
    actor: 'Trần Minh',
    actorRole: 'CUSTOMER',
    action: 'booking.create',
    resource: 'booking/b80',
    details: 'New booking 700.000₫ via VNPay',
    severity: 'info',
  },
  {
    id: 'a6',
    time: '2026-05-14 22:40:19',
    actor: 'System Cron',
    actorRole: 'ADMIN',
    action: 'booking.timeout_cancel',
    resource: '12 bookings',
    details: 'Auto-cancelled 12 bookings PENDING_PAYMENT > 15min',
    severity: 'info',
  },
];

const SEVERITY: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' | 'muted' }> = {
  info: { label: 'INFO', variant: 'muted' },
  warning: { label: 'WARN', variant: 'warning' },
  critical: { label: 'CRITICAL', variant: 'destructive' },
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">Mọi action nhạy cảm trên hệ thống</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Action, actor, resource..." className="pl-9" />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm">
            <option>Mọi severity</option>
            <option>CRITICAL</option>
            <option>WARN</option>
            <option>INFO</option>
          </select>
          <Input type="date" className="w-44" />
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Resource</th>
              <th className="px-4 py-3 text-left font-medium">Details</th>
              <th className="px-4 py-3 text-center font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => {
              const sev = SEVERITY[e.severity];
              return (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{e.time}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{e.actor[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">{e.actor}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{e.actorRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.resource}</td>
                  <td className="px-4 py-3 text-sm">{e.details}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={sev.variant}>{sev.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
