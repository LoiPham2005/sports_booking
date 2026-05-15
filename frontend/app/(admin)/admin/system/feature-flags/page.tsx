import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Flag } from 'lucide-react';

const FLAGS = [
  {
    key: 'booking.recurring',
    label: 'Đặt sân định kỳ',
    desc: 'Cho phép customer đặt theo tuần/tháng (vd: T2 + T4 mỗi tuần × 8 tuần)',
    envs: { dev: true, staging: true, prod: false },
  },
  {
    key: 'booking.walk_in',
    label: 'Walk-in booking',
    desc: 'Cho phép owner/staff tạo booking thủ công cho khách offline',
    envs: { dev: true, staging: true, prod: true },
  },
  {
    key: 'auth.social_google',
    label: 'Đăng nhập Google',
    desc: 'Bật/tắt nút Google Sign-In trên login page',
    envs: { dev: true, staging: true, prod: true },
  },
  {
    key: 'auth.social_apple',
    label: 'Đăng nhập Apple',
    desc: 'Bật/tắt nút Apple Sign-In (chỉ iOS)',
    envs: { dev: true, staging: false, prod: false },
  },
  {
    key: 'payment.stripe',
    label: 'Thanh toán Stripe (quốc tế)',
    desc: 'Bật cổng Stripe cho thẻ Visa/Mastercard',
    envs: { dev: true, staging: false, prod: false },
  },
  {
    key: 'venues.map_view',
    label: 'Bản đồ trên trang venues',
    desc: 'Toggle map view trong /venues (mobile + web)',
    envs: { dev: true, staging: true, prod: true },
  },
  {
    key: 'rewards.loyalty',
    label: 'Chương trình loyalty',
    desc: 'Tích điểm theo booking, đổi voucher',
    envs: { dev: true, staging: false, prod: false },
  },
];

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="destructive">
          <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Feature flags</h1>
        <p className="text-sm text-muted-foreground">Bật/tắt feature theo môi trường — thay đổi áp dụng ngay</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Feature</th>
              <th className="px-4 py-3 text-center font-medium">DEV</th>
              <th className="px-4 py-3 text-center font-medium">STAGING</th>
              <th className="px-4 py-3 text-center font-medium">PRODUCTION</th>
            </tr>
          </thead>
          <tbody>
            {FLAGS.map((f) => (
              <tr key={f.key} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-violet-500/10 text-violet-600">
                      <Flag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{f.key}</p>
                      <p className="font-semibold">{f.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle on={f.envs.dev} />
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle on={f.envs.staging} />
                </td>
                <td className="px-4 py-4 text-center">
                  <Toggle on={f.envs.prod} prod />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="border-amber-200 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
        <p className="text-amber-900 dark:text-amber-200">
          ⚡ Mọi thay đổi flag <span className="font-bold">PRODUCTION</span> sẽ được ghi vào Audit log
          và gửi notification cho tất cả SUPER_ADMIN khác.
        </p>
      </Card>
    </div>
  );
}

function Toggle({ on, prod }: { on: boolean; prod?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        defaultChecked={on}
        className="h-5 w-9 accent-primary"
      />
      <Badge variant={on ? (prod ? 'destructive' : 'success') : 'muted'}>
        {on ? 'ON' : 'OFF'}
      </Badge>
    </div>
  );
}
