import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Navigation2 } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import StatusBadge from "@/components/resqbridge/StatusBadge";
import MapView from "@/components/resqbridge/MapView";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { createMockRoute, subscribeToLocationUpdates } from "@/services/trackingService";
import { useEmergency } from "@/state/EmergencyContext";

export default function AmbulanceAssigned() {
  const navigate = useNavigate();
  const { activeEmergency } = useEmergency();
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
          <p className="text-center text-rq-muted mt-20">No ambulance assignment right now.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader showLogo={false} right={<StatusBadge variant="danger">Emergency Active</StatusBadge>} />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Ambulance <span className="text-rq-success">Assigned</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-4">An ambulance has been assigned and is on the way to your location.</p>

        <GlassCard className="!bg-rq-success/5 border border-rq-success/15 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rq-success flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rq-success">Ambulance Dispatched</p>
            <p className="text-xs text-rq-muted">The nearest available ambulance has been assigned to your case.</p>
          </div>
        </GlassCard>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-bold text-rq-navy">Ambulance {record.ambulance_code}</p>
            <p className="text-xs text-rq-muted">Advanced Life Support (ALS)</p>
            <StatusBadge variant="success" className="mt-1">On the way</StatusBadge>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-rq-muted">ETA</p>
            <p className="text-xl font-extrabold text-rq-red">{pos ? pos.etaMin : 8} min</p>
          </div>
        </GlassCard>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-rq-muted">Driver</p>
            <p className="font-semibold text-rq-navy truncate">{record.ambulance_driver || "Not assigned"}</p>
            {record.ambulance_phone && <p className="text-xs text-rq-primary font-medium">{record.ambulance_phone}</p>}
          </div>
          {record.ambulance_phone && (
            <a href={`tel:${record.ambulance_phone}`} className="w-11 h-11 rounded-full rq-btn-primary text-white flex items-center justify-center active:scale-95 transition-transform flex-shrink-0" aria-label="Call driver">
              <Phone className="w-4 h-4" />
            </a>
          )}
        </GlassCard>

        {record.location_lat && pos && (
          <MapView
            className="mt-3"
            center={[record.location_lat, record.location_lng]}
            height={220}
            route={[[pos.lat, pos.lng], [record.location_lat, record.location_lng]]}
            markers={[
              { lat: record.location_lat, lng: record.location_lng, color: "#e23636" },
              { lat: pos.lat, lng: pos.lng, color: "#1d6fe8" },
            ]}
          />
        )}

        <div className="flex gap-3 mt-5">
          <button className="flex-1 h-12 rounded-2xl font-semibold text-rq-navy rq-glass-subtle border border-white/60 flex items-center justify-center gap-2 opacity-60">
            <MessageCircle className="w-4 h-4" /> Live Chat
          </button>
          <a href={`tel:${record.ambulance_phone}`} className="flex-1 h-12 rounded-2xl font-semibold text-white rq-btn-danger flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Phone className="w-4 h-4" /> Call Driver
          </a>
        </div>

        <div className="mt-4">
          <PrimaryButton icon={Navigation2} onClick={() => navigate("/emergency/tracking")}>View Live Tracking</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}