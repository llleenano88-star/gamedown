'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RussiaMap({ points }: { points: { name: string; lat: number; lng: number; count: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <div className="h-80 overflow-hidden rounded-2xl border sm:h-[480px]">
      <MapContainer center={[60, 80]} zoom={3} minZoom={2} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker key={p.name} center={[p.lat, p.lng]} radius={8 + (p.count / max) * 24}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.45, weight: 1 }}>
            <Tooltip>{p.name}: {p.count}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
