import React from "react";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({ title, actionLabel, onAction, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-lg font-bold text-rq-navy">{title}</h2>
      {actionLabel && (
        <button onClick={onAction} className="text-sm font-semibold text-rq-primary flex items-center gap-0.5">
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}