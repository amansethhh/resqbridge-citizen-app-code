import { base44 } from "@/api/base44Client";

export async function listNotifications() {
  return base44.entities.Notification.list("-created_date", 50);
}

export async function createNotification({ title, message, category, related_emergency_id }) {
  return base44.entities.Notification.create({ title, message, category, related_emergency_id, read: false });
}

export async function markAsRead(id) {
  return base44.entities.Notification.update(id, { read: true });
}

export async function markAllAsRead() {
  const items = await base44.entities.Notification.filter({ read: false });
  if (!items.length) return;
  await base44.entities.Notification.updateMany({ read: false }, { $set: { read: true } });
}

export async function getUnreadCount() {
  const items = await base44.entities.Notification.filter({ read: false });
  return items.length;
}