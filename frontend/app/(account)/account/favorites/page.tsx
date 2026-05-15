import { VenueCard } from '@/components/shared/venue-card';
import { VENUES } from '@/lib/mock-data';

export default function FavoritesPage() {
  const favorites = VENUES.slice(0, 3);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sân yêu thích</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {favorites.length} sân bạn đã lưu để đặt sau
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((v) => (
          <VenueCard key={v.id} venue={v} />
        ))}
      </div>
    </div>
  );
}
