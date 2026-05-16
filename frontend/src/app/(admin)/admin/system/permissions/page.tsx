'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Save, Shield } from 'lucide-react';
import { getPermissionMatrix, updateRolePermissions } from '@/lib/data/system';
import { isApiError } from '@/lib/api/errors';
import type { PermissionMatrixDto } from '@/lib/api/endpoints/system';
import type { Role } from '@/lib/api/types';

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: 'Customer',
  OWNER: 'Owner',
  STAFF: 'Staff',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<PermissionMatrixDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Role | null>(null);
  // Bản nháp các grant đang chỉnh sửa (chưa lưu)
  const [draft, setDraft] = useState<Record<Role, Set<string>>>({
    CUSTOMER: new Set(),
    OWNER: new Set(),
    STAFF: new Set(),
    ADMIN: new Set(),
    SUPER_ADMIN: new Set(),
  });

  useEffect(() => {
    getPermissionMatrix()
      .then((m) => {
        setMatrix(m);
        setDraft(toDraft(m));
      })
      .catch((e) => toast.error(isApiError(e) ? e.message : 'Tải permission thất bại'))
      .finally(() => setLoading(false));
  }, []);

  // Nhóm permission theo category để render
  const grouped = useMemo(() => {
    if (!matrix) return [];
    const map = new Map<string, PermissionMatrixDto['permissions']>();
    for (const p of matrix.permissions) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries());
  }, [matrix]);

  // Tính có role nào đang dirty (khác bản gốc) không
  const dirtyRoles = useMemo(() => {
    if (!matrix) return new Set<Role>();
    const dirty = new Set<Role>();
    for (const r of matrix.roles) {
      const original = new Set(matrix.grants[r]);
      const current = draft[r];
      if (original.size !== current.size || !Array.from(current).every((k) => original.has(k))) {
        dirty.add(r);
      }
    }
    return dirty;
  }, [matrix, draft]);

  function toggle(role: Role, key: string) {
    if (role === 'SUPER_ADMIN') return; // Không cho chỉnh SUPER_ADMIN
    setDraft((prev) => {
      const next = { ...prev };
      const set = new Set(prev[role]);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      next[role] = set;
      return next;
    });
  }

  async function save(role: Role) {
    if (role === 'SUPER_ADMIN') return;
    setSaving(role);
    try {
      const keys = Array.from(draft[role]);
      const updated = await updateRolePermissions(role, keys);
      setMatrix(updated);
      setDraft(toDraft(updated));
      toast.success(`Đã lưu quyền cho ${ROLE_LABEL[role]}`);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(null);
    }
  }

  function reset(role: Role) {
    if (!matrix) return;
    setDraft((prev) => ({ ...prev, [role]: new Set(matrix.grants[role]) }));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-muted/40" />
        <div className="h-96 animate-pulse rounded bg-muted/30" />
      </div>
    );
  }

  if (!matrix) {
    return <p className="text-sm text-muted-foreground">Không tải được dữ liệu permission.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="destructive">
          <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Phân quyền theo role</h1>
        <p className="text-sm text-muted-foreground">
          Tích chọn quyền cho từng role. SUPER_ADMIN luôn có toàn bộ quyền, không thể chỉnh sửa.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Permission</th>
              {matrix.roles.map((r) => (
                <th key={r} className="px-3 py-3 text-center font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span>{ROLE_LABEL[r]}</span>
                    {dirtyRoles.has(r) && r !== 'SUPER_ADMIN' && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                        chưa lưu
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(([category, perms]) => (
              <>
                <tr key={`cat-${category}`} className="bg-muted/20">
                  <td colSpan={matrix.roles.length + 1} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Shield className="mr-1 inline h-3 w-3" />
                    {category}
                  </td>
                </tr>
                {perms.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-muted-foreground">{p.key}</p>
                      <p className="mt-0.5">{p.description}</p>
                    </td>
                    {matrix.roles.map((r) => {
                      const checked = draft[r].has(p.key);
                      const locked = r === 'SUPER_ADMIN';
                      return (
                        <td key={r} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={locked ? true : checked}
                            disabled={locked}
                            onChange={() => toggle(r, p.key)}
                            className="h-4 w-4 cursor-pointer accent-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
          <tfoot className="border-t bg-muted/20">
            <tr>
              <td className="px-4 py-3 text-xs text-muted-foreground">Hành động</td>
              {matrix.roles.map((r) => {
                const dirty = dirtyRoles.has(r);
                const locked = r === 'SUPER_ADMIN';
                return (
                  <td key={r} className="px-3 py-3 text-center">
                    {locked ? (
                      <Badge variant="secondary" className="text-[10px]">
                        full
                      </Badge>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Button
                          size="sm"
                          disabled={!dirty || saving === r}
                          onClick={() => save(r)}
                          className="w-full"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          {saving === r ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                        {dirty && (
                          <button
                            onClick={() => reset(r)}
                            className="text-[10px] text-muted-foreground underline hover:text-foreground"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </Card>

      <p className="text-xs text-muted-foreground">
        Mỗi lần lưu sẽ ghi audit log. Permission được áp dụng ngay không cần khởi động lại backend.
      </p>
    </div>
  );
}

function toDraft(m: PermissionMatrixDto): Record<Role, Set<string>> {
  return {
    CUSTOMER: new Set(m.grants.CUSTOMER),
    OWNER: new Set(m.grants.OWNER),
    STAFF: new Set(m.grants.STAFF),
    ADMIN: new Set(m.grants.ADMIN),
    SUPER_ADMIN: new Set(m.grants.SUPER_ADMIN),
  };
}
