import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Users, MapPin, ShieldCheck, FileImage, Send } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getEmergency, confirmEmergency, cancelEmergency } from "@/services/emergencyService";
import { listContacts, notifyAllContacts } from "@/services/familyService";
import { createNotification } from "@/services/notificationService";
import { emergencyTypeById } from "@/constants/emergencyTypes";
import { useEmergency } from "@/state/EmergencyContext";

const EditButton = ({ onClick }) => (
  <button onClick={onClick} className="w-9 h-9 flex items-center justify-center rounded-full text-rq-primary active:scale-95 transition-transform flex-shrink-0" aria-label="Edit">
    <Pencil className="w-4 h-4" />
  </button>
);

export default function EmergencyConfirmation() {
  const navigate = useNavigate();
  const { draftId, setDraft, refreshActive } = useEmergency();
  const [record, setRecord] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draftId) return navigate("/emergency/activate");
    getEmergency(draftId).then(setRecord);
    listContacts().then(setContacts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  if (!record) return null;
  const typeInfo = emergencyTypeById(record.type);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await confirmEmergency(draftId);
      await createNotification({
        title: "Emergency Reported",
        message: "Your emergency has been successfully reported. Response team has been notified.",
        category: "emergency",
        related_emergency_id: draftId,
      });
      if (record.hospital_name) {
        await createNotification({
          title: "Nearby Hospitals Alerted",
          message: `${record.hospital_name} has been notified about your emergency.`,
          category: "emergency",
          related_emergency_id: draftId,
        });
      }
      if (contacts.length) {
        await notifyAllContacts();
        await createNotification({
          title: "Family Notified",
          message: `${contacts.length} family member(s) have been notified about your emergency.`,
          category: "family",
          related_emergency_id: draftId,
        });
      }
      await refreshActive();
      setDraft(null);
      navigate("/emergency/active");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const handleCancel = async () => {
    await cancelEmergency(draftId);
    setDraft(null);
    navigate("/");
  };

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">Emergency Confirmation</h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">Review everything before we send this to the emergency team.</p>

        <GlassCard className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-rq-muted">Emergency Type</p>
            <p className="font-bold text-rq-navy">{typeInfo?.label}</p>
            <p className="text-xs text-rq-red font-semibold mt-0.5">{record.severity?.replace("_", " ")}</p>
          </div>
          <EditButton onClick={() => navigate("/emergency/activate")} />
        </GlassCard>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-rq-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rq-muted">Location</p>
              <p className="text-sm font-semibold text-rq-navy">
                {record.location_lat ? `${record.location_lat.toFixed(4)}, ${record.location_lng.toFixed(4)}` : "Not set"}
              </p>
            </div>
          </div>
          <EditButton onClick={() => navigate("/emergency/location")} />
        </GlassCard>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-rq-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rq-muted">Selected Hospital</p>
              <p className="text-sm font-semibold text-rq-navy">{record.hospital_name || "Not selected"}</p>
            </div>
          </div>
          <EditButton onClick={() => navigate("/emergency/hospitals")} />
        </GlassCard>

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FileImage className="w-4 h-4 text-rq-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rq-muted">Evidence Attached</p>
              <p className="text-sm font-semibold text-rq-navy">{(record.evidence || []).length} item(s)</p>
            </div>
          </div>
          <EditButton onClick={() => navigate("/emergency/evidence")} />
        </GlassCard>

        {record.ai_summary && (
          <GlassCard className="mt-3">
            <p className="text-xs text-rq-muted mb-1">AI Summary</p>
            <p className="text-sm text-rq-navy line-clamp-3">{record.ai_summary}</p>
          </GlassCard>
        )}

        <GlassCard className="mt-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-rq-primary flex-shrink-0" />
          <p className="text-sm text-rq-navy">{contacts.length} emergency contact(s) will be notified</p>
        </GlassCard>

        <div className="space-y-3 mt-6">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full h-14 rounded-2xl font-bold text-white bg-gradient-to-r from-rq-red to-rq-redDark shadow-xl shadow-rq-red/40 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Send className="w-5 h-5" /> Confirm Emergency Request
          </button>
          <button onClick={() => setCancelOpen(true)} className="w-full h-11 text-sm font-semibold text-rq-muted">
            Cancel
          </button>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="max-w-[92%] w-[92%] sm:max-w-[92%] rounded-3xl p-5 gap-4">
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-lg font-bold text-rq-navy">Send this emergency request?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-rq-muted">
                This will immediately notify the response team{record.hospital_name ? `, ${record.hospital_name}` : ""}
                {contacts.length ? `, and ${contacts.length} family contact(s)` : ""}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              <AlertDialogAction
                disabled={submitting}
                onClick={handleConfirm}
                className="rq-btn-danger h-12 rounded-2xl text-white border-0 w-full font-semibold"
              >
                {submitting ? "Sending…" : "Yes, Send Now"}
              </AlertDialogAction>
              <AlertDialogCancel className="rq-btn-glass h-12 rounded-2xl border-0 text-rq-navy w-full font-semibold mt-0">
                Go Back
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent className="max-w-[92%] w-[92%] sm:max-w-[92%] rounded-3xl p-5 gap-4">
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-lg font-bold text-rq-navy">Cancel this emergency report?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-rq-muted">Your draft report and evidence will be discarded.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              <AlertDialogAction
                onClick={handleCancel}
                className="rq-btn-danger h-12 rounded-2xl text-white border-0 w-full font-semibold"
              >
                Yes, Cancel
              </AlertDialogAction>
              <AlertDialogCancel className="rq-btn-glass h-12 rounded-2xl border-0 text-rq-navy w-full font-semibold mt-0">
                Keep Editing
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}