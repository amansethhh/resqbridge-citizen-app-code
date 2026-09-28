import React from "react";

/**
 * Compact mobile progress indicator ("Step X of Y" + segmented bar).
 * Replaces the wide desktop stepper on phone screens.
 */
export default function MobileProgress({ current, total, label }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-rq-muted uppercase tracking-wide">{label}</span>
        <span className="text-xs font-bold text-rq-primary">Step {current} of {total}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < current ? "bg-rq-primary" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}