import React from "react";

/**
 * Premium glass icon container — frosted squircle with inner highlight and
 * soft shadow. Use for feature/quick-action icons to give consistent depth
 * without making the interface noisy.
 */
const SIZES = {
  sm: { box: "w-9 h-9 rounded-xl", icon: "w-4 h-4" },
  md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
  lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
};

const TONES = {
  primary: "text-rq-primary",
  red: "text-rq-red",
  success: "text-rq-success",
  cyan: "text-rq-cyan",
  navy: "text-rq-navy",
  amber: "text-amber-500",
  violet: "text-violet-500",
};

export default function IconBadge({ icon: Icon, tone = "primary", size = "md", className = "" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={`rq-icon-badge flex items-center justify-center flex-shrink-0 ${s.box} ${className}`}>
      {Icon && <Icon className={`${s.icon} ${TONES[tone] || TONES.primary}`} strokeWidth={2.2} />}
    </div>
  );
}