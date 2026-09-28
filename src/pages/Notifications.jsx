import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Ambulance, Users, Settings, MapPin, ChevronRight } from "lucide-react";
import AppLogo from "@/components/resqbridge/AppLogo";
import GlassCard from "@/components/resqbridge/GlassCard";
import Chip from "@/components/resqbridge/Chip";
import { listNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";
import { useEmergency } from "@/state/EmergencyContext";

const CATEGORY_ICON = { emergency: AlertTriangle, tracking: Ambulance, family: Users, system: Settings };
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "emergency", label: "Emergency" },
  { id: "tracking", label: "Tracking" },
  { id: "family", label: "Family" },
  { id: "system", label: "System" },
];

export default function Notifications() {
  const navigate = useNavigate();
  const { refreshUnread } = useEmergency();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => listNotifications().then(setItems);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => (filter === "all" ? items : items.filter((n) => n.category === filter)), [items, filter]);
  const isToday = (d) => new Date(d).toDateString() === new Date().toDateString();
  const today = filtered.filter((n) => isToday(n.created_date));
  const earlier = filtered.filter((n) => !isToday(n.created_date));

  const handleOpen = async (n) => {
    if (!n.read) await markAsRead(n.id);
    refreshUnread();
    if (n.related_emergency_id) navigate("/emergency/active");
    load();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    refreshUnread();
    load();
  };

  const renderItem = (n) => {
    const Icon = CATEGORY_ICON[n.category] || Bell;
    return (
      <GlassCard key={n.id} onClick={() => handleOpen(n)} className={`flex items-start gap-3 ${!n.read ? "ring-1 ring-rq-primary/30" : ""}`}>
        <div className="w-9 h-9 rounded-full bg-rq-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-rq-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-rq-navy">{n.title}</p>
            {!n.read && <span className="w-2 h-2 rounded-full bg-rq-red flex-shrink-0" />}
          </div>
          <p className="text-xs text-rq-muted mt-0.5">{n.message}</p>
          <p className="text-[11px] text-rq-muted mt-1">{new Date(n.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-rq-muted flex-shrink-0 mt-1" />
      </GlassCard>
    );
  };

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-4">
        <AppLogo size="sm" />
      </div>
      <h1 className="text-2xl font-extrabold text-rq-navy">Notifications</h1>
      <p className="text-sm text-rq-muted mt-1 mb-4">Stay updated with real-time alerts, tracking updates and important information.</p>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} selected={filter === c.id} onClick={() => setFilter(c.id)} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="w-10 h-10 text-rq-muted mb-2" />
          <p className="text-sm text-rq-muted">You have no notifications yet.</p>
        </div>
      )}

      {today.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-rq-navy">Today</p>
            <button onClick={handleMarkAll} className="text-xs font-semibold text-rq-primary">Mark All as Read</button>
          </div>
          <div className="space-y-2">{today.map(renderItem)}</div>
        </div>
      )}

      {earlier.length > 0 && (
        <div>
          <p className="font-semibold text-rq-navy mb-2">Earlier</p>
          <div className="space-y-2">{earlier.map(renderItem)}</div>
        </div>
      )}
    </div>
  );
}