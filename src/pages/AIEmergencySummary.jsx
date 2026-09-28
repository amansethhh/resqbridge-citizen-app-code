import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, MapPin, Car, Users, Download, Send, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton, SecondaryButton } from "@/components/resqbridge/Buttons";
import { Image } from "@/components/ui/image";
import { getEmergency } from "@/services/emergencyService";
import { getSignedUrl } from "@/services/fileService";
import { emergencyTypeById } from "@/constants/emergencyTypes";
import { useEmergency } from "@/state/EmergencyContext";

export default function AIEmergencySummary() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [record, setRecord] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!draftId) return navigate("/emergency/activate");
    getEmergency(draftId).then(async (rec) => {
      setRecord(rec);
      const image = (rec.evidence || []).find((e) => e.type === "image");
      if (image) setImageUrl(await getSignedUrl(image.url));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  if (!record) return null;

  const typeInfo = emergencyTypeById(record.type);
  const photoCount = (record.evidence || []).filter((e) => e.type === "image").length;
  const analysis = record.ai_analysis || {};

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ResQBridge Emergency Summary", 14, 18);
    doc.setFontSize(11);
    let y = 30;
    const line = (label, value) => {
      doc.text(`${label}: ${value || "-"}`, 14, y);
      y += 8;
    };
    line("Type", typeInfo?.label);
    line("Severity", record.severity);
    line("Date", new Date(record.created_date).toLocaleString());
    line("Location", record.location_lat ? `${record.location_lat}, ${record.location_lng}` : "Unavailable");
    y += 2;
    doc.setFontSize(12);
    doc.text("AI Summary:", 14, y);
    y += 7;
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(record.ai_summary || "No summary available.", 180);
    doc.text(splitSummary, 14, y);
    doc.save("resqbridge-emergency-summary.pdf");
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader
          right={
            <span className="text-xs font-semibold text-rq-primary bg-rq-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Analysis
            </span>
          }
        />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          AI Emergency <span className="text-rq-primary">Summary</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">Here is the AI-generated summary based on the evidence you provided.</p>

        <div className="flex gap-3">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 relative">
            {imageUrl ? <Image src={imageUrl} alt="Evidence" className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-rq-muted text-xs">No photo</div>}
            {photoCount > 0 && (
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{photoCount} Photo{photoCount > 1 ? "s" : ""}</span>
            )}
          </div>
          <GlassCard className="flex-1 !p-3 border border-rq-red/20 !bg-rq-red/5">
            <p className="text-rq-red font-bold text-sm flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {record.severity?.replace("_", " ")}</p>
            <div className="mt-2 space-y-1.5 text-xs text-rq-muted">
              <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(record.created_date).toLocaleString()}</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {record.location_lat ? `${record.location_lat.toFixed(4)}, ${record.location_lng.toFixed(4)}` : "Not set"}</p>
              <p className="flex items-center gap-1.5"><Car className="w-3 h-3" /> {typeInfo?.label}</p>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mt-4">
          <p className="font-semibold text-rq-navy text-sm mb-2">Patient &amp; Symptoms</p>
          <div className="space-y-1.5 text-sm">
            <p className="flex gap-2"><span className="text-rq-muted w-28 flex-shrink-0">Condition</span><span className="text-rq-navy capitalize">{record.patient_condition?.replace(/_/g, " ") || "Not provided"}</span></p>
            <p className="flex gap-2"><span className="text-rq-muted w-28 flex-shrink-0">Severity</span><span className="text-rq-navy capitalize">{record.severity?.replace(/_/g, " ") || "Not provided"}</span></p>
            <p className="flex gap-2"><span className="text-rq-muted w-28 flex-shrink-0">Symptoms</span><span className="text-rq-navy">{record.symptoms?.length ? record.symptoms.join(", ") : "Not provided"}</span></p>
            <p className="flex gap-2"><span className="text-rq-muted w-28 flex-shrink-0">Notes</span><span className="text-rq-navy">{record.additional_notes || "Not provided"}</span></p>
          </div>
        </GlassCard>

        {(record.evidence || []).some((e) => e.type === "audio") && (
          <GlassCard className="mt-3">
            <p className="font-semibold text-rq-navy text-sm mb-1">Voice Evidence</p>
            <p className="text-sm text-rq-muted">{(record.evidence || []).find((e) => e.type === "audio")?.text || "Transcription unavailable"}</p>
          </GlassCard>
        )}

        <GlassCard className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rq-primary to-rq-cyan flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="font-semibold text-rq-navy text-sm">AI Generated Summary</p>
          </div>
          <p className="text-sm text-rq-muted leading-relaxed">{record.ai_summary || "A summary will appear here once evidence is analyzed."}</p>
        </GlassCard>

        {analysis.detected_objects?.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold text-rq-navy mb-2">Detected Elements</p>
            <div className="grid grid-cols-3 gap-2">
              {analysis.detected_objects.map((o, i) => (
                <GlassCard key={i} className="text-center py-2">
                  <p className="text-xs font-bold text-rq-navy truncate">{o.label}</p>
                  <p className="text-[11px] text-rq-success font-semibold">{Math.round(o.confidence * 100)}%</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {analysis.suggestions?.length > 0 && (
          <GlassCard className="mt-4">
            <p className="font-semibold text-rq-navy mb-2 flex items-center gap-1.5"><Users className="w-4 h-4 text-rq-primary" /> AI Recommendations</p>
            <div className="flex flex-wrap gap-2">
              {analysis.suggestions.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-rq-primary/5 text-rq-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          </GlassCard>
        )}

        <div className="flex gap-3 mt-6">
          <SecondaryButton icon={Download} onClick={downloadPdf}>Save Summary</SecondaryButton>
          <PrimaryButton icon={Send} onClick={() => navigate("/emergency/location")}>Continue</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}