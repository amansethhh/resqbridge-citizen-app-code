import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Star, FileText, Home as HomeIcon, Clock, Milestone, ShieldCheck } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton, SecondaryButton } from "@/components/resqbridge/Buttons";
import { Textarea } from "@/components/ui/textarea";
import { getEmergency, updateEmergency } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function HandoverCompletion() {
  const navigate = useNavigate();
  const { refreshActive } = useEmergency();
  const [record, setRecord] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    getEmergency(id).then(setRecord);
    refreshActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!record) {
    return (
      <AppShell>
        <div className="px-5 pt-4 rq-content-bottom">
          <ScreenHeader />
          <p className="text-center text-rq-muted mt-20">No completed emergency to show.</p>
        </div>
      </AppShell>
    );
  }

  const timeline = record.timeline || [];
  const started = timeline.find((t) => t.stage === "draft" || t.stage === "confirmed")?.timestamp;
  const completed = timeline.find((t) => t.stage === "completed")?.timestamp;
  const responseMinutes = started && completed ? Math.max(1, Math.round((new Date(completed) - new Date(started)) / 60000)) : 31;

  const submitFeedback = async () => {
    await updateEmergency(record.id, { feedback_rating: rating, feedback_text: feedback });
    navigate("/");
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader showLogo={false} />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Handover <span className="text-rq-success">Completed</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-4">The patient has been successfully reached at the hospital and handed over to the medical team.</p>

        <GlassCard className="!bg-rq-success/5 border border-rq-success/15 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-rq-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-rq-success">Emergency Case Completed</p>
            <p className="text-xs text-rq-muted">Patient successfully handed over to the medical team.</p>
          </div>
          <p className="text-xs text-rq-muted text-right flex-shrink-0">{completed ? new Date(completed).toLocaleDateString() : ""}</p>
        </GlassCard>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <GlassCard className="text-center !p-2.5">
            <Clock className="w-4 h-4 text-rq-red mx-auto mb-1" />
            <p className="text-sm font-bold text-rq-navy">{responseMinutes} min</p>
            <p className="text-[10px] text-rq-muted">Response Time</p>
          </GlassCard>
          <GlassCard className="text-center !p-2.5">
            <Milestone className="w-4 h-4 text-rq-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-rq-navy">3.2 km</p>
            <p className="text-[10px] text-rq-muted">Distance</p>
          </GlassCard>
          <GlassCard className="text-center !p-2.5">
            <ShieldCheck className="w-4 h-4 text-rq-success mx-auto mb-1" />
            <p className="text-sm font-bold text-rq-success">Completed</p>
            <p className="text-[10px] text-rq-muted">Status</p>
          </GlassCard>
        </div>

        <GlassCard className="mt-3">
          <p className="font-semibold text-rq-navy mb-2">Hospital Details</p>
          <p className="text-sm text-rq-navy font-semibold">{record.hospital_name || "Nearest available hospital"}</p>
          <p className="text-xs text-rq-muted">Ambulance {record.ambulance_code} · Driver {record.ambulance_driver}</p>
        </GlassCard>

        <GlassCard className="mt-3">
          <p className="font-semibold text-rq-navy mb-3">Event Timeline</p>
          <div className="space-y-3">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-rq-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rq-navy">{t.label}</p>
                  <p className="text-xs text-rq-muted">{new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mt-3">
          <p className="font-semibold text-rq-navy mb-2">How was the service?</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform" aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}>
                <Star className={`w-6 h-6 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience (optional)..." className="bg-white/70" />
        </GlassCard>

        <div className="flex gap-3 mt-6">
          <SecondaryButton icon={FileText} onClick={() => navigate("/profile?tab=history")}>View Report</SecondaryButton>
          <PrimaryButton icon={HomeIcon} onClick={submitFeedback}>Back to Home</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}