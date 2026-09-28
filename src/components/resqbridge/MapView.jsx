import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle } from "react-leaflet";
import L from "leaflet";

function pin(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// markers: [{lat, lng, color, accuracy}]
// route: [[lat,lng], ...]
export default function MapView({ center, markers = [], route, zoom = 14, height = 220, className = "" }) {
  if (!center) return null;
  return (
    <div className={`rounded-2xl overflow-hidden border border-white/60 ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {route && route.length > 1 && <Polyline positions={route} color="#1d6fe8" weight={4} opacity={0.85} />}
        {markers.map((m, i) => (
          <React.Fragment key={i}>
            {m.accuracy ? (
              <Circle center={[m.lat, m.lng]} radius={m.accuracy} pathOptions={{ color: m.color || "#1d6fe8", fillOpacity: 0.12 }} />
            ) : null}
            <Marker position={[m.lat, m.lng]} icon={pin(m.color || "#1d6fe8")} />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}