import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * Reusable glass list row with leading icon, title, subtitle and trailing
 * element. Used for notification cards, history items, family contacts, etc.
 */
export default function GlassListItem({
  icon: Icon,
  iconClassName = "bg-rq-primary/10 text-rq-primary",
  title,
  subtitle,
  trailing,
  onClick,
  chevron = false,
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rq-glass-subtle rounded-2xl p-3 ${
        onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""
      } ${className}`}
    >
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClassName}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-rq-navy text-sm truncate">{title}</p>}
        {subtitle && <p className="text-xs text-rq-muted truncate mt-0.5">{subtitle}</p>}
      </div>
      {trailing}
      {chevron && <ChevronRight className="w-4 h-4 text-rq-muted flex-shrink-0" />}
    </div>
  );
}