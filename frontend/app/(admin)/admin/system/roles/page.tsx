import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Shield, ChevronDown, Plus } from 'lucide-react';

const ADMINS = [
  { name: 'Admin System', email: 'admin@sportsbooking.local', role: 'SUPER_ADMIN', addedBy: '—', addedAt: '2024-12-01' },
  { name: 'Phạm Quốc Anh', email: 'anh@sportsbooking.local', role: 'ADMIN', addedBy: 'Admin System', addedAt: '2025-03-04' },
  { name: 'Lê Thị Mai', email: 'mai@sportsbooking.local', role: 'ADMIN', addedBy: 'Admin System', addedAt: '2025-09-18' },
];

const PERMISSIONS_BY_ROLE = {
  ADMIN: [
    'Xem dashboard tổng',
    'Duyệt venue',
    'Quản lý user (suspend/restore)',
    'Xử lý disputes',
    'Quản lý vouchers',
    'Xem audit log',
  ],
  SUPER_ADMIN: [
    'Tất cả quyền của ADMIN',
    'Cài đặt hệ thống (commission, payout, ...)',
    'Quản lý role admin',
    'Bật/tắt feature flags',
    'Truy cập database trực tiếp',
  ],
};

export default function SystemRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="destructive">
            <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Quản lý Role admin</h1>
          <p className="text-sm text-muted-foreground">
            Cấp quyền ADMIN / SUPER_ADMIN cho user. Hiện có {ADMINS.length} admin.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Cấp quyền admin
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Admin</th>
              <th className="px-4 py-3 text-center font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Cấp bởi</th>
              <th className="px-4 py-3 text-center font-medium">Từ ngày</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ADMINS.map((a) => (
              <tr key={a.email} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{a.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {a.role === 'SUPER_ADMIN' ? (
                    <Badge variant="destructive">
                      <Crown className="mr-1 h-3 w-3" />
                      SUPER_ADMIN
                    </Badge>
                  ) : (
                    <Badge variant="accent">
                      <Shield className="mr-1 h-3 w-3" />
                      ADMIN
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.addedBy}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{a.addedAt}</td>
                <td className="px-4 py-3 text-right">
                  {a.role !== 'SUPER_ADMIN' && (
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline">
                        Demote
                      </Button>
                      <Button size="sm" variant="ghost">
                        Promote <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Permissions matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Badge variant="accent">
              <Shield className="mr-1 h-3 w-3" />
              ADMIN
            </Badge>
            <h3 className="font-bold">Quyền của ADMIN</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {PERMISSIONS_BY_ROLE.ADMIN.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-destructive/30 p-6">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              <Crown className="mr-1 h-3 w-3" />
              SUPER_ADMIN
            </Badge>
            <h3 className="font-bold">Quyền của SUPER_ADMIN</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {PERMISSIONS_BY_ROLE.SUPER_ADMIN.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 text-destructive">★</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
