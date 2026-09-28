import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw, Send } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import PermissionState from "@/components/resqbridge/PermissionState";
import MapView from "@/components/resqbridge/MapView";
import Chip from "@/components/resqbridge/Chip";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { getCurrentLocation } from "@/services/locationService";
import { getEmergency, updateEmergency, advanceStatus } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

const SHARE_TARGETS = [
  { id: "emergency_team", label: "Emergency Team", locked: true },
  { id: "family", label: "Family Members" },
  { id: "police", label: "Police" },
  { id: "hospitals", label: "Nearby Hospitals" },
];

export default function LocationScreen() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [state, setState] = useState("locating");
  const [location, setLocation] = useState(null);
  const [shareWith, setShareWith] = useState(["emergency_team"]);
  const [saving, setSaving] = useState(false);

  const locate = async () => {
    setState("locating");
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setState("found");
    } catch (err) {
      setState(err.code === "denied" ? "denied" : "unavailable");
    }
  };

  useEffect(() => {
    if (!draftId) return;
    getEmergency(draftId).then((rec) => {
      if (rec.location_lat) {
        setLocation({ lat: rec.location_lat, lng: rec.location_lng, accuracy: rec.location_accuracy });
        setState("found");
      } else {
        locate();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const toggleShare = (id) => {
    if (id === "emergency_team") return;
    setShareWith((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleContinue = async () => {
    if (!draftId) return navigate("/emergency/activate");
    setSaving(true);
    try {
      await updateEmergency(draftId, {
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_accuracy: location?.accuracy,
      });
      await advanceStatus(draftId, "location_confirmed");
      navigate("/emergency/hospitals");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">Location</h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Your current location is automatically detected and shared with emergency responders.
        </p>

        {(state === "denied" || state === "unavailable" || state === "locating") && (
          <GlassCard>
            <PermissionState
              state={state === "locating" ? "requesting" : state}
              onRequest={locate}
              icon={MapPin}
              deniedHint="Enable location access in your browser settings so responders can find you."
            />
          </GlassCard>
        )}

        {state === "found" && location && (
          <>
            <MapView center={[location.lat, location.lng]} markers={[{ lat: location.lat, lng: location.lng, color: "#e23636", accuracy: location.accuracy }]} height={240} />

            <GlassCard className="mt-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rq-navy">Current Coordinates</p>
                <p className="text-xs text-rq-muted mt-0.5">
                  Lat: {location.lat.toFixed(4)}° · Lng: {location.lng.toFixed(4)}° · Accuracy: {Math.round(location.accuracy)} m
                </p>
              </div>
              <button onClick={locate} className="w-11 h-11 rounded-full bg-rq-primary/10 text-rq-primary flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform" aria-label="Refresh location">
                <RefreshCw className="w-4 h-4" />
              </button>
            </GlassCard>

            <GlassCard className="mt-3 flex items-center gap-2 !bg-rq-success/5 border border-rq-success/15">
              <span className="w-2 h-2 rounded-full bg-rq-success flex-shrink-0" />
              <p className="text-sm text-rq-success font-medium">Location acquired — sharing is active for this emergency.</p>
            </GlassCard>

            <p className="font-semibold text-rq-navy mt-4 mb-2">Share Location With</p>
            <div className="flex flex-wrap gap-2">
              {SHARE_TARGETS.map((t) => (
                <Chip key={t.id} label={t.label} selected={shareWith.includes(t.id)} onClick={() => toggleShare(t.id)} />
              ))}
            </div>

            <div className="mt-6">
              <PrimaryButton icon={Send} onClick={handleContinue} loading={saving}>Confirm Location</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}