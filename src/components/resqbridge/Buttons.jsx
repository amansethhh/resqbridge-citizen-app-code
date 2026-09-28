import React from "react";
import { Loader2 } from "lucide-react";

/**
 * ResQBridge button system — depth-graded to match the approved SOS control.
 * Level 3 (3D gradient): PrimaryButton, DangerButton, SuccessButton
 * Level 2 (frosted glass): SecondaryButton
 * Level 1 (flat/ghost): GhostButton
 * Icon-only: IconButton
 */

export function PrimaryButton({ children, loading, disabled, className = "", icon: Icon, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-white rq-btn-primary flex items-center justify-center gap-2 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-primary/40 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : Icon ? <Icon className="w-5 h-5" /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", icon: Icon, ...props }) {
  return (
    <button
      className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-rq-navy rq-btn-glass flex items-center justify-center gap-2 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-primary/30 disabled:opacity-50 ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}

export function DangerButton({ children, loading, disabled, className = "", icon: Icon, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-white rq-btn-danger flex items-center justify-center gap-2 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-red/40 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : Icon ? <Icon className="w-5 h-5" /> : null}
      {children}
    </button>
  );
}

export function SuccessButton({ children, loading, disabled, className = "", icon: Icon, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-white rq-btn-success flex items-center justify-center gap-2 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-success/40 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : Icon ? <Icon className="w-5 h-5" /> : null}
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full h-12 rounded-2xl font-semibold text-rq-navy flex items-center justify-center gap-2 transition-colors hover:text-rq-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-primary/30 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, className = "", ...props }) {
  return (
    <button
      className={`w-10 h-10 rounded-full rq-glass flex items-center justify-center text-rq-navy shadow-sm active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rq-primary/30 ${className}`}
      {...props}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}