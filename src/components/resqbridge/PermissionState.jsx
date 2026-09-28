import React from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { PrimaryButton } from "./Buttons";

// Reusable states for camera / mic / location permission flows.
export default function PermissionState({ state, onRequest, deniedHint, icon: Icon = ShieldAlert }) {
  if (state === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <Loader2 className="w-8 h-8 text-rq-primary animate-spin" />
        <p className="text-sm text-rq-muted">Requesting permission…</p>
      </div>
    );
  }
  if (state === "denied" || state === "unavailable") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-rq-red/10 flex items-center justify-center">
          <Icon className="w-7 h-7 text-rq-red" />
        </div>
        <p className="font-semibold text-rq-navy">
          {state === "denied" ? "Permission denied" : "Not available on this device"}
        </p>
        <p className="text-sm text-rq-muted max-w-xs">
          {deniedHint || "Enable this permission in your browser or device settings, then try again."}
        </p>
        {state === "denied" && (
          <PrimaryButton onClick={onRequest} className="max-w-[200px]">
            Try Again
          </PrimaryButton>
        )}
      </div>
    );
  }
  return null;
}