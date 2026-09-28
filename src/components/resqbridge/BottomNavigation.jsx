import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, User, Clock, Radio, Phone } from "lucide-react";
import { useEmergency } from "@/state/EmergencyContext";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeEmergency, unreadCount } = useEmergency();

  const secondItem = activeEmergency
    ? { label: "Tracking", icon: Radio, path: "/emergency/tracking" }
    : { label: "History", icon: Clock, path: "/profile?tab=history" };

  const items = [
    { label: "Home", icon: Home, path: "/" },
    secondItem,
    {
      label: "Emergency",
      icon: Phone,
      path: activeEmergency ? "/emergency/active" : "/emergency/activate",
      isEmergency: true,
    },
    { label: "Alerts", icon: Bell, path: "/notifications", badge: unreadCount },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path.split("?")[0];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 rq-glass-strong border-t border-white/70 rq-safe-bottom">
      <div className="flex items-stretch justify-around px-1.5 pt-1.5 pb-1">
        {items.map((item) => {
          if (item.isEmergency) {
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-0.5 -mt-5 px-2"
                aria-label={item.label}
              >
                <div
                  className="relative w-14 h-14 rounded-full bg-gradient-to-br from-rq-red to-rq-redDark text-white flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    boxShadow:
                      "inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(120,10,10,0.4), 0 10px 20px -6px rgba(226,54,54,0.55)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <item.icon className="w-6 h-6 relative" strokeWidth={2.3} />
                </div>
                <span className="text-[10px] font-semibold text-rq-red">{item.label}</span>
              </button>
            );
          }
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl transition-all ${
                active ? "text-rq-primary bg-rq-primary/8" : "text-slate-400"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <item.icon className="w-5 h-5" />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rq-red text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}