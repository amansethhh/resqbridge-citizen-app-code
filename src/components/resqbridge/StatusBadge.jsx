import React from "react";

const TONES = {
  success: "text-rq-success",
  warning: "text-amber-600",
  danger: "text-rq-red",
  info: "text-rq-primary",
  neutral: "text-slate-500",
};

const TINTS = {
  success: "rgba(34,160,90,0.12)",
  warning: "rgba(245,158,11,0.14)",
  danger: "rgba(226,54,54,0.12)",
  info: "rgba(29,111,232,0.12)",
  neutral: "rgba(100,116,139,0.12)",
};

export default function StatusBadge({ children, variant = "neutral", dot = true, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold rq-glass-subtle ${TONES[variant]} ${className}`}
      style={{ backgroundColor: TINTS[variant] }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}