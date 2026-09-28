import React, { useEffect, useState } from "react";
import { Plus, Radio, Trash2, ShieldCheck, Share2 } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import StatusBadge from "@/components/resqbridge/StatusBadge";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { listContacts, addContact, removeContact } from "@/services/familyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function FamilySharing() {
  const { activeEmergency } = useEmergency();
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });
  const [saving, setSaving] = useState(false);

  const load = () => listContacts().then(setContacts);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    try {
      await addContact(form);
      setForm({ name: "", phone: "", relation: "" });
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    await removeContact(id);
    load();
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/emergency/tracking`;
    if (navigator.share) {
      try { await navigator.share({ title: "ResQBridge Live Tracking", url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
  };

  const notifiedCount = contacts.filter((c) => c.notified).length;

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader right={activeEmergency ? <StatusBadge variant="danger">Emergency Active</StatusBadge> : null} />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Family <span className="text-rq-primary">Sharing</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-4">
          Keep your family informed in real-time during emergencies. Share live location, ambulance status and important updates.
        </p>

        {activeEmergency && notifiedCount > 0 && (
          <GlassCard className="!bg-rq-success/5 border border-rq-success/15 flex items-center justify-between">
            <p className="text-sm font-semibold text-rq-success">Family Notified</p>
            <span className="text-xs text-rq-muted">{notifiedCount} member(s) notified</span>
          </GlassCard>
        )}

        <div className="flex items-center justify-between mt-4 mb-2">
          <p className="font-semibold text-rq-navy">Your Family ({contacts.length})</p>
          <button onClick={() => setOpen(true)} className="text-sm font-semibold text-rq-primary flex items-center gap-1 min-h-[40px]">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        <div className="space-y-2.5">
          {contacts.map((c) => (
            <GlassCard key={c.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rq-primary/10 text-rq-primary flex items-center justify-center font-bold flex-shrink-0">
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-rq-navy text-sm">{c.name} {c.relation && <span className="text-rq-muted text-xs">· {c.relation}</span>}</p>
                <p className="text-xs text-rq-muted">{c.phone}</p>
              </div>
              {c.notified && <StatusBadge variant="success">Notified</StatusBadge>}
              {activeEmergency && (
                <button className="text-rq-primary text-xs font-semibold flex items-center gap-1 min-w-[44px] min-h-[44px] justify-center">
                  <Radio className="w-3.5 h-3.5" /> Track
                </button>
              )}
              <button onClick={() => handleRemove(c.id)} className="w-9 h-9 flex items-center justify-center rounded-full text-rq-muted active:scale-95 transition-transform flex-shrink-0" aria-label="Remove contact">
                <Trash2 className="w-4 h-4" />
              </button>
            </GlassCard>
          ))}
          {contacts.length === 0 && (
            <p className="text-sm text-rq-muted text-center py-8">No family contacts added yet. Add one so they can be reached during an emergency.</p>
          )}
        </div>

        {activeEmergency && (
          <div className="mt-5 space-y-3">
            <button onClick={shareLink} className="w-full h-12 rounded-2xl font-semibold text-rq-navy rq-glass-subtle border border-white/60 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
              <Share2 className="w-4 h-4" /> Share Tracking Link
            </button>
          </div>
        )}

        <div className="mt-4 p-3 rounded-2xl bg-rq-primary/5 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-rq-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rq-muted">Your emergency information is only shared with contacts you explicitly add here — never automatically.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Relation (e.g. Mom, Dad)" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
            </div>
            <DialogFooter>
              <PrimaryButton onClick={handleAdd} loading={saving}>Add Member</PrimaryButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}