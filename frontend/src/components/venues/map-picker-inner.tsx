'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HCM_CENTER: [number, number] = [10.7769, 106.7009];

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
}

const pinIcon = L.divIcon({
  className: 'venue-pin',
  html: `
    <div class="venue-pin__wrap venue-pin__wrap--active" style="width:56px;height:56px;">
      <span class="venue-pin__ring"></span>
      <span class="venue-pin__bubble">
        <span class="venue-pin__emoji" style="font-size:28px;">📍</span>
      </span>
      <span class="venue-pin__tail"></span>
    </div>
  `,
  iconSize: [56, 64],
  iconAnchor: [28, 62],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ pos }: { pos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!pos) return;
    map.flyTo([pos.lat, pos.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [pos, map]);
  return null;
}

export default function MapPickerInner({ value, onChange }: Props) {
  const [pos, setPos] = useState(value);
  useEffect(() => setPos(value), [value]);

  function pick(lat: number, lng: number) {
    const next = { lat, lng };
    setPos(next);
    onChange(next);
  }

  return (
    <MapContainer
      center={pos ? [pos.lat, pos.lng] : HCM_CENTER}
      zoom={pos ? 15 : 12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={pick} />
      <FlyTo pos={pos} />
      {pos && (
        <Marker
          position={[pos.lat, pos.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const ll = (e.target as L.Marker).getLatLng();
              pick(ll.lat, ll.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
