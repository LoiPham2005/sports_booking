'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { VenueCard } from '@/components/shared/venue-card';
import type { UiVenue } from '@/lib/api/adapters/venue';

// Leaflet phụ thuộc window → import động, không SSR.
const VenueMapInner = dynamic(() => import('./venue-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <div className="text-center">
        <MapIcon className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

interface Props {
  venues: UiVenue[];
}

/**
 * Bản đồ venue với side panel danh sách + popup card.
 * - Click pin → popup card, đồng thời highlight card bên panel.
 * - Click card bên panel → focus pin tương ứng.
 */
export function VenueMap({ venues }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const withCoords = venues.filter((v) => v.lat != null && v.lng != null);
  const withoutCoords = venues.length - withCoords.length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid h-[640px] grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Panel danh sách */}
        <aside className="hidden min-h-0 flex-col border-r bg-card md:flex">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">
              {withCoords.length} sân trên bản đồ
            </p>
            {withoutCoords > 0 && (
              <span className="text-[10px] text-muted-foreground">
                +{withoutCoords} thiếu toạ độ
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {withCoords.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Chưa có sân nào có toạ độ
              </p>
            ) : (
              withCoords.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveId(v.id)}
                  className={`block w-full rounded-lg border bg-background text-left transition-all ${
                    activeId === v.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'hover:border-primary/40'
                  }`}
                >
                  <div className="pointer-events-none">
                    <VenueCard venue={v} />
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="relative">
          <VenueMapInner
            venues={withCoords}
            activeId={activeId}
            onActiveChange={setActiveId}
          />
          {withCoords.length === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/80">
              <div className="rounded-lg border bg-card p-4 text-center shadow-lg">
                <MapIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">Không có sân nào trên bản đồ</p>
                <p className="text-xs text-muted-foreground">
                  Thử thay đổi bộ lọc
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
