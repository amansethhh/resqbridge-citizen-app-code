import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Siren, MapPin, Ambulance } from "lucide-react";
import AppLogo from "@/components/resqbridge/AppLogo";
import { TAGLINE } from "@/constants/brand";
import { PrimaryButton, SecondaryButton } from "@/components/resqbridge/Buttons";
import AppShell from "@/components/resqbridge/AppShell";

const SLIDES = [
  {
    icon: Siren,
    step: 1,
    title: "Request Emergency Assistance",
    desc: "Get help quickly with a simple and guided emergency request process.",
  },
  {
    icon: MapPin,
    step: 2,
    title: "Share Evidence & Location",
    desc: "Provide your location, photos, voice or text information to help responders understand the situation.",
  },
  {
    icon: Ambulance,
    step: 3,
    title: "Track Help Until You're Safe",
    desc: "See real-time ambulance tracking, hospital coordination and status updates until the emergency is completed.",
  },
];

function finishOnboarding(navigate, to) {
  localStorage.setItem("rq_onboarding_seen", "true");
  navigate(to);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  return (
    <AppShell>
      <div className="flex flex-col flex-1 min-h-0 px-6 pt-6 rq-content-bottom">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => finishOnboarding(navigate, "/login")}
            className="text-sm font-medium text-rq-muted px-3 py-2 min-h-[40px]"
          >
            Skip
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <AppLogo size="lg" showText={false} />
          <h1 className="text-3xl font-extrabold text-rq-navy leading-tight mt-3">
            Welcome to Res<span className="text-rq-primary">Q</span>Bridge
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-rq-muted mt-2">{TAGLINE}</p>
          <p className="text-rq-muted text-sm mt-3 max-w-xs">
            AI-powered emergency response connecting citizens, ambulances and hospitals for a safer tomorrow.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
          {SLIDES.map((s, i) => {
            const selected = slide === i;
            return (
              <div
                key={s.step}
                className={`rounded-3xl transition-all ${selected ? "ring-2 ring-rq-primary shadow-lg shadow-rq-primary/20" : ""}`}
              >
                <button
                  onClick={() => setSlide(i)}
                  className={`w-full rq-glass rounded-3xl p-4 flex items-center gap-4 text-left transition-all ${selected ? "" : "opacity-70"}`}
                >
                  <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "rq-btn-primary text-white" : "bg-rq-primary/10 text-rq-primary"}`}>
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-rq-navy">{s.title}</p>
                    <p className="text-xs text-rq-muted mt-0.5">{s.desc}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${selected ? "rq-icon-badge" : "bg-gradient-to-br from-rq-primary/10 to-rq-cyan/10"}`}>
                    <s.icon className={`w-6 h-6 transition-colors ${selected ? "text-rq-primary" : "text-rq-primary/70"}`} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-1.5 mt-5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${slide === i ? "w-6 bg-rq-primary" : "w-1.5 bg-slate-300"}`}
            />
          ))}
        </div>

        <div className="space-y-3 mt-5">
          <PrimaryButton onClick={() => finishOnboarding(navigate, "/register")}>Create Account</PrimaryButton>
          <SecondaryButton onClick={() => finishOnboarding(navigate, "/login")}>Sign In</SecondaryButton>
        </div>
      </div>
    </AppShell>
  );
}