import { base44 } from "@/api/base44Client";

// Backend-ready service layer for the emergency state machine.
// UI never calls base44.entities.EmergencyRequest directly — only through here,
// so a real backend/API can later replace the entity calls without a UI rewrite.

export const STAGE_LABELS = {
  draft: "Report Started",
  details_completed: "Details Added",
  evidence_collected: "Evidence Collected",
  location_confirmed: "Location Confirmed",
  awaiting_confirmation: "Awaiting Confirmation",
  confirmed: "Report Sent",
  active: "Teams Notified",
  ambulance_assigned: "Ambulance Assigned",
  en_route: "Response On Way",
  arrived: "Arrived at Scene",
  handover: "Handover Started",
  completed: "Handover Completed",
  cancelled: "Cancelled",
};

async function pushTimeline(id, stage) {
  const record = await base44.entities.EmergencyRequest.get(id);
  const timeline = [...(record.timeline || []), { stage, label: STAGE_LABELS[stage], timestamp: new Date().toISOString() }];
  return base44.entities.EmergencyRequest.update(id, { timeline });
}

export async function createDraft(data) {
  const record = await base44.entities.EmergencyRequest.create({ ...data, status: "draft" });
  await pushTimeline(record.id, "draft");
  return record;
}

export async function updateEmergency(id, data) {
  return base44.entities.EmergencyRequest.update(id, data);
}

export async function advanceStatus(id, status) {
  await base44.entities.EmergencyRequest.update(id, { status });
  return pushTimeline(id, status);
}

export async function getEmergency(id) {
  return base44.entities.EmergencyRequest.get(id);
}

export async function getActiveEmergency() {
  const active = await base44.entities.EmergencyRequest.filter(
    { status: "active" },
    "-created_date",
    1
  );
  if (active.length) return active[0];
  const others = await base44.entities.EmergencyRequest.filter(
    { status: "ambulance_assigned" },
    "-created_date",
    1
  );
  if (others.length) return others[0];
  const enRoute = await base44.entities.EmergencyRequest.filter({ status: "en_route" }, "-created_date", 1);
  return enRoute[0] || null;
}

export async function getHistory() {
  return base44.entities.EmergencyRequest.filter(
    { status: "completed" },
    "-created_date",
    50
  );
}

export async function confirmEmergency(id) {
  await advanceStatus(id, "confirmed");
  await advanceStatus(id, "active");
  return getEmergency(id);
}

export async function cancelEmergency(id) {
  return advanceStatus(id, "cancelled");
}