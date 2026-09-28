import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Gauge, Milestone, Clock, CheckCircle2 } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import StatusBadge from "@/components/resqbridge/StatusBadge";
import MapView from "@/components/resqbridge/MapView";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import AppShell from "@/components/resqbridge/AppShell";
import { createMockRoute, subscribeToLocationUpdates } from "@/services/trackingService";
import { advanceStatus } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function LiveTracking() {
  const navigate = useNavigate();
  const { activeEmergency, refreshActive } = useEmergency();
  const [pos, setPos] = useState(null);
  const record = activeEmergency;

  useEffect(() => {
    if (!record?.location_lat) return;
    const route = createMockRoute({ lat: record.location_lat, lng: record.location_lng }, 40, 3.2);
    const unsub = subscribeToLocationUpdates(route, setPos);
    return unsub;
  }, [record?.id]);

  if (!record) {
    return (
      <AppShell>
        <div className="px-5 pt-4 rq-content-bottom">
          <ScreenHeader />
          <p className="text-center text-rq-muted mt-20">Nothing to track right now.</p>
        </div>
      </AppShell>
    );
  }

  const arrived = pos?.status === "arrived";

  const completeHandover = async () => {
    await advanceStatus(record.id, "arrived");
    await advanceStatus(record.id, "handover");
    await advanceStatus(record.id, "completed");
    await refreshActive();
    navigate(`/emergency/handover?id=${record.id}`);
  };

  const stages = ["Assigned", "En Route", "Arriving", "Arrived"];
  const stageIdx = arrived ? 3 : pos ? (pos.progress > 0.6 ? 2 : 1) : 0;

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader showLogo={false} right={<StatusBadge variant="danger">Emergency Active</StatusBadge>} />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Live <span className="text-rq-primary">Tracking</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-3">Track your assigned ambulance in real-time.</p>

        <div className="flex items-center gap-2 mb-3 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              pos?.connectionState === "live" ? "bg-rq-success animate-pulse" : "bg-slate-400"
            }`}
          />
          <span className="text-rq-muted font-medium">
            {pos?.connectionState === "live" ? "Live — real-time ambulance location" : "Connecting…"}
          </span>
        </div>

        {record.location_lat && pos ? (
          <MapView
            center={[record.location_lat, record.location_lng]}
            height={260}
            route={[[pos.lat, pos.lng], [record.location_lat, record.location_lng]]}
            markers={[
              { lat: record.location_lat, lng: record.location_lng, color: "#e23636" },
              { lat: pos.lat, lng: pos.lng, color: "#1d6fe8" },
            ]}
          />
        ) : (
          <div className="h-[260px] rounded-3xl rq-glass flex items-center justify-center text-sm text-rq-muted">
            Acquiring ambulance location…
          </div>
        )}

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-bold text-rq-navy">Ambulance {record.ambulance_code}</p>
            <p className="text-xs text-rq-muted">Advanced Life Support (ALS)</p>
          </div>
          <StatusBadge variant={arrived ? "success" : "info"}>{arrived ? "Arrived" : "On the way"}</StatusBadge>
        </GlassCard>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <GlassCard className="text-center !p-3">
            <Gauge className="w-4 h-4 text-rq-primary mx-auto mb-1" />
            <p className="text-base font-bold text-rq-navy">{pos?.speedKmh ?? 0}</p>
            <p className="text-[10px] text-rq-muted">km/h</p>
          </GlassCard>
          <GlassCard className="text-center !p-3">
            <Milestone className="w-4 h-4 text-rq-primary mx-auto mb-1" />
            <p className="text-base font-bold text-rq-navy">{pos?.distanceKm ?? "-"}</p>
            <p className="text-[10px] text-rq-muted">km left</p>
          </GlassCard>
          <GlassCard className="text-center !p-3">
            <Clock className="w-4 h-4 text-rq-primary mx-auto mb-1" />
            <p className="text-base font-bold text-rq-navy">{pos?.etaMin ?? "-"}</p>
            <p className="text-[10px] text-rq-muted">min ETA</p>
          </GlassCard>
        </div>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-rq-muted">Driver</p>
            <p className="font-semibold text-rq-navy truncate">{record.ambulance_driver}</p>
          </div>
          <a
            href={`tel:${record.ambulance_phone}`}
            className="w-11 h-11 rounded-full bg-rq-primary text-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Call driver"
          >
            <Phone className="w-4 h-4" />
          </a>
        </GlassCard>

        <div className="mt-5">
          <p className="text-xs font-semibold text-rq-muted uppercase tracking-wide mb-3">Progress</p>
          <div className="flex items-center justify-between">
            {stages.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-3.5 h-3.5 rounded-full ${i <= stageIdx ? "bg-rq-primary" : "bg-slate-300"}`} />
                <span
                  className={`text-[10px] mt-1.5 font-medium text-center ${
                    i <= stageIdx ? "text-rq-primary" : "text-rq-muted"
                  }`}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 h-12 rounded-2xl font-semibold text-rq-navy rq-glass-subtle border border-white/60 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <MessageCircle className="w-4 h-4" /> Live Chat
          </button>
          <a
            href={`tel:${record.ambulance_phone}`}
            className="flex-1 h-12 rounded-2xl font-semibold text-white bg-rq-red flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Phone className="w-4 h-4" /> Emergency Call
          </a>
        </div>

        {arrived && (
          <div className="mt-4">
            <PrimaryButton icon={CheckCircle2} onClick={completeHandover}>
              Confirm Arrival & Complete Handover
            </PrimaryButton>
          </div>
        )}
      </div>
    </AppShell>
  );
}