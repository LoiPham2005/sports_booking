'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMe, updateMe } from '@/lib/data/users';
import { isApiError } from '@/lib/api/errors';
import type { UiUser } from '@/lib/api/adapters/user';

export default function ProfilePage() {
  const [user, setUser] = useState<UiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setFullName(u.fullName);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await updateMe({ fullName, dob: dob || undefined });
      toast.success('Đã lưu thay đổi');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (user) {
      setFullName(user.fullName);
      setDob('');
    }
  }

  const initials = user
    ? user.fullName
        .split(' ')
        .slice(-2)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cập nhật thông tin và ảnh đại diện</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl border bg-muted/30" />
          <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Button size="sm" variant="outline" disabled>
                  Đổi ảnh
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG hoặc WEBP. Tối đa 5MB.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={user?.phone ?? ''}
                  readOnly
                  disabled
                  title="Liên hệ admin để đổi số điện thoại"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  disabled
                  title="Liên hệ admin để đổi email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">Mật khẩu</p>
                  <p className="text-xs text-muted-foreground">
                    Đổi định kỳ để bảo mật tài khoản
                  </p>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Đổi mật khẩu
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">Xác thực 2 lớp</p>
                  <p className="text-xs text-muted-foreground">Bảo vệ tài khoản qua OTP SMS</p>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Bật
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
