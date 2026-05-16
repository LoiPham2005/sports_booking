'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VenueCard } from '@/components/shared/venue-card';
import { listFavorites, toggleFavorite } from '@/lib/data/users';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/errors';
import type { UiVenue } from '@/lib/api/adapters/venue';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<UiVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listFavorites()
      .then((list) => {
        if (!cancelled) setFavorites(list);
      })
      .catch(() => {
        if (!cancelled) setFavorites([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await toggleFavorite(id, true);
      setFavorites((prev) => prev.filter((v) => v.id !== id));
      toast.success('Đã bỏ khỏi yêu thích');
    } catch (e) {
      toast.error(isApiError(e) ? e.message : 'Lỗi khi cập nhật');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sân yêu thích</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? '...' : `${favorites.length} sân bạn đã lưu để đặt sau`}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Chưa có sân yêu thích</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tim ❤️ những sân bạn quan tâm để đặt nhanh sau này
          </p>
          <Button className="mt-4" asChild>
            <Link href="/venues">Khám phá sân</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((v) => (
            <div key={v.id} className="relative">
              <VenueCard venue={v} />
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-md"
                onClick={() => handleRemove(v.id)}
                disabled={removingId === v.id}
                title="Bỏ yêu thích"
              >
                <Heart className="h-4 w-4 fill-destructive text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
