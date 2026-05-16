'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm';
import { HoursEditor } from '@/components/venues/hours-editor';
import { ImagesEditor } from '@/components/venues/images-editor';
import { PricesEditor } from '@/components/venues/prices-editor';
import {
  getVenue,
  updateOwnerVenue,
  listCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  listSports,
  type UiSport,
} from '@/lib/data/venues';
import { isApiError } from '@/lib/api/errors';
import type { UiVenue, UiCourt } from '@/lib/api/adapters/venue';
import type { SurfaceType, CreateCourtInput } from '@/lib/api/endpoints/venues';

const SURFACES: { value: SurfaceType; label: string }[] = [
  { value: 'NATURAL_GRASS', label: 'Cỏ tự nhiên' },
  { value: 'ARTIFICIAL_GRASS', label: 'Cỏ nhân tạo' },
  { value: 'WOOD', label: 'Sàn gỗ' },
  { value: 'EPOXY', label: 'Sàn epoxy' },
  { value: 'CLAY', label: 'Đất nện' },
  { value: 'RUBBER', label: 'Cao su' },
  { value: 'CONCRETE', label: 'Bê tông' },
];

export default function OwnerVenueEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const confirm = useConfirm();

  const [venue, setVenue] = useState<UiVenue | null>(null);
  const [sports, setSports] = useState<UiSport[]>([]);
  const [courts, setCourts] = useState<UiCourt[]>([]);
  const [loading, setLoading] = useState(true);

  // Form info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [phone, setPhone] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getVenue(id), listSports(), listCourts(id)])
      .then(([v, s, c]) => {
        if (cancelled || !v) return;
        setVenue(v);
        setSports(s);
        setCourts(c);
        setName(v.name);
        setDescription(v.description ?? '');
        setAddressLine(v.address);
        setCity(v.city);
        setDistrict(v.district ?? '');
        setWard('');
        setPhone(v.phone ?? '');
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSaveInfo() {
    setSavingInfo(true);
    try {
      const next = await updateOwnerVenue(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        addressLine: addressLine.trim(),
        city: city.trim(),
        district: district.trim() || undefined,
        ward: ward.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setVenue(next);
      toast.success('Đã lưu thông tin venue');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu thất bại');
    } finally {
      setSavingInfo(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted/40" />
        <div className="h-96 animate-pulse rounded bg-muted/30" />
      </div>
    );
  }

  if (!venue) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-base font-semibold">Không tìm thấy venue</p>
        <Button asChild className="mt-4">
          <Link href="/owner/venues">Quay lại danh sách</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/owner/venues"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tất cả venues
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin venue và các sân con
        </p>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="courts">Sân con ({courts.length})</TabsTrigger>
          <TabsTrigger value="prices">Bảng giá</TabsTrigger>
          <TabsTrigger value="photos">Ảnh</TabsTrigger>
          <TabsTrigger value="hours">Giờ mở cửa</TabsTrigger>
        </TabsList>

        {/* ───── Thông tin venue ───── */}
        <TabsContent value="info">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tên venue</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Số nhà / Đường</Label>
                <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tỉnh / Thành phố</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Quận / Huyện (legacy)</Label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phường / Xã</Label>
                <Input value={ward} onChange={(e) => setWard(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Hotline</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" disabled={savingInfo}>
                Huỷ
              </Button>
              <Button onClick={handleSaveInfo} disabled={savingInfo}>
                {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ───── Sân con ───── */}
        <TabsContent value="courts">
          <CourtsTab
            venueId={id}
            courts={courts}
            sports={sports}
            onChange={setCourts}
            confirmDelete={confirm}
          />
        </TabsContent>

        {/* ───── Bảng giá ───── */}
        <TabsContent value="prices">
          <PricesEditor courts={courts} />
        </TabsContent>

        {/* ───── Ảnh ───── */}
        <TabsContent value="photos">
          <ImagesEditor venueId={id} />
        </TabsContent>

        {/* ───── Giờ mở cửa ───── */}
        <TabsContent value="hours">
          <HoursEditor venueId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

interface CourtsTabProps {
  venueId: string;
  courts: UiCourt[];
  sports: UiSport[];
  onChange: (next: UiCourt[]) => void;
  confirmDelete: ReturnType<typeof useConfirm>;
}

function CourtsTab({ venueId, courts, sports, onChange, confirmDelete }: CourtsTabProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UiCourt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [sportId, setSportId] = useState('');
  const [surface, setSurface] = useState<SurfaceType>('ARTIFICIAL_GRASS');
  const [indoor, setIndoor] = useState(false);
  const [capacity, setCapacity] = useState(10);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);

  function openCreate() {
    setEditing(null);
    setName('');
    setSportId(sports[0]?.id ?? '');
    setSurface('ARTIFICIAL_GRASS');
    setIndoor(false);
    setCapacity(10);
    setSlotDurationMinutes(60);
    setOpen(true);
  }

  function openEdit(c: UiCourt) {
    setEditing(c);
    setName(c.name);
    // c.surface đã là label (Cỏ nhân tạo...) — tìm ngược về enum
    const match = SURFACES.find((s) => s.label === c.surface) ?? SURFACES[1];
    setSurface(match.value);
    setIndoor(c.indoor);
    setCapacity(c.capacity);
    // Tìm sport.id từ slug
    const sp = sports.find((s) => s.slug === c.sportSlug);
    setSportId(sp?.id ?? sports[0]?.id ?? '');
    setSlotDurationMinutes(60);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nhập tên sân');
    if (!sportId) return toast.error('Chọn môn thể thao');
    const body: CreateCourtInput = {
      name: name.trim(),
      sportId,
      surface,
      indoor,
      capacity,
      slotDurationMinutes,
    };
    setSubmitting(true);
    try {
      if (editing) {
        // Update không cho đổi sportId (backend UpdateCourtDto không có field này)
        const { sportId: _ignored, ...updateBody } = body;
        void _ignored;
        const next = await updateCourt(venueId, editing.id, updateBody);
        onChange(courts.map((c) => (c.id === editing.id ? next : c)));
        toast.success('Đã cập nhật sân');
      } else {
        const next = await createCourt(venueId, body);
        onChange([...courts, next]);
        toast.success('Đã thêm sân mới');
      }
      setOpen(false);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lưu sân thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(c: UiCourt) {
    const ok = await confirmDelete({
      title: `Xoá sân "${c.name}"?`,
      description: 'Sân sẽ bị xoá mềm (soft delete). Các booking lịch sử vẫn được giữ lại.',
      confirmText: 'Xoá',
      tone: 'destructive',
    });
    if (!ok) return;
    setDeletingId(c.id);
    try {
      await deleteCourt(venueId, c.id);
      onChange(courts.filter((x) => x.id !== c.id));
      toast.success('Đã xoá sân');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {courts.length === 0
            ? 'Chưa có sân con nào. Thêm sân đầu tiên để bắt đầu nhận booking.'
            : `${courts.length} sân con đang hoạt động.`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm sân con
        </Button>
      </div>

      {courts.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">Chưa có sân</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Thêm sân con
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {courts.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {c.surface}
                  </Badge>
                  {c.indoor && (
                    <Badge variant="secondary" className="text-xs">
                      Trong nhà
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sức chứa: {c.capacity} người · Môn:{' '}
                  {sports.find((s) => s.slug === c.sportSlug)?.name ?? c.sportSlug ?? '—'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                  <Edit2 className="h-3.5 w-3.5" /> Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(c)}
                  disabled={deletingId === c.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === c.id ? '...' : 'Xoá'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Sửa sân "${editing.name}"` : 'Thêm sân con mới'}</DialogTitle>
            <DialogDescription>
              Mỗi sân thuộc một môn thể thao + có giá riêng (đặt sau ở tab Bảng giá).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Tên sân <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="VD: Sân 1, Sân VIP..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Môn thể thao <span className="text-destructive">*</span>
                </Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  required
                  disabled={!!editing}
                  title={editing ? 'Không thể đổi môn của sân đã tạo' : undefined}
                >
                  <option value="">Chọn môn</option>
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
                {editing && (
                  <p className="text-[10px] text-muted-foreground">
                    Môn không đổi được sau khi tạo. Cần đổi → xoá sân và tạo lại.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Loại mặt sân</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value as SurfaceType)}
                >
                  {SURFACES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Sức chứa (người)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slot mặc định (phút)</Label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={slotDurationMinutes}
                  onChange={(e) => setSlotDurationMinutes(Number(e.target.value) || 60)}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
              />
              Sân trong nhà (có mái che)
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Huỷ
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm sân'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
