import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Siren, CarFront, BedDouble, Wind, HeartPulse, MoreHorizontal, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import MobileProgress from "@/components/resqbridge/MobileProgress";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { EMERGENCY_TYPES } from "@/constants/emergencyTypes";
import { getCurrentLocation } from "@/services/locationService";
import { createDraft } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

const ICONS = { Siren, CarFront, BedDouble, Wind, HeartPulse, MoreHorizontal };

export default function EmergencyActivation() {
  const navigate = useNavigate();
  const { setDraft } = useEmergency();
  const [selected, setSelected] = useState("medical");
  const [location, setLocation] = useState(null);
  const [locState, setLocState] = useState("locating");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentLocation()
      .then((loc) => {
        setLocation(loc);
        setLocState("found");
      })
      .catch(() => setLocState("unavailable"));
  }, []);

  const handleContinue = async () => {
    setSaving(true);
    try {
      const draft = await createDraft({
        type: selected,
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_accuracy: location?.accuracy,
      });
      setDraft(draft.id);
      navigate("/emergency/details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">Emergency Activation</h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Tell us what kind of emergency you are facing so we can provide the right assistance.
        </p>

        <MobileProgress current={1} total={3} label="Select Emergency" />

        <p className="font-semibold text-rq-navy mt-5 mb-3">What is happening?</p>
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_TYPES.map((t) => {
            const Icon = ICONS[t.icon];
            const active = selected === t.id;
            return (
              <GlassCard
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`relative flex flex-col items-center text-center gap-1.5 min-h-[112px] ${active ? "ring-2 ring-rq-red bg-rq-red/5" : ""}`}
              >
                {active && <CheckCircle2 className="w-5 h-5 text-rq-red absolute top-2 right-2" />}
                <Icon className={`w-8 h-8 mt-1 ${active ? "text-rq-red" : "text-rq-primary"}`} />
                <p className="text-sm font-bold text-rq-navy">{t.label}</p>
                <p className="text-[11px] text-rq-muted">{t.desc}</p>
              </GlassCard>
            );
          })}
        </div>

        <GlassCard className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-rq-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-rq-navy">Your Current Location</p>
              <p className="text-xs text-rq-muted">
                {locState === "found" && `GPS Active • Accuracy: ${Math.round(location.accuracy)} m`}
                {locState === "locating" && "Locating…"}
                {locState === "unavailable" && "Location unavailable — you can still continue"}
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="mt-4 p-3 rounded-2xl bg-rq-red/10 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rq-red flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rq-red">If this is a life-threatening emergency</p>
            <p className="text-xs text-rq-muted">Tap continue immediately. We will guide you through the next steps.</p>
          </div>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={handleContinue} loading={saving}>Continue</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}