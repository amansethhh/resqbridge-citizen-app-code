import React, { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Shield, Info, LogOut, ChevronRight } from "lucide-react";
import GlassCard from "./GlassCard";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";

const NOTIF_KEYS = [
  { key: "emergency", label: "Emergency alerts" },
  { key: "family", label: "Family notifications" },
  { key: "ambulance", label: "Ambulance updates" },
  { key: "hospital", label: "Hospital updates" },
];

const DEFAULT_NOTIF = { emergency: true, family: true, ambulance: true, hospital: true };

function applyTheme(t) {
  const dark =
    t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function SettingsPanel() {
  const [theme, setTheme] = useState(() => localStorage.getItem("rq_theme") || "system");
  const [notif, setNotif] = useState(() => {
    try {
      return { ...DEFAULT_NOTIF, ...JSON.parse(localStorage.getItem("rq_notif") || "{}") };
    } catch {
      return DEFAULT_NOTIF;
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeTheme = (t) => {
    setTheme(t);
    localStorage.setItem("rq_theme", t);
  };

  const toggleNotif = (k) =>
    setNotif((n) => {
      const v = { ...n, [k]: !n[k] };
      localStorage.setItem("rq_notif", JSON.stringify(v));
      return v;
    });

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-xs font-semibold text-rq-muted uppercase tracking-wide px-1 mb-1.5">Appearance</p>
        <GlassCard>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => changeTheme(o.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium min-h-[52px] transition-all active:scale-[0.97] ${
                  theme === o.id ? "border-rq-primary bg-rq-primary/10 text-rq-primary" : "border-border bg-white/60 text-rq-navy"
                }`}
              >
                <o.icon className="w-4 h-4" /> {o.label}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div>
        <p className="text-xs font-semibold text-rq-muted uppercase tracking-wide px-1 mb-1.5">Notifications</p>
        <GlassCard className="space-y-3">
          {NOTIF_KEYS.map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <span className="text-sm text-rq-navy">{n.label}</span>
              <Switch checked={notif[n.key]} onCheckedChange={() => toggleNotif(n.key)} aria-label={n.label} />
            </div>
          ))}
        </GlassCard>
      </div>

      <div>
        <p className="text-xs font-semibold text-rq-muted uppercase tracking-wide px-1 mb-1.5">Privacy</p>
        <GlassCard className="flex items-center justify-between">
          <span className="text-sm text-rq-navy flex items-center gap-2">
            <Shield className="w-4 h-4 text-rq-muted" /> Evidence &amp; location privacy
          </span>
          <ChevronRight className="w-4 h-4 text-rq-muted" />
        </GlassCard>
      </div>

      <div>
        <p className="text-xs font-semibold text-rq-muted uppercase tracking-wide px-1 mb-1.5">About</p>
        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-sm text-rq-navy flex items-center gap-2">
              <Info className="w-4 h-4 text-rq-muted" /> App version
            </span>
            <span className="text-xs text-rq-muted">1.0.0</span>
          </div>
        </GlassCard>
      </div>

      <button onClick={() => base44.auth.logout("/login")} className="w-full">
        <GlassCard className="flex items-center justify-between !bg-rq-red/5 border border-rq-red/15">
          <span className="text-sm font-semibold text-rq-red flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Log Out
          </span>
        </GlassCard>
      </button>
    </div>
  );
}