// Real device geolocation abstraction. Swap the implementation later without
// touching any screen — every screen only calls these exported functions.

export function getCurrentLocation({ timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({ code: "unavailable", message: "Location is not supported on this device." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject({ code: "denied", message: "Location permission was denied." });
        } else {
          reject({ code: "unavailable", message: "Could not determine your location." });
        }
      },
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

export function watchLocation(onUpdate, onError) {
  if (!("geolocation" in navigator)) {
    onError?.({ code: "unavailable", message: "Location is not supported on this device." });
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) =>
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      }),
    (err) => onError?.({ code: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}