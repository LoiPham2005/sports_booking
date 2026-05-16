'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { formatVND } from '@/lib/format';
import { SPORTS } from '@/lib/mock-data';
import type { UiVenue } from '@/lib/api/adapters/venue';

/** Map sport slug → emoji. Lookup từ SPORTS, fallback ⚽ */
function sportIcon(slug?: string): string {
  if (!slug) return '⚽';
  return SPORTS.find((s) => s.slug === slug)?.icon ?? '📍';
}

// HCM trung tâm
const HCM_CENTER: [number, number] = [10.7769, 106.7009];

interface Props {
  venues: UiVenue[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
}

/**
 * Marker custom — pin tròn màu primary, hover scale.
 * Dùng DivIcon để tận dụng Tailwind, không phải fetch png mặc định của Leaflet (thường vỡ trong Next.js).
 */
function makePin(icon: string, active: boolean): L.DivIcon {
  const size = active ? 44 : 38;
  return L.divIcon({
    className: 'venue-pin',
    html: `
      <div class="venue-pin__wrap ${active ? 'venue-pin__wrap--active' : ''}" style="width:${size}px;height:${size}px;">
        <span class="venue-pin__ring"></span>
        <span class="venue-pin__bubble">
          <span class="venue-pin__emoji">${icon}</span>
        </span>
        <span class="venue-pin__tail"></span>
      </div>
    `,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 4],
    popupAnchor: [0, -size + 4],
  });
}

/** Tự fit bounds khi danh sách venue đổi. */
function FitBounds({ venues }: { venues: UiVenue[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = venues
      .filter((v): v is UiVenue & { lat: number; lng: number } => v.lat != null && v.lng != null)
      .map((v) => [v.lat, v.lng] as [number, number]);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 15);
      return;
    }
    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [venues, map]);
  return null;
}

export default function VenueMapInner({ venues, activeId, onActiveChange }: Props) {
  const points = useMemo(
    () => venues.filter((v): v is UiVenue & { lat: number; lng: number } => v.lat != null && v.lng != null),
    [venues],
  );

  return (
    <>
      <MapContainer
        center={HCM_CENTER}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds venues={points} />

        {points.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={makePin(sportIcon(v.sports[0]), activeId === v.id)}
            eventHandlers={{
              click: () => onActiveChange?.(v.id),
              popupclose: () => onActiveChange?.(null),
            }}
          >
            <Popup className="venue-popup" minWidth={260} maxWidth={280} closeButton={false}>
              <div className="w-[260px]">
                <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                </div>
                <div className="p-1 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold leading-tight">{v.name}</h4>
                    <div className="flex shrink-0 items-center gap-0.5 text-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{v.rating}</span>
                    </div>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{v.district}</span>
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Giá từ</p>
                      <p className="text-sm font-bold text-primary">
                        {formatVND(v.priceFrom)}
                        <span className="text-[10px] font-medium text-muted-foreground">/giờ</span>
                      </p>
                    </div>
                    <Link
                      href={`/venues/${v.id}`}
                      className="inline-flex items-center gap-0.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Xem
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .venue-pin {
          background: transparent !important;
          border: none !important;
        }
        .venue-pin__wrap {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.18s ease-out;
          transform-origin: 50% 100%;
        }
        .venue-pin__wrap:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        .venue-pin__bubble {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: grid;
          place-items: center;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid hsl(var(--primary));
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
        }
        .venue-pin__emoji {
          font-size: 18px;
          line-height: 1;
        }
        .venue-pin__tail {
          position: absolute;
          left: 50%;
          bottom: -4px;
          z-index: 1;
          width: 12px;
          height: 12px;
          transform: translateX(-50%) rotate(45deg);
          background: #fff;
          border-right: 2px solid hsl(var(--primary));
          border-bottom: 2px solid hsl(var(--primary));
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
        }
        .venue-pin__ring {
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 9999px;
          background: hsl(var(--primary) / 0.2);
          animation: venue-pin-pulse 2s ease-out infinite;
        }
        .venue-pin__wrap--active {
          z-index: 1000;
        }
        .venue-pin__wrap--active .venue-pin__bubble {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          box-shadow: 0 6px 16px hsl(var(--primary) / 0.45);
        }
        .venue-pin__wrap--active .venue-pin__emoji {
          font-size: 22px;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
        }
        .venue-pin__wrap--active .venue-pin__tail {
          background: hsl(var(--primary));
        }
        .venue-pin__wrap--active .venue-pin__ring {
          background: hsl(var(--primary) / 0.4);
        }
        @keyframes venue-pin-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .leaflet-container {
          font-family: inherit;
          background: hsl(var(--muted));
        }
        .leaflet-popup-content-wrapper {
          padding: 6px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>
    </>
  );
}
