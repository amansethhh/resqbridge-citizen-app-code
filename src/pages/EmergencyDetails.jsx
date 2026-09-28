import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, UserMinus, UserX } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import MobileProgress from "@/components/resqbridge/MobileProgress";
import GlassCard from "@/components/resqbridge/GlassCard";
import SelectableBox from "@/components/resqbridge/SelectableBox";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import AppShell from "@/components/resqbridge/AppShell";
import { Textarea } from "@/components/ui/textarea";
import { PATIENT_CONDITIONS, SEVERITY_LEVELS, SYMPTOMS } from "@/constants/emergencyTypes";
import { updateEmergency, advanceStatus } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

const CONDITION_ICONS = { UserCheck, UserMinus, UserX };
const SEVERITY_STYLE = {
  mild: "border-rq-success text-rq-success bg-rq-success/10",
  moderate: "border-rq-warning text-amber-600 bg-rq-warning/10",
  severe: "border-orange-500 text-orange-500 bg-orange-50",
  life_threatening: "border-rq-red text-rq-red bg-rq-red/10",
};

export default function EmergencyDetails() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [condition, setCondition] = useState("conscious");
  const [severity, setSeverity] = useState("moderate");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (id) =>
    setSymptoms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleContinue = async () => {
    if (!draftId) return navigate("/emergency/activate");
    setSaving(true);
    try {
      await updateEmergency(draftId, {
        patient_condition: condition,
        severity,
        symptoms,
        additional_notes: notes,
      });
      await advanceStatus(draftId, "details_completed");
      navigate("/emergency/evidence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">Emergency Details</h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Provide a few details so we can get you the right help quickly.
        </p>
        <MobileProgress current={2} total={3} label="Add Details" />

        <GlassCard className="mb-3">
          <p className="font-semibold text-rq-navy mb-1">Patient Condition</p>
          <p className="text-xs text-rq-muted mb-3">Is the person conscious?</p>
          <div className="grid grid-cols-3 gap-2">
            {PATIENT_CONDITIONS.map((c) => {
              const Icon = CONDITION_ICONS[c.icon];
              const active = condition === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border text-xs font-medium min-h-[52px] ${
                    active ? "border-rq-primary bg-rq-primary/10 text-rq-primary" : "border-border bg-white/60 text-rq-navy"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="mb-3">
          <p className="font-semibold text-rq-navy mb-1">Severity Level</p>
          <p className="text-xs text-rq-muted mb-3">How severe is the situation?</p>
          <div className="grid grid-cols-2 gap-2">
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeverity(s.id)}
                className={`py-3 rounded-xl border text-sm font-semibold min-h-[48px] ${
                  severity === s.id ? SEVERITY_STYLE[s.id] : "border-border bg-white/60 text-rq-navy"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-3">
          <p className="font-semibold text-rq-navy mb-1">Symptoms / Situation</p>
          <p className="text-xs text-rq-muted mb-3">Select the main symptoms (multiple allowed)</p>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOMS.map((s) => (
              <SelectableBox
                key={s.id}
                label={s.label}
                selected={symptoms.includes(s.id)}
                onClick={() => toggleSymptom(s.id)}
                tone="danger"
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-3">
          <p className="font-semibold text-rq-navy mb-2">
            Additional Details <span className="text-xs text-rq-muted font-normal">(Optional)</span>
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="e.g. Patient is having severe chest pain and difficulty breathing since 10 minutes..."
            className="bg-white/70 min-h-[90px]"
          />
          <p className="text-right text-xs text-rq-muted mt-1">{notes.length}/500</p>
        </GlassCard>

        <div className="mt-2">
          <PrimaryButton onClick={handleContinue} loading={saving}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}