import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Mic, FileText, ShieldCheck, Video } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import MobileProgress from "@/components/resqbridge/MobileProgress";
import GlassCard from "@/components/resqbridge/GlassCard";
import EvidenceCard from "@/components/resqbridge/EvidenceCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { Textarea } from "@/components/ui/textarea";
import { getEmergency, updateEmergency, advanceStatus } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function MultimodalEvidence() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [evidence, setEvidence] = useState([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    getEmergency(draftId).then((rec) => setEvidence(rec.evidence || []));
  }, [draftId]);

  const removeEvidence = async (idx) => {
    const next = evidence.filter((_, i) => i !== idx);
    setEvidence(next);
    await updateEmergency(draftId, { evidence: next });
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const next = [...evidence, { type: "note", name: "Note", text: note.trim() }];
    setEvidence(next);
    await updateEmergency(draftId, { evidence: next });
    setNote("");
    setNoteOpen(false);
  };

  const handleContinue = async () => {
    if (!draftId) return navigate("/emergency/activate");
    setSaving(true);
    try {
      await advanceStatus(draftId, "evidence_collected");
      const hasImage = evidence.some((e) => e.type === "image");
      navigate(hasImage ? "/emergency/ai-analysis" : "/emergency/location");
    } finally {
      setSaving(false);
    }
  };

  const actions = [
    { label: "Take Photo", sub: "Capture current situation", icon: Camera, path: "/emergency/camera" },
    { label: "Record Video", sub: "Coming soon", icon: Video, disabled: true },
    { label: "Record Audio", sub: "Explain what happened", icon: Mic, path: "/emergency/voice" },
    { label: "Add Note", sub: "Write additional details", icon: FileText, action: () => setNoteOpen(true) },
  ];

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Multimodal <span className="text-rq-primary">Evidence</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Share photos, audio or notes to help responders understand the situation better.
        </p>
        <MobileProgress current={3} total={3} label="Provide Evidence" />

        <p className="font-semibold text-rq-navy mt-5 mb-3">Add Evidence</p>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <GlassCard
              key={a.label}
              onClick={a.disabled ? undefined : a.action || (() => navigate(a.path))}
              className={`flex flex-col items-center text-center gap-1.5 min-h-[112px] ${a.disabled ? "opacity-50" : ""}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-rq-primary/10 flex items-center justify-center">
                <a.icon className="w-5 h-5 text-rq-primary" />
              </div>
              <p className="text-sm font-bold text-rq-navy">{a.label}</p>
              <p className="text-[11px] text-rq-muted">{a.sub}</p>
            </GlassCard>
          ))}
        </div>

        {noteOpen && (
          <GlassCard className="mt-3">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write additional details..." className="bg-white/70" autoFocus />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setNoteOpen(false)} className="flex-1 h-11 rounded-xl text-sm font-medium text-rq-muted">Cancel</button>
              <button onClick={addNote} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-rq-primary text-white">Add</button>
            </div>
          </GlassCard>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="font-semibold text-rq-navy">Attached Evidence ({evidence.length})</p>
        </div>
        {evidence.length === 0 ? (
          <p className="text-sm text-rq-muted mt-2">No evidence added yet. This step is optional.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {evidence.map((e, i) => (
              <EvidenceCard key={i} item={e} onRemove={() => removeEvidence(i)} />
            ))}
          </div>
        )}

        <div className="mt-4 p-3 rounded-2xl bg-rq-primary/5 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-rq-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rq-muted">All evidence is securely stored and shared only with authorized emergency responders.</p>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={handleContinue} loading={saving}>Continue</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}