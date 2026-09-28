import React from "react";

/**
 * Shared selectable tile for single/multi-select option groups (symptoms,
 * severity, patient condition, voice language, etc.). Caller owns state.
 */
const TONES = {
  primary: "border-rq-primary bg-rq-primary/10 text-rq-primary",
  danger: "border-rq-red bg-rq-red/10 text-rq-red",
  success: "border-rq-success bg-rq-success/10 text-rq-success",
  warning: "border-rq-warning bg-rq-warning/10 text-amber-600",
};

export default function SelectableBox({ icon: Icon, label, selected, onClick, tone = "primary", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-sm font-medium min-h-[48px] transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-primary/30 ${
        selected ? `${TONES[tone] || TONES.primary} shadow-sm` : "border-border bg-white/60 text-rq-navy"
      } ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="text-left leading-tight">{label}</span>
    </button>
  );
}