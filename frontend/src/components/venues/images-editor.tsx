'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Star, Loader2, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm';
import {
  listImages,
  addVenueImage,
  deleteVenueImage,
  uploadMedia,
} from '@/lib/data/venues';
import { isApiError } from '@/lib/api/errors';
import type { VenueImageDto } from '@/lib/api/endpoints/venues';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/quicktime'];
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImagesEditor({ venueId }: { venueId: string }) {
  const [items, setItems] = useState<VenueImageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  useEffect(() => {
    let cancelled = false;
    listImages(venueId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  async function handleDelete(item: VenueImageDto) {
    const ok = await confirm({
      title: 'Xoá media này?',
      description: 'File sẽ bị xoá khỏi venue. Không thể khôi phục.',
      tone: 'destructive',
      confirmText: 'Xoá',
    });
    if (!ok) return;
    try {
      await deleteVenueImage(venueId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success('Đã xoá');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  function setPrimary(item: VenueImageDto) {
    setItems((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === item.id })));
    toast.success('Đã đặt làm ảnh đại diện (local — chưa wire PATCH)');
  }

  // Phân loại item ra ảnh/video dựa trên đuôi file trong URL hoặc key
  const images = items.filter((i) => !isVideo(i.url));
  const videos = items.filter((i) => isVideo(i.url));

  return (
    <div className="space-y-6">
      <UploadSection
        kind="image"
        title="Ảnh venue"
        description={`Ảnh đầu tiên sẽ là ảnh đại diện. Tối đa ${MAX_IMAGE_MB}MB / ảnh, JPG/PNG/WebP/GIF.`}
        accept={IMAGE_MIMES}
        maxMB={MAX_IMAGE_MB}
        venueId={venueId}
        onUploaded={(img) => setItems((prev) => [...prev, img])}
      />

      <UploadSection
        kind="video"
        title="Video venue"
        description={`Video giới thiệu, tour 360°... Tối đa ${MAX_VIDEO_MB}MB / video, MP4/MOV.`}
        accept={VIDEO_MIMES}
        maxMB={MAX_VIDEO_MB}
        venueId={venueId}
        onUploaded={(v) => setItems((prev) => [...prev, v])}
      />

      {/* Existing media */}
      <Card className="p-6">
        <h3 className="font-semibold">Đã tải lên</h3>
        <p className="text-xs text-muted-foreground">
          {loading ? '...' : `${images.length} ảnh · ${videos.length} video`}
        </p>

        {loading ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted/30" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-6 py-8 text-center text-sm text-muted-foreground">
            Chưa có file nào — chọn ảnh/video ở khung phía trên rồi nhấn "Tải lên".
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {[...images, ...videos].map((m) => (
              <MediaThumb
                key={m.id}
                item={m}
                onDelete={() => handleDelete(m)}
                onSetPrimary={() => setPrimary(m)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Upload section — staged files + nút "Tải lên" mới gửi server
// ═══════════════════════════════════════════════════════════════

interface UploadSectionProps {
  kind: 'image' | 'video';
  title: string;
  description: string;
  accept: string[];
  maxMB: number;
  venueId: string;
  onUploaded: (img: VenueImageDto) => void;
}

function UploadSection({
  kind,
  title,
  description,
  accept,
  maxMB,
  venueId,
  onUploaded,
}: UploadSectionProps) {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function pickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: StagedFile[] = [];
    for (const f of Array.from(files)) {
      if (!accept.includes(f.type)) {
        toast.error(`${f.name}: định dạng không hỗ trợ`);
        continue;
      }
      if (f.size > maxMB * 1024 * 1024) {
        toast.error(`${f.name}: vượt ${maxMB}MB`);
        continue;
      }
      next.push({
        id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
      });
    }
    setStaged((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  async function handleUpload() {
    if (staged.length === 0) return;
    setUploading(true);
    let success = 0;
    let failed = 0;
    for (const s of staged) {
      try {
        const { url, key } = await uploadMedia(s.file, 'venue');
        const img = await addVenueImage(venueId, { url, key });
        onUploaded(img);
        URL.revokeObjectURL(s.previewUrl);
        success += 1;
      } catch (e) {
        failed += 1;
        toast.error(`${s.file.name}: ${isApiError(e) ? e.message : (e as Error).message}`);
      }
    }
    setStaged([]);
    setUploading(false);
    if (success > 0) toast.success(`Đã tải lên ${success} file${failed > 0 ? `, ${failed} lỗi` : ''}`);
  }

  const Icon = kind === 'image' ? ImageIcon : VideoIcon;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Icon className="h-4 w-4" /> {title}
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={accept.join(',')}
          multiple
          hidden
          onChange={(e) => pickFiles(e.target.files)}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            Chọn {kind === 'image' ? 'ảnh' : 'video'}
          </Button>
          <Button type="button" onClick={handleUpload} disabled={staged.length === 0 || uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Đang tải...' : `Tải lên (${staged.length})`}
          </Button>
        </div>
      </div>

      {staged.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-4 grid h-40 w-full place-items-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed"
        >
          <div className="text-center">
            <Upload className="mx-auto h-7 w-7" />
            <p className="mt-2">
              Click để chọn {kind === 'image' ? 'ảnh' : 'video'} hoặc kéo thả vào đây
            </p>
            <p className="mt-0.5 text-xs">
              Tối đa {maxMB}MB · {accept.map((a) => a.split('/')[1].toUpperCase()).join('/')}
            </p>
          </div>
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {staged.map((s) => (
            <div
              key={s.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={s.previewUrl} className="h-full w-full object-cover" muted />
              )}
              <button
                type="button"
                onClick={() => removeStaged(s.id)}
                disabled={uploading}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                title="Bỏ chọn"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] text-white">
                {s.file.name}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="grid aspect-square place-items-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-center text-xs">
              <Upload className="mx-auto h-5 w-5" />
              <p className="mt-1">Thêm</p>
            </div>
          </button>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// Media thumbnail (ảnh hoặc video đã upload xong)
// ═══════════════════════════════════════════════════════════════

function MediaThumb({
  item,
  onDelete,
  onSetPrimary,
}: {
  item: VenueImageDto;
  onDelete: () => void;
  onSetPrimary: () => void;
}) {
  const video = isVideo(item.url);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {video ? (
        <video src={item.url} controls className="h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      )}
      {video && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
          <VideoIcon className="h-2.5 w-2.5" /> VIDEO
        </span>
      )}
      {item.isPrimary && !video && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold text-white">
          <Star className="h-2.5 w-2.5 fill-white" /> Chính
        </span>
      )}
      <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/60 via-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        {!item.isPrimary && !video && (
          <Button
            size="icon"
            variant="secondary"
            onClick={onSetPrimary}
            className="h-7 w-7"
            title="Đặt làm ảnh đại diện"
          >
            <Star className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="icon"
          variant="destructive"
          onClick={onDelete}
          className="h-7 w-7"
          title="Xoá"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function isVideo(url: string): boolean {
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);
}
