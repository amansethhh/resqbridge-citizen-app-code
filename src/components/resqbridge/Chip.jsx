import React from "react";
import {
  HeartPulse,
  Wind,
  Droplet,
  Thermometer,
  Brain,
  BedDouble,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";

const ICON_MAP = {
  HeartPulse,
  Wind,
  Droplet,
  Thermometer,
  Brain,
  BedDouble,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  UserX,
};

export default function Chip({ label, icon, selected, onClick, tone = "primary", className = "" }) {
  const Icon = icon ? ICON_MAP[icon] : null;
  const tones = {
    primary: selected ? "border-rq-primary bg-rq-primary/10 text-rq-primary" : "border-border bg-white/70 text-rq-navy",
    danger: selected ? "border-rq-red bg-rq-red/10 text-rq-red" : "border-border bg-white/70 text-rq-navy",
  };
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${tones[tone]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}