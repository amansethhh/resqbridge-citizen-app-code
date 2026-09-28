import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, Users, FileText, ChevronRight, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppLogo from "@/components/resqbridge/AppLogo";
import GlassCard from "@/components/resqbridge/GlassCard";
import IconBadge from "@/components/resqbridge/IconBadge";
import SectionHeader from "@/components/resqbridge/SectionHeader";
import HospitalCard from "@/components/resqbridge/HospitalCard";
import SosButton from "@/components/resqbridge/SosButton";
import { useEmergency } from "@/state/EmergencyContext";
import { getCurrentLocation } from "@/services/locationService";
import { getNearbyHospitals } from "@/services/hospitalService";
import { listNotifications } from "@/services/notificationService";

export default function Home() {
  const navigate = useNavigate();
  const { activeEmergency, unreadCount } = useEmergency();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationState, setLocationState] = useState("locating");
  const [hospitals, setHospitals] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    listNotifications().then((n) => setRecent(n.slice(0, 2))).catch(() => {});
    getCurrentLocation()
      .then((loc) => {
        setLocation(loc);
        setLocationState("found");
        getNearbyHospitals(loc).then((h) => setHospitals(h.slice(0, 3)));
      })
      .catch(() => {
        setLocationState("unavailable");
        getNearbyHospitals(null).then((h) => setHospitals(h.slice(0, 3)));
      });
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  const quickActions = [
    { label: "Share Live Location", icon: MapPin, tone: "red", path: "/emergency/location" },
    { label: "Nearby Hospitals", icon: ShieldCheck, tone: "primary", path: "/emergency/hospitals" },
    { label: "Emergency Contacts", icon: Users, tone: "success", path: "/family" },
    { label: "My Medical Info", icon: FileText, tone: "violet", path: "/profile?tab=medical" },
  ];

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-5">
        <AppLogo size="sm" />
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-11 h-11 rounded-full rq-glass flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-rq-navy" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rq-red border-2 border-white" />
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-200 active:scale-95 transition-transform"
            aria-label="Profile"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-rq-primary font-bold">
                {firstName[0]?.toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-rq-navy leading-tight">
        Good morning,
        <br />
        {firstName} 👋
      </h1>
      <div className="flex items-center gap-1.5 mt-1.5 text-sm text-rq-muted">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        {locationState === "found" && <span>GPS Active • Accuracy: {Math.round(location.accuracy)} m</span>}
        {locationState === "locating" && <span>Locating…</span>}
        {locationState === "unavailable" && <span>Location unavailable</span>}
      </div>

      <GlassCard variant="danger" className="mt-5 rq-rise">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-rq-red text-base tracking-wide leading-tight">EMERGENCY SOS</p>
            <p className="text-xs text-rq-muted mt-1">Tap to request immediate assistance</p>
          </div>
          <SosButton
            size={88}
            state={activeEmergency ? "active" : "default"}
            onClick={() => navigate(activeEmergency ? "/emergency/active" : "/emergency/activate")}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="rq-glass rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.97] transition-transform min-h-[64px]"
          >
            <IconBadge icon={a.icon} tone={a.tone} />
            <span className="text-sm font-semibold text-rq-navy leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      <GlassCard
        onClick={() => navigate(activeEmergency ? "/emergency/active" : "#")}
        className="mt-4 flex items-center gap-3"
      >
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
            activeEmergency ? "bg-rq-red/10" : "bg-rq-success/10"
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${activeEmergency ? "text-rq-red" : "text-rq-success"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${activeEmergency ? "text-rq-red" : "text-rq-success"}`}>
            {activeEmergency ? "Emergency Active" : "No Active Emergency"}
          </p>
          <p className="text-xs text-rq-muted">
            {activeEmergency
              ? "Tap to view live status."
              : "You are safe. Tap the SOS button if you need immediate help."}
          </p>
        </div>
        {activeEmergency && <ChevronRight className="w-4 h-4 text-rq-muted flex-shrink-0" />}
      </GlassCard>

      <div className="mt-5">
        <SectionHeader title="Nearby Hospitals" actionLabel="View All" onAction={() => navigate("/emergency/hospitals")} />
        <div className="space-y-2.5">
          {hospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-5">
          <SectionHeader title="Recent Activity" actionLabel="View All" onAction={() => navigate("/notifications")} />
          <div className="space-y-2">
            {recent.map((n) => (
              <GlassCard key={n.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rq-success/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-rq-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rq-navy">{n.title}</p>
                  <p className="text-xs text-rq-muted">{n.message}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}