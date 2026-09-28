import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Droplet, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLogo from "@/components/resqbridge/AppLogo";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton } from "@/components/resqbridge/Buttons";
import { addContact } from "@/services/familyService";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "male",
    blood_group: "",
    allergies: "",
    existing_conditions: "",
    medical_notes: "",
    contact_name: "",
    contact_phone: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        blood_group: form.blood_group,
        allergies: form.allergies,
        existing_conditions: form.existing_conditions,
        medical_notes: form.medical_notes,
        profile_completed: true,
      });
      if (form.contact_name && form.contact_phone) {
        await addContact({ name: form.contact_name, phone: form.contact_phone, relation: "Primary Contact" });
      }
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-5 rq-content-bottom">
        <div className="flex items-center justify-between mb-4">
          <AppLogo size="sm" />
          <button onClick={() => navigate("/")} className="text-sm font-medium text-rq-muted min-h-[40px]">
            Skip for now
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-rq-navy">
          Set Up Your <span className="text-rq-primary">Profile</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          This information helps us provide faster and more accurate assistance during an emergency.
        </p>

        <div className="space-y-4">
          <GlassCard>
            <p className="font-semibold text-rq-navy flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-rq-primary" /> Personal Information
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-rq-muted">Full Name</Label>
                <Input value={form.full_name} onChange={set("full_name")} placeholder="Enter your full name" className="mt-1 bg-white/70 h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-rq-muted">Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} className="mt-1 bg-white/70 h-11" />
                </div>
                <div>
                  <Label className="text-xs text-rq-muted">Gender</Label>
                  <select
                    value={form.gender}
                    onChange={set("gender")}
                    className="mt-1 w-full h-11 rounded-md border border-input bg-white/70 px-3 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-rq-muted flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="98765 43210" className="mt-1 bg-white/70 h-11" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-semibold text-rq-navy flex items-center gap-2 mb-3">
              <Droplet className="w-4 h-4 text-rq-primary" /> Medical Information <span className="text-xs text-rq-muted font-normal">(Optional)</span>
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-rq-muted">Blood Group</Label>
                <select
                  value={form.blood_group}
                  onChange={set("blood_group")}
                  className="mt-1 w-full h-11 rounded-md border border-input bg-white/70 px-3 text-sm"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-rq-muted">Known Allergies</Label>
                <Input value={form.allergies} onChange={set("allergies")} placeholder="e.g. Penicillin, Nuts" className="mt-1 bg-white/70 h-11" />
              </div>
              <div>
                <Label className="text-xs text-rq-muted">Existing Conditions</Label>
                <Input value={form.existing_conditions} onChange={set("existing_conditions")} placeholder="e.g. Diabetes, Asthma" className="mt-1 bg-white/70 h-11" />
              </div>
              <div>
                <Label className="text-xs text-rq-muted">Additional Medical Notes</Label>
                <Textarea value={form.medical_notes} onChange={set("medical_notes")} placeholder="Any important medical information..." className="mt-1 bg-white/70" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="font-semibold text-rq-navy flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-rq-primary" /> Emergency Contact
            </p>
            <div className="space-y-3">
              <Input value={form.contact_name} onChange={set("contact_name")} placeholder="Contact name" className="bg-white/70 h-11" />
              <Input value={form.contact_phone} onChange={set("contact_phone")} placeholder="Contact phone number" className="bg-white/70 h-11" />
            </div>
          </GlassCard>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={handleSave} loading={saving}>Continue</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}