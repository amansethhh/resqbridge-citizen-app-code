import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MessageCircle, Phone } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import StatusBadge from "@/components/resqbridge/StatusBadge";
import MapView from "@/components/resqbridge/MapView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { advanceStatus, cancelEmergency, updateEmergency, STAGE_LABELS } from "@/services/emergencyService";
import { createMockRoute, subscribeToLocationUpdates } from "@/services/trackingService";
import { emergencyTypeById } from "@/constants/emergencyTypes";
import { useEmergency } from "@/state/EmergencyContext";

const STAGES = ["confirmed", "active", "en_route", "arrived"];

export default function EmergencyActive() {
  const navigate = useNavigate();
  const { activeEmergency, refreshActive } = useEmergency();
  const [elapsed, setElapsed] = useState(0);
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [policePos, setPolicePos] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const record = activeEmergency;

  useEffect(() => {
    if (!record) return;
    const start = new Date(record.updated_date || record.created_date).getTime();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [record]);

  useEffect(() => {
    if (!record?.location_lat) return;
    const dest = { lat: record.location_lat, lng: record.location_lng };
    const ambRoute = createMockRoute(dest, 40, 3.2);
    const policeRoute = createMockRoute(dest, 300, 4.1);
    const unsubA = subscribeToLocationUpdates(ambRoute, (u) => setAmbulancePos(u));
    const unsubP = subscribeToLocationUpdates(policeRoute, (u) => setPolicePos(u));
    const assignTimer = setTimeout(async () => {
      if (record.status === "active") {
        await updateEmergency(record.id, {
          ambulance_code: "ALS-03",
          ambulance_driver: "Ramesh Kumar",
          ambulance_phone: "+91 98765 43210",
        });
        await advanceStatus(record.id, "ambulance_assigned");
        refreshActive();
      }
    }, 6000);
    return () => {
      unsubA();
      unsubP();
      clearTimeout(assignTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  if (!record) {
    return (
      <AppShell>
        <div className="px-5 pt-4 rq-content-bottom">
          <ScreenHeader />
          <p className="text-center text-rq-muted mt-20">No active emergency right now.</p>
        </div>
      </AppShell>
    );
  }

  const handleCancel = async () => {
    await cancelEmergency(record.id);
    await refreshActive();
    navigate("/");
  };

  const typeInfo = emergencyTypeById(record.type);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");
  const currentStageIdx = STAGES.indexOf(record.status) >= 0 ? STAGES.indexOf(record.status) : 1;

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader
          showLogo={false}
          right={<StatusBadge variant="danger">Emergency Active</StatusBadge>}
        />
        <h1 className="text-2xl font-extrabold text-rq-red">Emergency Active</h1>
        <p className="text-sm text-rq-muted mt-1 mb-4">Help is on the way. Emergency teams have been dispatched and are approaching your location.</p>

        <GlassCard className="flex items-center justify-between !bg-rq-red/5 border border-rq-red/15">
          <div className="min-w-0">
            <p className="text-sm font-bold text-rq-red flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {typeInfo?.label}</p>
            <p className="text-xs text-rq-muted mt-0.5">{new Date(record.created_date).toLocaleString()}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-rq-muted">Time since alert</p>
            <p className="font-mono font-bold text-rq-red">{mm}:{ss}</p>
          </div>
        </GlassCard>

        {record.location_lat && (
          <MapView
            className="mt-3"
            center={[record.location_lat, record.location_lng]}
            height={230}
            route={ambulancePos ? [[ambulancePos.lat, ambulancePos.lng], [record.location_lat, record.location_lng]] : undefined}
            markers={[
              { lat: record.location_lat, lng: record.location_lng, color: "#e23636" },
              ...(ambulancePos ? [{ lat: ambulancePos.lat, lng: ambulancePos.lng, color: "#1d6fe8" }] : []),
              ...(policePos ? [{ lat: policePos.lat, lng: policePos.lng, color: "#0f2c5c" }] : []),
            ]}
          />
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <GlassCard>
            <p className="text-xs text-rq-muted">Ambulance (ALS)</p>
            <StatusBadge variant={ambulancePos?.status === "arrived" ? "success" : "info"} className="my-1">
              {ambulancePos?.status === "arrived" ? "Arrived" : "En Route"}
            </StatusBadge>
            <p className="text-sm font-bold text-rq-navy">{ambulancePos ? `${ambulancePos.etaMin} min away` : "Dispatching…"}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-rq-muted">Police Unit</p>
            <StatusBadge variant={policePos?.status === "arrived" ? "success" : "info"} className="my-1">
              {policePos?.status === "arrived" ? "Arrived" : "En Route"}
            </StatusBadge>
            <p className="text-sm font-bold text-rq-navy">{policePos ? `${policePos.etaMin} min away` : "Dispatching…"}</p>
          </GlassCard>
        </div>

        <div className="flex items-center justify-between mt-5">
          {STAGES.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-3 h-3 rounded-full ${i <= currentStageIdx ? "bg-rq-red" : "bg-slate-300"}`} />
              <span className={`text-[10px] mt-1 font-medium text-center ${i <= currentStageIdx ? "text-rq-red" : "text-rq-muted"}`}>
                {STAGE_LABELS[s]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 h-12 rounded-2xl font-semibold text-rq-navy rq-glass-subtle border border-white/60 flex items-center justify-center gap-2 opacity-60">
            <MessageCircle className="w-4 h-4" /> Live Chat
          </button>
          <a href={`tel:${record.ambulance_phone || "112"}`} className="flex-1 h-12 rounded-2xl font-semibold text-white rq-btn-danger flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Phone className="w-4 h-4" /> Emergency Call
          </a>
        </div>

        {record.status === "active" && (
          <button onClick={() => setCancelOpen(true)} className="w-full h-11 text-sm font-semibold text-rq-muted mt-3">
            Cancel Emergency Request
          </button>
        )}

        {record.status === "ambulance_assigned" && (
          <button onClick={() => navigate("/emergency/ambulance")} className="w-full h-11 text-sm font-semibold text-rq-primary mt-3">
            View Ambulance Assignment →
          </button>
        )}

        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent className="max-w-[92%] w-[92%] sm:max-w-[92%] rounded-3xl p-5 gap-4">
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-lg font-bold text-rq-navy">Cancel this emergency?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-rq-muted">Only cancel if this was a false alarm or help is no longer needed. Responders will be notified.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              <AlertDialogAction onClick={handleCancel} className="rq-btn-danger h-12 rounded-2xl text-white border-0 w-full font-semibold">Yes, Cancel</AlertDialogAction>
              <AlertDialogCancel className="rq-btn-glass h-12 rounded-2xl border-0 text-rq-navy w-full font-semibold mt-0">Keep Active</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}