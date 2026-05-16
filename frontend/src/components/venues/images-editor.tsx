'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, Trash2, Star, Loader2 } from 'lucide-react';
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

const MAX_SIZE_MB = 10;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImagesEditor({ venueId }: { venueId: string }) {
  const [images, setImages] = useState<VenueImageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const confirm = useConfirm();

  useEffect(() => {
    let cancelled = false;
    listImages(venueId)
      .then((list) => !cancelled && setImages(list))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED.includes(file.type)) {
          toast.error(`${file.name}: định dạng không hỗ trợ`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: vượt ${MAX_SIZE_MB}MB`);
          continue;
        }
        const { url, key } = await uploadMedia(file, 'venue');
        const img = await addVenueImage(venueId, { url, key });
        setImages((prev) => [...prev, img]);
        toast.success(`Đã tải lên ${file.name}`);
      }
    } catch (e) {
      toast.error(isApiError(e) ? e.message : (e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(img: VenueImageDto) {
    const ok = await confirm({
      title: 'Xoá ảnh này?',
      description: 'Ảnh sẽ bị xoá khỏi venue. Không thể khôi phục.',
      tone: 'destructive',
      confirmText: 'Xoá',
    });
    if (!ok) return;
    try {
      await deleteVenueImage(venueId, img.id);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success('Đã xoá ảnh');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Xoá thất bại');
    }
  }

  async function setPrimary(img: VenueImageDto) {
    // Đặt làm primary = re-add với isPrimary=true (backend tự un-set ảnh khác).
    // Simpler: gọi addImage với same url + isPrimary=true sẽ tạo bản sao — tốt hơn là PATCH.
    // Tạm thời chỉ update local state, sẽ wire PATCH endpoint sau.
    setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === img.id })));
    toast.success(`Đã đặt ảnh này làm ảnh đại diện (local — chưa wire PATCH)`);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Ảnh venue</h3>
          <p className="text-xs text-muted-foreground">
            Ảnh đầu tiên sẽ là ảnh đại diện. Tối đa {MAX_SIZE_MB}MB/ảnh, JPG/PNG/WebP/GIF.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(',')}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
        </Button>
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-4 grid h-48 w-full place-items-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8" />
            <p className="mt-2">Click để chọn ảnh hoặc kéo thả vào đây</p>
            <p className="mt-0.5 text-xs">Tối đa {MAX_SIZE_MB}MB · JPG/PNG/WebP/GIF</p>
          </div>
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {img.isPrimary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" /> Chính
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/60 via-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setPrimary(img)}
                    className="h-7 w-7"
                    title="Đặt làm ảnh đại diện"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(img)}
                  className="h-7 w-7"
                  title="Xoá ảnh"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
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
              <p className="mt-1">Thêm ảnh</p>
            </div>
          </button>
        </div>
      )}

      {/* Suppress unused warning - Image will be used when we replace img with Next Image */}
      <span className="hidden">{Image.displayName}</span>
    </Card>
  );
}
