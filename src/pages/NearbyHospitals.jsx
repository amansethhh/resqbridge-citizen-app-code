import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import HospitalCard from "@/components/resqbridge/HospitalCard";
import AppShell from "@/components/resqbridge/AppShell";
import MapView from "@/components/resqbridge/MapView";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { getCurrentLocation } from "@/services/locationService";
import { getNearbyHospitals } from "@/services/hospitalService";
import { getEmergency, updateEmergency, advanceStatus } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function NearbyHospitals() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const inFlow = !!draftId;

  useEffect(() => {
    getCurrentLocation()
      .then((loc) => {
        setLocation(loc);
        getNearbyHospitals(loc).then(setHospitals);
      })
      .catch(() => getNearbyHospitals(null).then(setHospitals));
  }, []);

  const filtered = useMemo(
    () => hospitals.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()) || h.address.toLowerCase().includes(query.toLowerCase())),
    [hospitals, query]
  );

  const handleContinue = async () => {
    if (!draftId || !selected) return;
    setSaving(true);
    try {
      await updateEmergency(draftId, { hospital_id: selected.id, hospital_name: selected.name });
      await advanceStatus(draftId, "awaiting_confirmation");
      navigate("/emergency/confirm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Nearby <span className="text-rq-primary">Hospitals</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-4">Find the nearest hospitals with distance and estimated travel time.</p>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rq-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hospitals, area or pincode..." className="pl-10 bg-white/70 h-11" />
        </div>

        {location && (
          <MapView
            center={[location.lat, location.lng]}
            markers={[
              { lat: location.lat, lng: location.lng, color: "#e23636" },
              ...filtered.slice(0, 8).map((h) => ({ lat: h.lat, lng: h.lng, color: "#1d6fe8" })),
            ]}
            height={200}
          />
        )}

        <p className="font-semibold text-rq-navy mt-4 mb-2">Hospitals Nearby ({filtered.length})</p>
        <div className="space-y-2.5">
          {filtered.map((h, i) => (
            <HospitalCard key={h.id} hospital={h} closest={i === 0} selected={selected?.id === h.id} onSelect={() => inFlow && setSelected(h)} />
          ))}
          {filtered.length === 0 && <p className="text-sm text-rq-muted text-center py-8">No hospitals match your search.</p>}
        </div>

        {inFlow && (
          <div className="mt-6">
            <PrimaryButton disabled={!selected} onClick={handleContinue} loading={saving}>
              {selected ? `Continue with ${selected.name}` : "Select a hospital to continue"}
            </PrimaryButton>
          </div>
        )}
      </div>
    </AppShell>
  );
}