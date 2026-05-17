'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Crown, Save, Lock, Search, X, ChevronDown } from 'lucide-react';
import { getPermissionMatrix, updateRolePermissions } from '@/lib/data/system';
import { isApiError } from '@/lib/api/errors';
import type { PermissionMatrixDto } from '@/lib/api/endpoints/system';
import type { Role } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: 'Customer',
  OWNER: 'Owner',
  STAFF: 'Staff',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_COLOR: Record<Role, string> = {
  CUSTOMER: 'text-slate-600',
  OWNER: 'text-emerald-600',
  STAFF: 'text-amber-600',
  ADMIN: 'text-rose-600',
  SUPER_ADMIN: 'text-violet-600',
};

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<PermissionMatrixDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
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

  // Group permission theo category + filter theo search
  const grouped = useMemo(() => {
    if (!matrix) return [] as { category: string; perms: PermissionMatrixDto['permissions'] }[];
    const q = search.trim().toLowerCase();
    const map = new Map<string, PermissionMatrixDto['permissions']>();
    for (const p of matrix.permissions) {
      if (q && !p.key.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) continue;
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries()).map(([category, perms]) => ({ category, perms }));
  }, [matrix, search]);

  // Tính dirty per role (so với grants gốc)
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
    if (role === 'SUPER_ADMIN') return;
    setDraft((prev) => {
      const set = new Set(prev[role]);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, [role]: set };
    });
  }

  function toggleCategory(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  /** Tick/untick toàn bộ permission của 1 category cho 1 role */
  function toggleAllInCategory(role: Role, category: string, on: boolean) {
    if (role === 'SUPER_ADMIN' || !matrix) return;
    const keys = matrix.permissions.filter((p) => p.category === category).map((p) => p.key);
    setDraft((prev) => {
      const set = new Set(prev[role]);
      for (const k of keys) {
        if (on) set.add(k);
        else set.delete(k);
      }
      return { ...prev, [role]: set };
    });
  }

  function resetAll() {
    if (!matrix) return;
    setDraft(toDraft(matrix));
    toast.info('Đã huỷ thay đổi');
  }

  async function saveAll() {
    if (!matrix || dirtyRoles.size === 0) return;
    setSaving(true);
    let lastMatrix: PermissionMatrixDto | null = null;
    let ok = 0;
    for (const r of Array.from(dirtyRoles)) {
      try {
        const keys = Array.from(draft[r]);
        lastMatrix = await updateRolePermissions(r, keys);
        ok++;
      } catch (e) {
        toast.error(`${ROLE_LABEL[r]}: ${isApiError(e) ? e.message : 'Lưu thất bại'}`);
      }
    }
    if (lastMatrix) {
      setMatrix(lastMatrix);
      setDraft(toDraft(lastMatrix));
    }
    if (ok > 0) toast.success(`Đã lưu ${ok} role`);
    setSaving(false);
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="destructive">
            <Crown className="mr-1 h-3 w-3" /> SUPER ADMIN
          </Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Phân quyền theo role</h1>
          <p className="text-sm text-muted-foreground">
            Toggle quyền cho từng role. SUPER_ADMIN luôn có toàn bộ quyền (locked).
          </p>
        </div>
      </div>

      {/* Tổng quan role */}
      <div className="grid gap-3 sm:grid-cols-5">
        {matrix.roles.map((r) => {
          const total = matrix.permissions.length;
          const granted = draft[r].size;
          const isDirty = dirtyRoles.has(r);
          return (
            <Card
              key={r}
              className={cn(
                'p-3 transition-shadow',
                isDirty && 'ring-2 ring-amber-500/60 shadow-amber-100',
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-bold uppercase tracking-wide', ROLE_COLOR[r])}>
                  {ROLE_LABEL[r]}
                </span>
                {r === 'SUPER_ADMIN' ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : isDirty ? (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    chưa lưu
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-2xl font-bold">
                {r === 'SUPER_ADMIN' ? total : granted}
                <span className="text-sm font-normal text-muted-foreground">/{total}</span>
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full transition-all',
                    r === 'SUPER_ADMIN' ? 'bg-violet-500' : ROLE_COLOR[r].replace('text-', 'bg-'),
                  )}
                  style={{
                    width: `${(r === 'SUPER_ADMIN' ? total : granted) / total * 100}%`,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm permission (key hoặc mô tả)..."
          className="pl-9 pr-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Matrix table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 border-b bg-card">
              <tr>
                <th className="w-[40%] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Permission
                </th>
                {matrix.roles.map((r) => (
                  <th key={r} className="px-2 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-bold',
                        ROLE_COLOR[r],
                      )}
                    >
                      {r === 'SUPER_ADMIN' && <Lock className="h-3 w-3" />}
                      {ROLE_LABEL[r]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Không tìm thấy permission khớp "{search}"
                  </td>
                </tr>
              )}
              {grouped.map(({ category, perms }) => {
                const isCollapsed = collapsed.has(category);
                return (
                  <>
                    <tr key={`cat-${category}`} className="bg-muted/40">
                      <td colSpan={6} className="px-4 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown
                              className={cn(
                                'h-3 w-3 transition-transform',
                                isCollapsed && '-rotate-90',
                              )}
                            />
                            {category}
                            <span className="text-[10px] font-normal text-muted-foreground/70">
                              ({perms.length})
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            {matrix.roles.map((r) =>
                              r === 'SUPER_ADMIN' ? null : (
                                <CategoryToggle
                                  key={r}
                                  perms={perms}
                                  role={r}
                                  draftSet={draft[r]}
                                  onToggle={(on) => toggleAllInCategory(r, category, on)}
                                />
                              ),
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {!isCollapsed &&
                      perms.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <p className="font-mono text-xs text-muted-foreground">{p.key}</p>
                            <p className="mt-0.5 text-sm">{p.description}</p>
                          </td>
                          {matrix.roles.map((r) => {
                            const checked = draft[r].has(p.key);
                            const locked = r === 'SUPER_ADMIN';
                            return (
                              <td key={r} className="px-2 py-2.5 text-center">
                                <ToggleSwitch
                                  checked={locked ? true : checked}
                                  disabled={locked}
                                  onChange={() => toggle(r, p.key)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Mỗi lần lưu sẽ ghi audit log. Permission được áp dụng ngay không cần khởi động lại backend.
      </p>

      {/* Floating save bar */}
      {dirtyRoles.size > 0 && (
        <div className="sticky bottom-4 z-30 mt-6">
          <Card className="flex flex-wrap items-center gap-3 border-amber-500 bg-amber-50 p-3 shadow-lg dark:bg-amber-950/30">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Có thay đổi chưa lưu:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(dirtyRoles).map((r) => (
                <Badge key={r} variant="outline" className="border-amber-300 bg-white">
                  {ROLE_LABEL[r]}
                </Badge>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={resetAll} disabled={saving}>
                Huỷ thay đổi
              </Button>
              <Button size="sm" onClick={saveAll} disabled={saving}>
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Đang lưu...' : `Lưu tất cả (${dirtyRoles.size})`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Toggle switch component
// ═══════════════════════════════════════════════════════════════

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}

/**
 * Nút bật/tắt nhanh cả category cho 1 role.
 * Hiển thị tri-state: all / some / none.
 */
function CategoryToggle({
  perms,
  role,
  draftSet,
  onToggle,
}: {
  perms: PermissionMatrixDto['permissions'];
  role: Role;
  draftSet: Set<string>;
  onToggle: (on: boolean) => void;
}) {
  const total = perms.length;
  const granted = perms.filter((p) => draftSet.has(p.key)).length;
  const state: 'all' | 'some' | 'none' =
    granted === total ? 'all' : granted === 0 ? 'none' : 'some';

  return (
    <button
      type="button"
      onClick={() => onToggle(state !== 'all')}
      title={`${ROLE_LABEL[role]}: ${granted}/${total}`}
      className={cn(
        'h-5 w-9 shrink-0 rounded-full border text-[8px] font-bold transition-colors',
        state === 'all' && 'border-primary bg-primary/20 text-primary',
        state === 'some' && 'border-amber-400 bg-amber-100 text-amber-700',
        state === 'none' && 'border-muted bg-background text-muted-foreground',
      )}
    >
      {state === 'all' ? '✓' : state === 'some' ? '~' : '○'}
    </button>
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
