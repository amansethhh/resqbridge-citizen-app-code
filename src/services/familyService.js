import { base44 } from "@/api/base44Client";

export async function listContacts() {
  return base44.entities.FamilyContact.list("-created_date", 50);
}

export async function addContact({ name, phone, relation }) {
  return base44.entities.FamilyContact.create({ name, phone, relation, notified: false });
}

export async function removeContact(id) {
  return base44.entities.FamilyContact.delete(id);
}

export async function notifyAllContacts() {
  const contacts = await listContacts();
  if (!contacts.length) return [];
  const ids = contacts.map((c) => c.id);
  await base44.entities.FamilyContact.bulkUpdate(
    ids.map((id) => ({ id, notified: true, notified_at: new Date().toISOString() }))
  );
  return listContacts();
}