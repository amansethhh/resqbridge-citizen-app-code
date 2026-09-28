import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Users, Clock, ShieldCheck, Camera, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppLogo from "@/components/resqbridge/AppLogo";
import GlassCard from "@/components/resqbridge/GlassCard";
import StatusBadge from "@/components/resqbridge/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getHistory } from "@/services/emergencyService";
import { listContacts } from "@/services/familyService";
import { emergencyTypeById } from "@/constants/emergencyTypes";
import SettingsPanel from "@/components/resqbridge/SettingsPanel";

export default function ProfileHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const initialTab = new URLSearchParams(window.location.search).get("tab") || "profile";
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    base44.auth.me().then(setUser);
    getHistory().then(setHistory);
    listContacts().then(setContacts);
  }, []);

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-4">
        <AppLogo size="sm" />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden relative flex-shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-rq-primary font-bold text-xl">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-lg text-rq-navy">{user?.full_name || "Citizen"}</p>
          <p className="text-xs text-rq-muted">{user?.phone}</p>
          <p className="text-xs text-rq-muted">{user?.email}</p>
        </div>
        <button onClick={() => navigate("/profile-setup")} className="text-sm font-semibold text-rq-primary flex items-center gap-1 bg-rq-primary/10 px-3 py-1.5 rounded-full">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <GlassCard className="text-center !p-2.5">
          <Users className="w-4 h-4 text-rq-primary mx-auto mb-1" />
          <p className="text-lg font-extrabold text-rq-navy">{contacts.length}</p>
          <p className="text-[10px] text-rq-muted">Family</p>
        </GlassCard>
        <GlassCard className="text-center !p-2.5">
          <Clock className="w-4 h-4 text-rq-primary mx-auto mb-1" />
          <p className="text-lg font-extrabold text-rq-navy">{history.length}</p>
          <p className="text-[10px] text-rq-muted">Cases</p>
        </GlassCard>
        <GlassCard className="text-center !p-2.5">
          <ShieldCheck className="w-4 h-4 text-rq-primary mx-auto mb-1" />
          <p className="text-lg font-extrabold text-rq-navy">12 min</p>
          <p className="text-[10px] text-rq-muted">Avg. Response</p>
        </GlassCard>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <TabsList className="grid grid-cols-4 bg-white/60 rounded-2xl p-1">
          <TabsTrigger value="profile" className="rounded-xl text-xs">Profile</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl text-xs">History</TabsTrigger>
          <TabsTrigger value="medical" className="rounded-xl text-xs">Medical</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl text-xs">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-2.5">
          <GlassCard className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-rq-muted" />
            <p className="text-sm text-rq-navy">Gender: {user?.gender || "-"}</p>
          </GlassCard>
          <GlassCard className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rq-muted" />
            <p className="text-sm text-rq-navy">Date of Birth: {user?.date_of_birth || "-"}</p>
          </GlassCard>
          <button onClick={() => navigate("/family")} className="w-full">
            <GlassCard className="flex items-center justify-between">
              <span className="text-sm font-semibold text-rq-navy">Manage Family Contacts</span>
              <Users className="w-4 h-4 text-rq-primary" />
            </GlassCard>
          </button>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <p className="font-semibold text-rq-navy mb-2">Emergency History</p>
          <div className="space-y-2.5">
            {history.map((h) => {
              const typeInfo = emergencyTypeById(h.type);
              return (
                <GlassCard key={h.id} onClick={() => navigate(`/emergency/handover?id=${h.id}`)} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rq-success/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-rq-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-rq-navy">{typeInfo?.label}</p>
                    <p className="text-xs text-rq-muted">{h.hospital_name || "—"} · {new Date(h.created_date).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge variant="success">Completed</StatusBadge>
                </GlassCard>
              );
            })}
            {history.length === 0 && <p className="text-sm text-rq-muted text-center py-8">No completed emergencies yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="medical" className="mt-4 space-y-2.5">
          <GlassCard><p className="text-xs text-rq-muted">Blood Group</p><p className="font-semibold text-rq-navy">{user?.blood_group || "Not set"}</p></GlassCard>
          <GlassCard><p className="text-xs text-rq-muted">Known Allergies</p><p className="font-semibold text-rq-navy">{user?.allergies || "None specified"}</p></GlassCard>
          <GlassCard><p className="text-xs text-rq-muted">Existing Conditions</p><p className="font-semibold text-rq-navy">{user?.existing_conditions || "None specified"}</p></GlassCard>
          <GlassCard><p className="text-xs text-rq-muted">Notes</p><p className="font-semibold text-rq-navy">{user?.medical_notes || "—"}</p></GlassCard>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}