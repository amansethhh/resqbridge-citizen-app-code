import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle, Loader2, RefreshCw, Info } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { Image } from "@/components/ui/image";
import { getEmergency, updateEmergency, advanceStatus } from "@/services/emergencyService";
import { getSignedUrl } from "@/services/fileService";
import { analyzeEvidenceImage } from "@/services/aiService";
import { useEmergency } from "@/state/EmergencyContext";

const SEVERITY_STYLE = {
  low: { label: "Low", cls: "bg-rq-success/10 text-rq-success" },
  moderate: { label: "Moderate", cls: "bg-rq-warning/10 text-amber-600" },
  high: { label: "High", cls: "bg-rq-red/10 text-rq-red" },
};

export default function AIImageAnalysis() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [imageUrl, setImageUrl] = useState(null);
  const [status, setStatus] = useState("processing");
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);

  const run = async () => {
    if (!draftId) return navigate("/emergency/activate");
    setStatus("processing");
    const rec = await getEmergency(draftId);
    setRecord(rec);
    const image = (rec.evidence || []).find((e) => e.type === "image");
    if (!image) {
      setStatus("unavailable");
      return;
    }
    const signed = await getSignedUrl(image.url);
    setImageUrl(signed);
    const description = rec.additional_notes || "";
    const res = await analyzeEvidenceImage({ imageUrl: signed, description, emergencyType: rec.type });
    if (res.status !== "success") {
      setStatus("error");
      return;
    }
    setResult(res);
    setStatus("success");
    await updateEmergency(draftId, {
      ai_analysis: {
        detected_objects: res.detected_objects,
        scene_notes: res.scene_notes,
        estimated_severity: res.estimated_severity,
        suggestions: res.suggestions,
        status: "success",
      },
      ai_summary: res.summary,
    });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const handleContinue = async () => {
    await advanceStatus(draftId, "evidence_collected");
    navigate("/emergency/ai-summary");
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader
          right={
            <span className="text-xs font-semibold text-rq-primary bg-rq-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Powered by AI
            </span>
          }
        />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          AI Image <span className="text-rq-primary">Analysis</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Our AI analyzes the image to detect key details and help responders understand the situation.
        </p>

        {imageUrl && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
            <Image src={imageUrl} alt="Evidence" className="w-full h-full" />
          </div>
        )}

        {status === "processing" && (
          <GlassCard className="mt-4 flex flex-col items-center gap-2 py-10">
            <Loader2 className="w-7 h-7 text-rq-primary animate-spin" />
            <p className="text-sm text-rq-muted">Analyzing image with AI…</p>
          </GlassCard>
        )}

        {status === "unavailable" && (
          <GlassCard className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
            <Info className="w-7 h-7 text-rq-muted" />
            <p className="text-sm text-rq-muted">No photo was attached, so there's nothing to analyze.</p>
            <PrimaryButton className="max-w-[200px] mt-2" onClick={() => navigate("/emergency/location")}>Skip to Location</PrimaryButton>
          </GlassCard>
        )}

        {status === "error" && (
          <GlassCard className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
            <AlertTriangle className="w-7 h-7 text-rq-red" />
            <p className="text-sm text-rq-muted">AI analysis is unavailable right now.</p>
            <div className="flex gap-2 w-full max-w-xs mt-2">
              <button onClick={run} className="flex-1 h-11 rounded-xl border border-rq-primary/20 text-rq-primary font-semibold flex items-center justify-center gap-1.5 text-sm active:scale-[0.97] transition-transform">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          </GlassCard>
        )}

        {status === "success" && result && (
          <>
            <p className="font-semibold text-rq-navy mt-5 mb-2">Detected Objects</p>
            <div className="grid grid-cols-3 gap-2">
              {result.detected_objects?.map((o, i) => (
                <GlassCard key={i} className="text-center py-2.5">
                  <p className="text-sm font-bold text-rq-navy truncate">{o.label}</p>
                  <p className="text-[11px] text-rq-muted">Confidence</p>
                  <p className="text-sm font-bold text-rq-success">{Math.round(o.confidence * 100)}%</p>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-rq-navy">Scene Analysis</p>
                <span className="text-xs text-rq-success font-semibold">Analysis Complete</span>
              </div>
              <ul className="space-y-1.5">
                {result.scene_notes?.map((n, i) => (
                  <li key={i} className="text-sm text-rq-muted flex gap-2">
                    <span className="text-rq-primary">•</span> {n}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="mt-3">
              <p className="font-semibold text-rq-navy mb-2">Estimated Severity</p>
              <div className={`rounded-xl px-3 py-2 font-bold text-sm flex items-center gap-2 ${SEVERITY_STYLE[result.estimated_severity]?.cls}`}>
                <AlertTriangle className="w-4 h-4" /> {SEVERITY_STYLE[result.estimated_severity]?.label}
              </div>
              <p className="text-xs text-rq-muted mt-2">
                This is an AI-generated visual estimate to assist responders — not a medical diagnosis.
              </p>
            </GlassCard>

            <GlassCard className="mt-3">
              <p className="font-semibold text-rq-navy mb-2">AI Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions?.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-rq-primary/5 text-rq-primary text-xs font-medium">{s}</span>
                ))}
              </div>
            </GlassCard>

            <div className="mt-6">
              <PrimaryButton onClick={handleContinue}>Confirm & Add to Report</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}