'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Venue } from '@/lib/mock-data';
import { SPORTS } from '@/lib/mock-data';
import { formatVND } from '@/lib/format';

export function VenueCard({ venue }: { venue: Venue }) {
  const sportNames = venue.sports.map((s) => SPORTS.find((sp) => sp.slug === s)?.name).filter(Boolean);

  return (
    <Link href={`/venues/${venue.id}`} className="group block">
      <Card className="overflow-hidden border-transparent shadow-none transition-all hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-foreground shadow-sm transition hover:bg-white"
            aria-label="Yêu thích"
          >
            <Heart className="h-4 w-4" />
          </button>
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {sportNames.slice(0, 2).map((s) => (
              <Badge key={s} variant="secondary" className="bg-white/90 text-foreground backdrop-blur">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold leading-tight">{venue.name}</h3>
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{venue.rating}</span>
              <span className="text-muted-foreground">({venue.reviewCount})</span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {venue.district}, {venue.city}
            </span>
            <span className="mx-1">·</span>
            <span>{venue.distance} km</span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Giá từ</p>
              <p className="text-base font-bold text-primary">{formatVND(venue.priceFrom)}<span className="text-xs font-medium text-muted-foreground">/giờ</span></p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
