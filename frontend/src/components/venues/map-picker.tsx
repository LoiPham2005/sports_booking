'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin, Crosshair, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-muted/30">
      <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
    </div>
  ),
});

interface Props {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}

/**
 * Map picker dùng OpenStreetMap để chọn toạ độ.
 * Click vào map → đặt pin. Kéo pin để điều chỉnh.
 * Hỗ trợ "Vị trí của tôi" qua Geolocation API.
 */
export function MapPicker({ lat, lng, onChange }: Props) {
  const [locating, setLocating] = useState(false);
  const value =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;

  function update(pos: { lat: number; lng: number }) {
    onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        update({ lat: p.coords.latitude, lng: p.coords.longitude });
        toast.success('Đã lấy vị trí hiện tại');
        setLocating(false);
      },
      (err) => {
        toast.error(err.message || 'Không lấy được vị trí');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function clear() {
    onChange('', '');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          Click vào bản đồ để chọn vị trí, hoặc kéo pin để điều chỉnh
        </p>
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={useMyLocation} disabled={locating}>
            <Crosshair className="h-3 w-3" />
            {locating ? 'Đang định vị...' : 'Vị trí của tôi'}
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" onClick={clear}>
              <X className="h-3 w-3" /> Xoá pin
            </Button>
          )}
        </div>
      </div>
      <div className="h-[360px] overflow-hidden rounded-lg border">
        <MapPickerInner value={value} onChange={update} />
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Đã chọn:{' '}
          <span className="font-mono text-foreground">
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
        </p>
      )}
    </div>
  );
}
