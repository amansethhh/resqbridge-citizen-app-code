import { haversineKm } from "./locationService";

// TrackingService — the UI only calls subscribeToLocationUpdates(). Today it
// runs a DEV MOCK ADAPTER that interpolates a fixed route; swap the body of
// subscribeToLocationUpdates() for a real WebSocket/SSE feed later and every
// screen that consumes it keeps working unchanged.

function offsetPoint(lat, lng, km, bearingDeg) {
  const R = 6371;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(km / R) * Math.cos(lat1), Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

export function createMockRoute(destination, bearing = 40, distanceKm = 3.2) {
  return { origin: offsetPoint(destination.lat, destination.lng, distanceKm, bearing), destination };
}

// DEV MOCK ADAPTER — replace with a real realtime subscription later.
export function subscribeToLocationUpdates(route, onUpdate, durationMs = 100000) {
  const start = Date.now();
  let connectionState = "live";
  const interval = setInterval(() => {
    const t = Math.min((Date.now() - start) / durationMs, 1);
    const lat = route.origin.lat + (route.destination.lat - route.origin.lat) * t;
    const lng = route.origin.lng + (route.destination.lng - route.origin.lng) * t;
    const distanceKm = Number(haversineKm(lat, lng, route.destination.lat, route.destination.lng).toFixed(1));
    const etaMin = Math.max(0, Math.round((1 - t) * 8));
    onUpdate({
      lat,
      lng,
      distanceKm,
      etaMin,
      speedKmh: t >= 1 ? 0 : 45,
      progress: t,
      status: t >= 1 ? "arrived" : "en_route",
      connectionState,
    });
    if (t >= 1) clearInterval(interval);
  }, 2000);
  return () => clearInterval(interval);
}