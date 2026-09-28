import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getActiveEmergency } from "@/services/emergencyService";
import { getUnreadCount } from "@/services/notificationService";
import { base44 } from "@/api/base44Client";

// Holds cross-screen application state: the in-progress emergency draft id,
// the currently active emergency (if any), and unread notification count.
// UI components read/write this instead of duplicating state per screen.
const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [draftId, setDraftId] = useState(() => sessionStorage.getItem("rq_draft_id") || null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ready, setReady] = useState(false);

  const refreshActive = useCallback(async () => {
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) return;
      const active = await getActiveEmergency();
      setActiveEmergency(active);
    } catch {
      // not authenticated yet — ignore
    }
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) return;
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([refreshActive(), refreshUnread()]);
      setReady(true);
    })();
  }, [refreshActive, refreshUnread]);

  const setDraft = useCallback((id) => {
    setDraftId(id);
    if (id) sessionStorage.setItem("rq_draft_id", id);
    else sessionStorage.removeItem("rq_draft_id");
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        draftId,
        setDraft,
        activeEmergency,
        setActiveEmergency,
        refreshActive,
        unreadCount,
        refreshUnread,
        ready,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error("useEmergency must be used within EmergencyProvider");
  return ctx;
}