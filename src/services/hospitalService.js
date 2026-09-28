import { base44 } from "@/api/base44Client";
import { haversineKm } from "./locationService";

// Backed by the Hospital entity today (seeded development data);
// swap for a real hospitals API later behind this same function signature.
export async function getNearbyHospitals(userLocation) {
  const hospitals = await base44.entities.Hospital.list();
  return hospitals
    .map((h) => ({
      ...h,
      distance_km: userLocation ? Number(haversineKm(userLocation.lat, userLocation.lng, h.lat, h.lng).toFixed(1)) : h.distance_km,
    }))
    .sort((a, b) => a.distance_km - b.distance_km);
}

export async function getHospital(id) {
  return base44.entities.Hospital.get(id);
}