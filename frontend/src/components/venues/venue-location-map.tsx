'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

const pinIcon = L.divIcon({
  className: 'venue-pin',
  html: `
    <div class="venue-pin__wrap venue-pin__wrap--active" style="width:44px;height:44px;">
      <span class="venue-pin__ring"></span>
      <span class="venue-pin__bubble">
        <span class="venue-pin__emoji" style="font-size:22px;">📍</span>
      </span>
      <span class="venue-pin__tail"></span>
    </div>
  `,
  iconSize: [44, 50],
  iconAnchor: [22, 48],
});

export default function VenueLocationMap({ lat, lng, name }: Props) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
